#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// Standard library imports.
use std::{
    convert::Infallible,
    net::SocketAddr,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
};

// Third-party imports.
use dashmap::DashMap;
use hyper::{
    Body, Request, Response, Server, StatusCode,
    service::{make_service_fn, service_fn},
};
use serde::{Deserialize, Serialize};
use tokio::sync::oneshot;
use tauri::{Manager, Listener, Emitter};

static MAIN_WINDOW_NAME: &str = "main";

/// Payload sent from Rust to the frontend for each HTTP request.
#[derive(Serialize)]
struct HttpRequestEvent {
    method: String,
    path: String,
    headers: Vec<(String, String)>,
    body: String,
    request_id: u64,
}

/// Expected payload sent back from the frontend.
#[derive(Deserialize, Debug)]
struct TsResponse {
    request_id: u64,
    status: u16,
    body: String,
}

/// A type alias for our concurrent map of pending responses.
type PendingMap = DashMap<u64, oneshot::Sender<TsResponse>>;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(move |app| {
            // Retrieve the main window (we only want to communicate with this window).
            let main_window = app.get_webview_window(MAIN_WINDOW_NAME)
                .expect("Main window not found");

            // Shared, concurrent map to store pending responses.
            let pending_requests: Arc<PendingMap> = Arc::new(DashMap::new());
            // Atomic counter to generate unique request IDs.
            let request_counter = Arc::new(AtomicU64::new(1));

            {
                // Set up a listener for "ts-response" events coming from the frontend.
                // We attach the listener to the main window (not globally) for security.
                let pending_requests = pending_requests.clone();
                main_window.listen("ts-response", move |event| {
                    let payload = event.payload();
                    if payload.len() > 0 {
                        match serde_json::from_str::<TsResponse>(payload) {
                            Ok(ts_response) => {
                                if let Some((req_id, tx)) = pending_requests.remove(&ts_response.request_id) {
                                    if let Err(err) = tx.send(ts_response) {
                                        eprintln!(
                                            "Failed to send response via oneshot channel for request {}: {:?}",
                                            req_id, err
                                        );
                                    }
                                } else {
                                    eprintln!("Received ts-response for unknown request_id: {}", ts_response.request_id);
                                }
                            }
                            Err(err) => {
                                eprintln!("Failed to parse ts-response payload: {:?}", err);
                            }
                        }
                    } else {
                        eprintln!("ts-response event did not include a payload");
                    }
                });
            }

            // Spawn a separate thread to run our asynchronous HTTP server.
            let main_window_clone = main_window.clone();
            let pending_requests_clone = pending_requests.clone();
            let request_counter_clone = request_counter.clone();
            std::thread::spawn(move || {
                // Build a multi-threaded Tokio runtime.
                let rt = tokio::runtime::Builder::new_multi_thread()
                    .enable_all()
                    .build()
                    .expect("Failed to create Tokio runtime");

                rt.block_on(async move {
                    // Bind the Hyper server to 127.0.0.1:3301.
                    let addr: SocketAddr = "127.0.0.1:3301".parse().expect("Invalid socket address");
                    println!("HTTP server listening on http://{}", addr);

                    // Create our Hyper service.
                    let make_svc = make_service_fn(move |_conn| {
                        // Clone handles for each connection.
                        let pending_requests = pending_requests_clone.clone();
                        let main_window = main_window_clone.clone();
                        let request_counter = request_counter_clone.clone();

                        async move {
                            Ok::<_, Infallible>(service_fn(move |req: Request<Body>| {
                                // Clone per-request handles.
                                let pending_requests = pending_requests.clone();
                                let main_window = main_window.clone();
                                let request_counter = request_counter.clone();

                                async move {
                                    // Generate a unique request ID.
                                    let request_id = request_counter.fetch_add(1, Ordering::Relaxed);

                                    // Extract the HTTP method, URI, and headers.
                                    let method = req.method().clone();
                                    let uri = req.uri().clone();
                                    let headers = req.headers().iter()
                                        .map(|(k, v)| (k.to_string(), v.to_str().unwrap_or("").to_string()))
                                        .collect::<Vec<(String, String)>>();

                                    // Read the full request body.
                                    let whole_body = hyper::body::to_bytes(req.into_body()).await.unwrap_or_default();
                                    let body_str = String::from_utf8_lossy(&whole_body).to_string();

                                    // Create a oneshot channel for awaiting the frontend response.
                                    let (tx, rx) = oneshot::channel::<TsResponse>();
                                    pending_requests.insert(request_id, tx);

                                    // Prepare the event payload.
                                    let event_payload = HttpRequestEvent {
                                        method: method.to_string(),
                                        path: uri.to_string(),
                                        headers,
                                        body: body_str,
                                        request_id,
                                    };

                                    // Serialize the payload to JSON.
                                    let event_json = match serde_json::to_string(&event_payload) {
                                        Ok(json) => json,
                                        Err(e) => {
                                            eprintln!("Failed to serialize HTTP event: {:?}", e);
                                            let mut res = Response::new(Body::from("Internal Server Error"));
                                            *res.status_mut() = StatusCode::INTERNAL_SERVER_ERROR;
                                            // Remove pending request since we cannot proceed.
                                            pending_requests.remove(&request_id);
                                            return Ok::<_, Infallible>(res);
                                        }
                                    };

                                    // Emit the "http-request" event to the main window.
                                    if let Err(err) = main_window.emit("http-request", event_json) {
                                        eprintln!("Failed to emit http-request event: {:?}", err);
                                        pending_requests.remove(&request_id);
                                        let mut res = Response::new(Body::from("Internal Server Error"));
                                        *res.status_mut() = StatusCode::INTERNAL_SERVER_ERROR;
                                        return Ok::<_, Infallible>(res);
                                    }

                                    // Wait asynchronously for the frontend's response.
                                    match rx.await {
                                        Ok(ts_response) => {
                                            let mut res = Response::new(Body::from(ts_response.body));
                                            *res.status_mut() = StatusCode::from_u16(ts_response.status)
                                                .unwrap_or(StatusCode::OK);
                                            Ok::<_, Infallible>(res)
                                        }
                                        Err(err) => {
                                            eprintln!("Error awaiting frontend response for request {}: {:?}", request_id, err);
                                            let mut res = Response::new(Body::from("Gateway Timeout"));
                                            *res.status_mut() = StatusCode::GATEWAY_TIMEOUT;
                                            Ok::<_, Infallible>(res)
                                        }
                                    }
                                }
                            }))
                        }
                    });

                    // Build and run the Hyper server.
                    let server = Server::bind(&addr).serve(make_svc);

                    if let Err(e) = server.await {
                        eprintln!("Server error: {}", e);
                    }
                });
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
