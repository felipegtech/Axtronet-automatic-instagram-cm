import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Interactions from './pages/Interactions'
import JobOffers from './pages/JobOffers'
import Surveys from './pages/Surveys'
import Candidates from './pages/Candidates'
import AutoReply from './pages/AutoReply'
import Settings from './pages/Settings'

function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/interactions', label: 'Interactions', icon: '🎧' },
    { path: '/job-offers', label: 'Job Offers', icon: '🧾' },
    { path: '/surveys', label: 'Surveys', icon: '🧮' },
    { path: '/candidates', label: 'Candidates', icon: '👥' },
    { path: '/auto-reply', label: 'Auto-Reply', icon: '💬' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl mb-8 border-b border-slate-700">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <span className="text-4xl font-bold">
                <span className="text-emerald-400">a</span>
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
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  location.pathname === item.path
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
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
      </div>
    </Router>
  )
}

export default App
