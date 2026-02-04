import { useState, useEffect } from 'react'
import './App.css'
import { getTickets } from './services/api'

function App() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTickets()
      setTickets(data)
    } catch (err) {
      setError('Failed to fetch tickets. Is the backend running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <div className="App">
      <h1>AI Ticketing System - API Connection Test</h1>

      <div className="card">
        <button onClick={fetchTickets} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Tickets'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="ticket-list">
        <h2>Tickets ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <ul style={{ textAlign: 'left' }}>
            {tickets.map((ticket, index) => (
              <li key={index}>
                <strong>{ticket.issue_key}</strong>: {ticket.summary}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
