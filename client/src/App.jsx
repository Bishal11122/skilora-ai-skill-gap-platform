import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import PublicLayout from './layouts/PublicLayout';
import LandingPage from './pages/LandingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import SetupCheck from './pages/SetupCheck';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Phase 4 Auth Placeholders */}
            <Route
              path="/login"
              element={
                <PlaceholderPage
                  title="Sign In"
                  message="Sign-in is not available yet. Authentication is built in Phase 4."
                  badge="Authentication (Phase 4)"
                />
              }
            />
            <Route
              path="/register"
              element={
                <PlaceholderPage
                  title="Create an Account"
                  message="Account registration is not available yet and authentication is planned for Phase 4."
                  badge="Registration (Phase 4)"
                />
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PlaceholderPage
                  title="Password Recovery"
                  message="Password recovery is not available yet and belongs to the authentication phase."
                  badge="Security (Phase 4)"
                />
              }
            />

            {/* Live Setup & Health Check */}
            <Route path="/setup-check" element={<SetupCheck />} />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
