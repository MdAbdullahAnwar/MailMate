import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { store } from './store/store';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkFrontendApi = import.meta.env.VITE_CLERK_FRONTEND_API;

if (!PUBLISHABLE_KEY || !clerkFrontendApi) {
  throw new Error('Missing Clerk environment variables');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      frontendApi={clerkFrontendApi}
      routing="path"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <Provider store={store}>
        <App />
      </Provider>
    </ClerkProvider>
  </StrictMode>
);
