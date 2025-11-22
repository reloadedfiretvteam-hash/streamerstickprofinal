import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">StreamStick Pro</h3>
            <p className="footer-text">
              Your ultimate IPTV solution for Fire TV Stick and more. Stream unlimited content worldwide.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="/admin">Admin Panel</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Setup Guide</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} StreamStick Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
