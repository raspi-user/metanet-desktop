// webEntry.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Typography } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ backgroundColor: 'white', padding: 20 }}>
        <h1 style={{ color: 'black' }}>Test Heading</h1>
        <Typography style={{ color: 'black', fontSize: 24 }}>
          Hello, World!
        </Typography>
      </div>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);