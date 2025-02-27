interface FetchManifestParams {
  domain: string
}

export default async function fetchManifest({
  domain,
}: FetchManifestParams): Promise<any | undefined> {
  try {
    const protocol = domain.startsWith('localhost:') ? 'http' : 'https'
    const url = `${protocol}://${domain}/manifest.json`
    const response = await fetch(url, { method: 'GET' })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(error)
    // Ignore the error as it's not our problem
    return undefined
  }
}
