import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Compass,
  Award,
  Milestone,
  BookOpen,
  HelpCircle,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';
import Button from './Button';
import Container from './Container';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu and dropdown on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setMoreDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Career Paths', href: '/#careers' },
  ];

  // Secondary authenticated tools in dropdown
  const secondaryNavItems = [
    { label: 'Target Career', href: '/career', icon: Compass },
    { label: 'Diagnostic Assessment', href: '/assessment', icon: Award },
    { label: 'Practice Quizzes', href: '/quiz', icon: HelpCircle },
    { label: 'Curated Resources', href: '/resources', icon: BookOpen },
    { label: 'Account Settings', href: '/settings', icon: Settings },
  ];

  const isMoreActive = secondaryNavItems.some(
    (item) => location.pathname === item.href || (item.href === '/quiz' && location.pathname.startsWith('/quiz'))
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-color)]/90 backdrop-blur-md border-b border-[var(--border-color)] transition-colors">
      <Container>
        <div className="flex items-center justify-between h-[72px] sm:h-20 gap-4">
          {/* Left: Compact Skillora AI Brand Logo */}
          <div className="flex items-center shrink-0">
            <Logo size={28} />
          </div>

          {/* Middle: Centered Desktop Primary Navigation Links */}
          <nav
            className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 max-w-md mx-auto"
            aria-label="Primary Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] transition-colors rounded-lg px-3.5 py-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Desktop Actions & Theme Toggle */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDark}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[var(--highlight-color)]" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--primary-color)]" aria-hidden="true" />
              )}
            </button>

            {user ? (
              /* Signed In State */
              <div className="flex items-center gap-1.5">
                {/* Primary App Section: Dashboard */}
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                    location.pathname === '/dashboard'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>

                {/* Primary App Section: Roadmap */}
                <Link
                  to="/roadmap"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                    location.pathname === '/roadmap'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Milestone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Roadmap</span>
                </Link>

                {/* Tools & Secondary Sections Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setMoreDropdownOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-lg whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
                      isMoreActive || moreDropdownOpen
                        ? 'bg-[var(--surface-elevated)] text-[var(--primary-color)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                    }`}
                    aria-expanded={moreDropdownOpen}
                    aria-haspopup="true"
                    aria-label="More navigation links"
                  >
                    <span>More</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        moreDropdownOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Accessible Floating Dropdown Menu */}
                  {moreDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="px-3 py-1.5 mb-1 border-b border-[var(--border-color)]">
                        <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          Learning Workspace
                        </p>
                      </div>

                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                          location.pathname === item.href ||
                          (item.href === '/quiz' && location.pathname.startsWith('/quiz'));
                        return (
                          <Link
                            key={item.label}
                            to={item.href}
                            role="menuitem"
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="h-4 w-px bg-[var(--border-color)] mx-1" aria-hidden="true" />

                {/* Sign Out Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={logout}
                  className="text-xs py-1.5 px-2.5 whitespace-nowrap"
                >
                  <LogOut className="w-3 h-3 mr-1" aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            ) : (
              /* Signed Out State */
              <div className="flex items-center gap-2 xl:gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] px-3 py-2 rounded-xl transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  Login
                </Link>
                <Button to="/register" variant="primary" size="md" className="whitespace-nowrap">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Actions: Theme Toggle & Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-[var(--border-color)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDark}
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-[var(--highlight-color)]" aria-hidden="true" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-[var(--primary-color)]" aria-hidden="true" />
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
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden border-t border-[var(--border-color)] bg-[var(--surface-color)] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2"
        >
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-1.5">
            {user ? (
              <>
                <div className="px-3 py-1 mb-1">
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    Signed in as <span className="text-[var(--text-main)]">{profile?.displayName || user?.displayName || 'User'}</span>
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2.5 ${
                    location.pathname === '/dashboard'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2.5 ${
                    location.pathname === '/roadmap'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Milestone className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
                  <span>Personalized Roadmap</span>
                </Link>
                <Link
                  to="/career"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2.5 ${
                    location.pathname === '/career'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
                  <span>Target Career</span>
                </Link>
                <Link
                  to="/assessment"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2.5 ${
                    location.pathname === '/assessment'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[var(--highlight-color)] shrink-0" />
                  <span>Diagnostic Assessment</span>
                </Link>
                <Link
                  to="/quiz"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2.5 ${
                    location.pathname.startsWith('/quiz')
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
                  <span>Practice Quizzes</span>
                </Link>
                <Link
                  to="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2.5 ${
                    location.pathname === '/resources'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[var(--accent-color)] shrink-0" />
                  <span>Curated Resources</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2 px-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2.5 ${
                    location.pathname === '/settings'
                      ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                      : 'text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[var(--primary-color)] shrink-0" />
                  <span>Account Settings</span>
                </Link>
                <div className="pt-2">
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
                </div>
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

