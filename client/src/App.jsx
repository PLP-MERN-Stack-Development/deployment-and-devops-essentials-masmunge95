import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import PostPage from '@/pages/PostPage';
import { ThemeProvider } from '@/context/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import * as Sentry from '@sentry/react';

export default function App(){
  return (
    <ThemeProvider>
      <HelmetProvider>
        <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/posts/:slug" element={<Layout><PostPage /></Layout>} />
          </Routes>
        </Sentry.ErrorBoundary>
      </HelmetProvider>
    </ThemeProvider>
  );
}
