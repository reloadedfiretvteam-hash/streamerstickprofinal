import './FeaturesSection.css'

function FeaturesSection() {
  const features = [
    {
      icon: '📺',
      title: '20,000+ Live Channels',
      description: 'Watch live TV from around the world including sports, news, entertainment, and more'
    },
    {
      icon: '🎬',
      title: '60,000+ Movies & Shows',
      description: 'Unlimited access to the latest movies, TV series, and premium content on demand'
    },
    {
      icon: '🏆',
      title: 'All Sports & PPV',
      description: 'Never miss a game with live sports coverage and pay-per-view events included'
    },
    {
      icon: '📱',
      title: 'Multi-Device Support',
      description: 'Stream on Fire TV Stick, Smart TV, Android, iOS, and more devices simultaneously'
    },
    {
      icon: '⚡',
      title: 'Instant Activation',
      description: 'Get started immediately with instant account setup and no waiting time'
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: '99.9% uptime with encrypted connections for your privacy and security'
    }
  ]

  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="section-title">Why Choose StreamStick Pro?</h2>
          <p className="section-subtitle">
            Everything you need for unlimited entertainment, all in one place
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
