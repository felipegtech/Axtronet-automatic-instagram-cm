import { useState, useEffect } from 'react'
import axios from 'axios'
import Stats from './Stats'
import InteractionsList from './InteractionsList'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Dashboard() {
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkHealth()
    fetchData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`)
      setHealth(response.data)
    } catch (err) {
      console.error('Health check failed:', err)
      setHealth({ status: 'error', error: err.message })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [statsResponse, interactionsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/stats`),
        axios.get(`${API_BASE_URL}/api/interactions?limit=10`)
      ])
      
      setStats(statsResponse.data.data)
      setInteractions(interactionsResponse.data.data)
      
      // Generate notifications from recent interactions
      const recentInteractions = interactionsResponse.data.data.slice(0, 5)
      const notificationsData = recentInteractions.map(interaction => ({
        id: interaction._id,
        type: interaction.type === 'comment' ? 'comment' : 'reaction',
        message: interaction.message,
        user: interaction.user,
        timestamp: interaction.timestamp,
        sentiment: interaction.sentiment,
        flagged: interaction.sentiment === 'negative'
      }))
      setNotifications(notificationsData)
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const getHealthStatus = () => {
    if (!health) return 'unknown'
    return health.status === 'ok' && health.mongodb === 'connected' 
      ? 'online' 
      : 'offline'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-emerald-400">D</span>
              <span className="text-white">ashboard</span>
            </h1>
            <p className="text-slate-300 text-lg">
              Monitoreo y análisis de interacciones de Instagram en tiempo real
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
              getHealthStatus() === 'online' 
                ? 'bg-emerald-500/20 border border-emerald-500/50' 
                : 'bg-red-500/20 border border-red-500/50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                getHealthStatus() === 'online' 
                  ? 'bg-emerald-400 animate-pulse' 
                  : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium">
                {getHealthStatus() === 'online' ? 'Sistema Activo' : 'Sistema Offline'}
              </span>
            </div>
            {health && (
              <div className="mt-2 text-sm text-slate-400">
                MongoDB: <span className="text-emerald-400">{health.mongodb || 'disconnected'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 font-semibold">Error de conexión</p>
              <p className="text-red-600 text-sm">
                {error}. Asegúrate de que el servidor backend esté ejecutándose en {API_BASE_URL}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && <Stats stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="mr-2 text-2xl">🔔</span>
                Notificaciones
              </h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-5xl mb-3">🔕</div>
                  <p className="font-medium">No hay notificaciones nuevas</p>
                  <p className="text-sm mt-1">Todas las interacciones están actualizadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                        notif.flagged
                          ? 'bg-red-50 border-red-500 hover:bg-red-100'
                          : 'bg-slate-50 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {notif.user}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              notif.sentiment === 'positive'
                                ? 'bg-green-100 text-green-800'
                                : notif.sentiment === 'negative'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {notif.sentiment}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notif.message}
                          </p>
                          {notif.flagged && (
                            <span className="text-xs text-red-600 font-semibold mt-1 block">
                              ⚠️ Flagged for review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2">
          <InteractionsList 
            interactions={interactions} 
            loading={loading}
            onRefresh={fetchData}
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

