import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from './contexts/AuthContext';
import "./styles.css"; // opcjonalnie
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
      position="top-right"
      toastOptions={{
        success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
         />
    </AuthProvider>
  </React.StrictMode>
);
