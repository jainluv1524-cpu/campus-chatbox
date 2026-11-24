import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import router from './router';

const root = createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <App />
    <router />
  </Provider>
);