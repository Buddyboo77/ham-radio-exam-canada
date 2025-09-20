import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register the service worker for PWA functionality (but not in Capacitor)
if ('serviceWorker' in navigator && import.meta.env.PROD && !(window as any).Capacitor?.isNativePlatform) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
