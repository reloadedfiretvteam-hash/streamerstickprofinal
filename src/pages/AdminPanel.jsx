import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminPanel.css'

function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [visitors, setVisitors] = useState([])
  const [emailCaptures, setEmailCaptures] = useState([])
  const [pricingPlans, setPricingPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [ordersRes, visitorsRes, emailsRes, plansRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('visitors').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('email_captures').select('*').order('created_at', { ascending: false }),
        supabase.from('pricing_plans').select('*').order('display_order')
      ])

      setOrders(ordersRes.data || [])
      setVisitors(visitorsRes.data || [])
      setEmailCaptures(emailsRes.data || [])
      setPricingPlans(plansRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0),
    totalVisitors: visitors.length,
    totalEmails: emailCaptures.length
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalVisitors}</h3>
            <p>Total Visitors</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📧</div>
          <div className="stat-info">
            <h3>{stats.totalEmails}</h3>
            <p>Email Captures</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab ${activeTab === 'emails' ? 'active' : ''}`}
          onClick={() => setActiveTab('emails')}
        >
          Email Captures
        </button>
        <button
          className={`tab ${activeTab === 'visitors' ? 'active' : ''}`}
          onClick={() => setActiveTab('visitors')}
        >
          Visitors
        </button>
        <button
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Pricing Plans
        </button>
      </div>

      <div className="tab-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'orders' && (
              <div className="table-container">
                <h2>Recent Orders</h2>
                {orders.length === 0 ? (
                  <p className="empty-state">No orders yet</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tracking Code</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="tracking-code">{order.tracking_code}</td>
                          <td>{order.customer_name}</td>
                          <td>{order.customer_email}</td>
                          <td className="amount">${parseFloat(order.total_amount).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${order.payment_status}`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'emails' && (
              <div className="table-container">
                <h2>Email Captures</h2>
                {emailCaptures.length === 0 ? (
                  <p className="empty-state">No email captures yet</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Source</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailCaptures.map((capture) => (
                        <tr key={capture.id}>
                          <td>{capture.email}</td>
                          <td>
                            <span className="source-badge">{capture.source}</span>
                          </td>
                          <td>{new Date(capture.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'visitors' && (
              <div className="table-container">
                <h2>Recent Visitors (Last 100)</h2>
                {visitors.length === 0 ? (
                  <p className="empty-state">No visitors yet</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Page URL</th>
                        <th>Referrer</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visitors.map((visitor) => (
                        <tr key={visitor.id}>
                          <td className="url-cell">{visitor.page_url || 'N/A'}</td>
                          <td className="url-cell">{visitor.referrer || 'Direct'}</td>
                          <td>{new Date(visitor.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="table-container">
                <h2>Pricing Plans</h2>
                <div className="plans-grid">
                  {pricingPlans.map((plan) => (
                    <div key={plan.id} className="plan-card-admin">
                      <div className="plan-header-admin">
                        <h3>{plan.name}</h3>
                        <div className="plan-price-admin">
                          <span className="price-large">${parseFloat(plan.price).toFixed(2)}</span>
                          <span className="price-period">/{plan.billing_period}</span>
                        </div>
                      </div>
                      <div className="plan-details">
                        <p><strong>Display Order:</strong> {plan.display_order}</p>
                        <p><strong>Popular:</strong> {plan.is_popular ? 'Yes' : 'No'}</p>
                        <p><strong>Active:</strong> {plan.active ? 'Yes' : 'No'}</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                          {Array.isArray(plan.features) && plan.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
