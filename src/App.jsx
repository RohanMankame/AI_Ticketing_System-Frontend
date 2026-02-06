import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import CalendarPage from './pages/CalendarPage'
import Knowledge from './pages/Knowledge'
import KnowledgeDetails from './pages/KnowledgeDetails'
import Analytics from './pages/Analytics'
import TicketDetails from './pages/TicketDetails'
import TicketCategorization from './pages/TicketCategorization'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:ticketId" element={<TicketDetails />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="knowledge/:id" element={<KnowledgeDetails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="categorization" element={<TicketCategorization />} /> {/* Added TicketCategorization route */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
