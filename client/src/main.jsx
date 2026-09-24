// imports -> react, the App component n our css
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// find <div id="root"> in index.html n put our whole App inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
