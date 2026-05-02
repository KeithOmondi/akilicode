import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import the Toaster component
import './index.css';
import App from './App.tsx';
import { store } from './store/store.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {/* 
            Positioning the Toaster here allows it to persist 
            across all routes and state changes.
        */}
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            // You can globally style your Akili Code brand colors here
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);