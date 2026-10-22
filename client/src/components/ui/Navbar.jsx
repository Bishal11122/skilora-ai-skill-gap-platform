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
  User,
  FileText,
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
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
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const publicNavLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Career Paths', href: '/#careers' },
  ];

  const appNavLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Roadmap', href: '/roadmap', icon: Milestone },
    { label: 'Assessment', href: '/assessment', icon: Award },
    { label: 'Practice', href: '/quiz', icon: HelpCircle, matchPrefix: true },
    { label: 'Resources', href: '/resources', icon: BookOpen },
  ];

  const displayName = profile?.displayName || user?.displayName || 'Learner';
  const displayEmail = user?.email || profile?.email || '';
  const userInitials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--surface-color)]/90 backdrop-blur-md border-b border-[var(--border-color)] transition-colors">
      <Container>
        <div className="flex items-center justify-between h-16 sm:h-[68px] gap-4">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Logo size={26} />
          </div>

          {/* Center Navigation */}
          {user ? (
            /* Logged-in Primary App Navigation */
            <nav
              className="hidden md:flex items-center justify-center gap-1 flex-1 max-w-xl mx-auto"
              aria-label="App Navigation"
            >
              {appNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchPrefix
                  ? location.pathname.startsWith(item.href)
                  : location.pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            /* Public Landing Navigation */
            <nav
              className="hidden md:flex items-center justify-center gap-1 flex-1 max-w-md mx-auto"
              aria-label="Public Navigation"
            >
              {publicNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] transition-colors rounded-lg px-3.5 py-1.5 whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Right Actions & Profile */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={isDark}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
              )}
            </button>

            {user ? (
              /* Signed In Profile Pill & Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface-color)] hover:bg-[var(--surface-elevated)] transition-all cursor-pointer ${
                    userDropdownOpen ? 'ring-2 ring-[var(--focus-ring)] border-transparent' : ''
                  }`}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User account menu"
                >
                  <div className="w-6 h-6 rounded-md bg-[var(--primary-color)]/10 text-[var(--primary-color)] flex items-center justify-center font-bold text-[10px]">
                    {userInitials}
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-main)] max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-150 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] shadow-lg py-1.5 z-50 text-xs"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-2 border-b border-[var(--border-color)]">
                      <p className="font-semibold text-[var(--text-main)] truncate">{displayName}</p>
                      {displayEmail && (
                        <p className="text-[11px] text-[var(--text-muted)] truncate">{displayEmail}</p>
                      )}
                    </div>

                    {/* Quick Career Goal */}
                    <div className="p-1">
                      <Link
                        to="/career"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-[var(--accent-color)]" aria-hidden="true" />
                        <span>Target Career Path</span>
                      </Link>

                      <Link
                        to="/resume"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[var(--primary-color)]" aria-hidden="true" />
                        <span>Resume & Skills</span>
                      </Link>

                      <Link
                        to="/settings"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out Divider & Button */}
                    <div className="pt-1 mt-1 border-t border-[var(--border-color)] px-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public Auth Buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors"
                >
                  Sign In
                </Link>
                <Button to="/register" variant="primary" size="sm">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Theme Switch */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-[var(--border-color)] transition-colors"
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg text-[var(--text-main)] hover:bg-[var(--surface-elevated)] border border-[var(--border-color)] transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden border-t border-[var(--border-color)] bg-[var(--surface-color)] px-4 py-4 space-y-3 shadow-lg"
        >
          {user ? (
            <div className="space-y-3">
              <div className="px-3 py-2 rounded-lg bg-[var(--surface-elevated)]">
                <p className="text-xs font-semibold text-[var(--text-main)]">{displayName}</p>
                {displayEmail && <p className="text-[11px] text-[var(--text-muted)]">{displayEmail}</p>}
              </div>

              <div className="space-y-1">
                {appNavLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.matchPrefix
                    ? location.pathname.startsWith(item.href)
                    : location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="pt-2 border-t border-[var(--border-color)] space-y-1">
                  <Link
                    to="/career"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]"
                  >
                    <Compass className="w-4 h-4 text-[var(--accent-color)]" />
                    <span>Target Career Path</span>
                  </Link>

                  <Link
                    to="/resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]"
                  >
                    <FileText className="w-4 h-4 text-[var(--primary-color)]" />
                    <span>Resume & Skills</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </Link>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-rose-600 hover:text-rose-700"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                {publicNavLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
                <Button
                  to="/login"
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Button>
                <Button
                  to="/register"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
