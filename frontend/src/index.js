import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Login from './Login'
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/fileUploader" element={<App />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>;
  </React.StrictMode >,
  document.getElementById('root')
);
