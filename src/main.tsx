import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import App from './App.tsx';
import './index.css';

// Wrap the App component with BrowserRouter to enable routing
createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
