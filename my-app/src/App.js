import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, createTheme, ThemeProvider } from '@mui/material';
import Home from './components/Home';
import Map from './components/Map';
import AI from './components/AI';
import Reviews from './components/Reviews';
import './App.css';

// Define a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff0000', // Red color
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                Halal Bites
              </Typography>
              <Button color="inherit" component={Link} to="/home">Home</Button>
              <Button color="inherit" component={Link} to="/map">Map</Button>
              <Button color="inherit" component={Link} to="/ai">AI</Button>
              <Button color="inherit" component={Link} to="/reviews">Reviews</Button>
            </Toolbar>
          </AppBar>
          <Container style={{ marginTop: '20px' }}>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<Map />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/reviews" element={<Reviews />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
