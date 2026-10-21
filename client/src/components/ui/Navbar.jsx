import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, LayoutDashboard, LogOut, Compass, Award, Milestone, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';
import Button from './Button';
import Container from './Container';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Career Paths', href: '/#careers' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-color)]/90 backdrop-blur-md border-b border-[var(--border-color)] transition-colors">
      <Container>
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo with New Geometric Symbol */}
          <Logo />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] rounded-md px-1 py-0.5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDark}
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-[var(--highlight-color)]" aria-hidden="true" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-[var(--primary-color)]" aria-hidden="true" />
              )}
            </button>

            {user ? (
              /* Signed In State */
              <div className="flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                    location.pathname === '/dashboard'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/roadmap"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                    location.pathname === '/roadmap'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Milestone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Roadmap</span>
                </Link>
                <Link
                  to="/resources"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                    location.pathname === '/resources'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Resources</span>
                </Link>
                <Link
                  to="/assessment"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                    location.pathname === '/assessment'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Diagnostic</span>
                </Link>
                <Link
                  to="/career"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                    location.pathname === '/career'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Career</span>
                </Link>
                <div className="h-4 w-px bg-[var(--border-color)] mx-1" aria-hidden="true" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="text-xs py-1 px-2.5"
                >
                  <LogOut className="w-3 h-3 mr-1" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            ) : (
              /* Signed Out State */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] px-3 py-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  Login
                </Link>
                <Button to="/register" variant="primary" size="md">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDark}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-[var(--highlight-color)]" aria-hidden="true" />
              ) : (
                <Moon className="w-5 h-5 text-[var(--primary-color)]" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Accessible Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-[var(--border-color)] bg-[var(--surface-color)] px-4 pt-4 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2"
        >
          <nav className="flex flex-col space-y-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/career"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-medium text-sm text-[var(--text-main)] bg-[var(--surface-elevated)] hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[var(--accent-color)]" />
                  <span>Target Career</span>
                </Link>
                <Link
                  to="/assessment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-medium text-sm text-[var(--text-main)] bg-[var(--surface-elevated)] hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4 text-[var(--highlight-color)]" />
                  <span>Diagnostic Assessment</span>
                </Link>
                <Link
                  to="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-medium text-sm text-[var(--text-main)] bg-[var(--surface-elevated)] hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] flex items-center justify-center gap-2"
                >
                  <Milestone className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>Personalized Roadmap</span>
                </Link>
                <Link
                  to="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-medium text-sm text-[var(--text-main)] bg-[var(--surface-elevated)] hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-[var(--accent-color)]" />
                  <span>Curated Resources</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-medium text-sm text-[var(--text-main)] bg-[var(--surface-elevated)] hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--primary-color)]" />
                  <span>Dashboard ({profile?.displayName || user?.displayName || 'User'})</span>
                </Link>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full justify-center text-[var(--danger-color)]"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-medium text-sm text-[var(--text-main)] bg-[var(--surface-elevated)] hover:bg-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  Login
                </Link>
                <Button
                  to="/register"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
