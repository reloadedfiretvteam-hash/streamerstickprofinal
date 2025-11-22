import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './CheckoutPage.css'

function CheckoutPage() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  })

  useEffect(() => {
    async function fetchPlan() {
      const { data } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('id', planId)
        .single()

      setPlan(data)
      setLoading(false)
    }

    fetchPlan()
  }, [planId])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const trackingCode = 'TRK-' + Math.random().toString(36).substr(2, 9).toUpperCase()

      const { data, error } = await supabase.from('orders').insert({
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        },
        order_items: [
          {
            plan_id: plan.id,
            plan_name: plan.name,
            price: plan.price
          }
        ],
        total_amount: plan.price,
        payment_method: 'pending',
        payment_status: 'pending',
        tracking_code: trackingCode
      }).select()

      await supabase.from('email_captures').insert({
        email: formData.customer_email,
        source: 'checkout'
      })

      alert(`Order placed successfully! Your tracking code is: ${trackingCode}`)
      navigate('/')
    } catch (error) {
      console.error('Order error:', error)
      alert('There was an error processing your order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!plan) {
    return <div className="error">Plan not found</div>
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Complete Your Order</h1>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>

        <div className="checkout-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-card">
              <div className="plan-info">
                <h3>{plan.name}</h3>
                <p className="plan-period">{plan.billing_period}ly subscription</p>
              </div>
              <div className="plan-price">
                <span className="price-amount">${parseFloat(plan.price).toFixed(2)}</span>
              </div>
            </div>

            <div className="features-list">
              <h4>Included Features:</h4>
              <ul>
                {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>

            <div className="total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${parseFloat(plan.price).toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>${parseFloat(plan.price).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="checkout-form-container">
            <h2>Customer Information</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="customer_name">Full Name *</label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_email">Email Address *</label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_phone">Phone Number</label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="zip">ZIP Code</label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Place Order'}
              </button>

              <p className="form-note">
                * After placing your order, you will receive an email with activation instructions and your tracking code.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
