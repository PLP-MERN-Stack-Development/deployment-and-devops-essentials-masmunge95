import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.jsx'
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react'
import * as Sentry from "@sentry/react"; // Import Sentry

// Sentry Initialization - Must be the first thing in your file
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN_CLIENT, // Use the DSN from your environment variables
  integrations: [
    Sentry.browserTracingIntegration(), // Trace browser navigation and route changes
    Sentry.replayIntegration(), // Capture session replays for better context
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  // Session Replay
  replaysSessionSampleRate: 0.1, // Capture 10% of all sessions
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions that have an error
});

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

function ClerkProviderWithNavigate({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: { colorPrimary: '#4F46E5' },
        layout: { socialButtonsPlacement: 'bottom' }
      }}
      navigate={(to) => navigate(to)}
    >
      {children}
    </ClerkProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProviderWithNavigate>
        <App />
      </ClerkProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
)
