import Link from 'next/link';

/**
 * Global footer — present on all public pages.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: '0.5rem' }}>
              <div className="nav-logo-icon">⚡</div>
              <span>Digital Heroes</span>
            </div>
            <p>
              Play golf. Win prizes. Change lives. A platform where your passion
              for golf drives real-world charitable impact.
            </p>
          </div>

          {/* Platform */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><Link href="/#how-it-works">How It Works</Link></li>
              <li><Link href="/#prizes">Prize Draws</Link></li>
              <li><Link href="/#pricing">Pricing</Link></li>
              <li><Link href="/auth/signup">Get Started</Link></li>
            </ul>
          </div>

          {/* Impact */}
          <div className="footer-col">
            <h4>Impact</h4>
            <ul>
              <li><Link href="/charities">Our Charities</Link></li>
              <li><Link href="/charities">Donate</Link></li>
              <li><Link href="/#impact">Impact Stories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/support">Support</Link></li>
              <li><Link href="/help">Help Centre</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} Digital Heroes. All rights reserved.</p>
          <p>Made with ❤️ for charitable impact</p>
        </div>
      </div>
    </footer>
  );
}
