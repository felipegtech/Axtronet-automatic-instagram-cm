import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './components/Dashboard'
import Interactions from './pages/Interactions'
import JobOffers from './pages/JobOffers'
import Surveys from './pages/Surveys'
import Candidates from './pages/Candidates'
import AutoReply from './pages/AutoReply'
import Settings from './pages/Settings'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Navigation() {
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(false)
  const [newInteractionsCount, setNewInteractionsCount] = useState(0)

  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }

    // Fetch new interactions count
    const fetchNewCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/interactions?limit=100`)
        // Count interactions from last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recent = response.data.data.filter(i => new Date(i.timestamp) > oneHourAgo)
        setNewInteractionsCount(recent.length)
      } catch (error) {
        console.error('Error fetching interactions count:', error)
      }
    }
    fetchNewCount()
    const interval = setInterval(fetchNewCount, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', badge: null },
    { path: '/interactions', label: 'Interactions', icon: '🎧', badge: newInteractionsCount },
    { path: '/job-offers', label: 'Job Offers', icon: '🧾', badge: null },
    { path: '/surveys', label: 'Surveys', icon: '🧮', badge: null },
    { path: '/candidates', label: 'Candidates', icon: '👥', badge: null },
    { path: '/auto-reply', label: 'Auto-Reply', icon: '💬', badge: null },
    { path: '/settings', label: 'Settings', icon: '⚙️', badge: null }
  ]

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl mb-8 border-b border-slate-700">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <span className="text-4xl font-bold">
                <span className="text-emerald-400">A</span>
                <span className="text-white">xtronet</span>
              </span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden md:block">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Community Manager
              </div>
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    location.pathname === item.path
                      ? 'text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></div>
                  )}
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-slate-700">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center cursor-pointer hover:ring-2 ring-emerald-400 transition-all">
                  <span className="text-white font-bold text-sm">CM</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-400 py-6 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            © 2025 <span className="text-emerald-400 font-semibold">Axtronet</span> CM · All rights reserved
          </div>
          <div className="text-sm">
            Versión 1.0.0 · Community Manager Platform
          </div>
        </div>
      </div>
    </footer>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
        <Navigation />
        <div className="container mx-auto px-6 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/interactions" element={<Interactions />} />
            <Route path="/job-offers" element={<JobOffers />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/auto-reply" element={<AutoReply />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App
