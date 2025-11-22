import './HeroSection.css'

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="flame-background"></div>

      <div className="hero-content">
        <div className="jail-cell-container">
          <div className="jail-bars">
            <div className="bar broken-left"></div>
            <div className="bar"></div>
            <div className="bar broken-right"></div>
            <div className="bar"></div>
          </div>
        </div>

        <div className="hero-text">
          <h1 className="hero-title">
            Break Free from <span className="highlight">Cable TV</span>
          </h1>
          <p className="hero-subtitle">
            Unlimited streaming with 20,000+ live channels, 60,000+ movies & shows
          </p>

          <div className="firestick-device">
            <div className="device-glow"></div>
            <div className="device-body">
              <div className="device-logo">Fire TV</div>
              <div className="device-hdmi"></div>
            </div>
          </div>

          <div className="hero-cta">
            <button className="cta-button primary" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              Get Started Now
            </button>
            <button className="cta-button secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>

          <div className="hero-badges">
            <div className="badge">
              <span className="badge-icon">✓</span>
              <span>No Contract</span>
            </div>
            <div className="badge">
              <span className="badge-icon">✓</span>
              <span>7-Day Guarantee</span>
            </div>
            <div className="badge">
              <span className="badge-icon">✓</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
