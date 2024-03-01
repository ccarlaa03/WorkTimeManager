import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import axios from 'axios';


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const container = document.getElementById('root');
const root = createRoot(container);


root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
