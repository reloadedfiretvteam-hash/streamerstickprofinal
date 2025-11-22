import { useNavigate } from 'react-router-dom'
import './PricingSection.css'

function PricingSection({ plans }) {
  const navigate = useNavigate()

  const handleSelectPlan = (planId) => {
    navigate(`/checkout/${planId}`)
  }

  if (!plans || plans.length === 0) {
    return null
  }

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="section-subtitle">
            Flexible pricing plans for every budget. All plans include our full channel lineup.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.is_popular ? 'popular' : ''}`}
            >
              {plan.is_popular && (
                <div className="popular-badge">Most Popular</div>
              )}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">{parseFloat(plan.price).toFixed(2)}</span>
                  <span className="period">/{plan.billing_period}</span>
                </div>
              </div>

              <ul className="plan-features">
                {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className="plan-button"
                onClick={() => handleSelectPlan(plan.id)}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p>All plans include instant activation and 24/7 customer support</p>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
