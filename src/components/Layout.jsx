'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { I } from './Icons';

export function TopBar() {
  return (
    <div className="topbar">
      <div className="container">
        <div className="left">
          <span>🇳🇬 Ibadan · Lagos</span>
          <span className="sep">|</span>
          <span>New AI cohort starts June 3 — limited seats</span>
        </div>
        <div className="right">
          <a href="#"><I.Phone size={12} /> +234 810 000 0000</a>
          <a href="#">Support</a>
          <a href="#">Partners</a>
        </div>
      </div>
    </div>
  );
}

const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Courses',   href: '/courses' },
  { label: 'Programs',  href: '/programs' },
  { label: 'Udemy',     href: '/udemy' },
  { label: 'Reviews',   href: '/reviews' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const pathname = usePathname();

  const checkAuth = React.useCallback(() => {
    const token = localStorage.getItem('payload-token');
    setIsAuthenticated(!!token);
  }, []);

  React.useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  const close = () => setIsMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('payload-token');
    localStorage.removeItem('user-email');
    setIsAuthenticated(false);
    close();
    window.location.href = '/';
  };

  return (
    <header className={`header${isMenuOpen ? ' menu-is-open' : ''}`}>
      <div className="container">
        <Link href="/" className="brand" aria-label="TECHFRONT HUB">
          <span className="brand-mark">TF</span>
          <span className="brand-name">TECHFRONT<span className="dot">.</span>HUB</span>
        </Link>

        {!isAuthenticated && (
          <nav className={`nav ${isMenuOpen ? 'mobile-open' : ''}`}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
            ))}
            <div className="mobile-only-cta">
              <Link href="/student/login" className="btn btn-ghost btn-sm" onClick={close}>Login</Link>
            </div>
          </nav>
        )}

        {isAuthenticated && (
          <nav className={`nav ${isMenuOpen ? 'mobile-open' : ''}`}>
            <Link href="/student/dashboard" onClick={close}>Dashboard</Link>
            <Link href="/student/dashboard/courses" onClick={close}>My Courses</Link>
            <Link href="/courses" onClick={close}>Explore</Link>
            <div className="mobile-only-cta">
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </div>
          </nav>
        )}

        <div className="header-cta">
          {!isAuthenticated && (
            <>
              <Link href="/student/login" className="btn btn-ghost btn-sm hide-mobile">Login</Link>
              <a href="/#enroll" className="btn btn-primary btn-sm">Enroll Now <I.Arrow size={14} /></a>
            </>
          )}
          {isAuthenticated && (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm hide-mobile">Logout</button>
          )}
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
            {isMenuOpen ? <I.X size={24}/> : <I.Menu size={24}/>}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand" style={{color: "#fff"}}>
              <span className="brand-mark">TF</span>
              <span className="brand-name">TECHFRONT<span className="dot">.</span>HUB</span>
            </Link>
            <p className="about-copy">Nigeria's career-focused tech academy — cohort bootcamps, 1-on-1 coaching and corporate training for the next wave of builders.</p>
            <div className="footer-contact" style={{fontSize: 13, display: "flex", flexDirection: "column", gap: 8}}>
              <span style={{display: "flex", gap: 8, alignItems: "center"}}><I.MapPin size={14}/> Bodija, Ibadan · Lekki, Lagos</span>
              <a href="mailto:hello@techfronthub.ng" style={{display: "flex", gap: 8, alignItems: "center", color: "inherit", textDecoration: "none"}}><I.Mail size={14}/> hello@techfronthub.ng</a>
              <a href="tel:+2348100000000" style={{display: "flex", gap: 8, alignItems: "center", color: "inherit", textDecoration: "none"}}><I.Phone size={14}/> +234 810 000 0000</a>
            </div>
            <div className="socials">
              <a href="#" aria-label="Facebook"><I.FB/></a>
              <a href="#" aria-label="X"><I.TW/></a>
              <a href="#" aria-label="Instagram"><I.IG/></a>
              <a href="#" aria-label="LinkedIn"><I.IN/></a>
              <a href="#" aria-label="YouTube"><I.YT/></a>
            </div>
          </div>
          <div>
            <h5>Learn</h5>
            <ul>
              <li><Link href="/courses">All courses</Link></li>
              <li><Link href="/programs">Bootcamps</Link></li>
              <li><a href="#">Private lessons</a></li>
              <li><a href="#">Tech for kids</a></li>
              <li><Link href="/student/login">Student login</Link></li>
            </ul>
          </div>
          <div>
            <h5>Business</h5>
            <ul>
              <li><a href="#">Corporate training</a></li>
              <li><a href="#">Team assessments</a></li>
              <li><a href="#">Partner with us</a></li>
              <li><a href="#">Hire our graduates</a></li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li><Link href="/courses">Course catalog</Link></li>
              <li><a href="#">Blog</a></li>
              <li><Link href="/udemy">Free mini-courses</Link></li>
              <li><a href="#">Templates & guides</a></li>
              <li><a href="#">Help center</a></li>
            </ul>
          </div>
          <div>
            <h5>Newsletter</h5>
            <p style={{fontSize: 13, margin: "0 0 12px", color: "#9ca3af"}}>Monthly digest of new cohorts, free workshops and scholarship slots.</p>
            <form className="newsletter" onSubmit={e => {e.preventDefault(); alert("Subscribed — check your inbox.")}}>
              <input type="email" placeholder="you@work.com" required/>
              <button type="submit" className="btn btn-primary btn-sm">Join</button>
            </form>
            <div style={{fontSize: 11, color: "#6b7280", marginTop: 10}}>We never share your email. Unsubscribe anytime.</div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 TECHFRONT HUB. RC 1234567. All rights reserved.</div>
          <div className="links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="#">Cookies</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
