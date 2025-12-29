import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'
import StoreContextProvider from './context/StoreContext.jsx';

const GOOGLE_CLIENT_ID = "722468959436-afeo6bfeo3rhbg7e0kv50c1sm8fjnpl0.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <StoreContextProvider>
        <App />
        </StoreContextProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)
