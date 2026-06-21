import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import Modal from 'react-modal';
import { store } from './store';
import App from './App';
import './index.css';

// Set app element for react-modal accessibility
Modal.setAppElement('#root');

// Create root and render app
const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);