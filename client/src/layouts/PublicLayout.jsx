import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import ScrollProgress from '../components/ui/ScrollProgress';

/**
 * Public layout wrapper containing top scroll indicator, skip link, Navbar, main content outlet, and Footer.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-main)] transition-colors duration-150">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Accessible Skip-to-content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-[var(--primary-color)] text-white font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Skip to main content
      </a>

      {/* Global Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main id="main-content" tabIndex="-1" className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
