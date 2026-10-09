import { Link } from 'react-router-dom';
import Container from './Container';
import Logo from './Logo';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Global Skilora Footer with academic credits and required disclaimer.
 */
export default function Footer() {
  return (
    <footer className="w-full bg-[var(--surface-color)] border-t border-[var(--border-color)] py-12 sm:py-16 transition-colors">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Value Proposition */}
          <div className="md:col-span-2 space-y-3">
            <Logo />
            <p className="text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
              Skilora helps students, graduates, and career changers understand their current technical skills, identify gaps against industry requirements, and follow a structured roadmap.
            </p>
            <p className="text-xs font-medium text-[var(--accent-color)]">
              Your skills. Your next move.
            </p>
            <div className="pt-2 text-xs text-[var(--text-muted)] space-y-1">
              <p>
                <strong className="text-[var(--text-main)]">Academic Project:</strong> BCA (AIML) 5th Semester Minor Project
              </p>
              <p>
                <strong className="text-[var(--text-main)]">Institution:</strong> JNCT Professional University, Bhopal
              </p>
              <p>
                <strong className="text-[var(--text-main)]">Authors:</strong> Bishal Sharma and Lakshya Deep
              </p>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)] mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <a href="/#features" className="hover:text-[var(--text-main)] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-[var(--text-main)] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#careers" className="hover:text-[var(--text-main)] transition-colors">
                  Career Paths
                </a>
              </li>
              <li>
                <Link to="/setup-check" className="hover:text-[var(--text-main)] transition-colors">
                  System Health Check
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)] mb-3">
              Account
            </h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <Link to="/login" className="hover:text-[var(--text-main)] transition-colors">
                  Sign In (Phase 4)
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[var(--text-main)] transition-colors">
                  Register (Phase 4)
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-[var(--text-main)] transition-colors">
                  Password Reset
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Required Honest Academic Disclaimer */}
        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p className="text-center sm:text-left italic max-w-xl">
            &ldquo;AI-generated analysis is guidance for learning. It does not guarantee jobs or employability.&rdquo;
          </p>
          <p className="text-center sm:text-right">
            &copy; {CURRENT_YEAR} Skilora. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
