import { useState, useEffect } from 'react'
import axios from 'axios'
import Stats from './Stats'
import InteractionsList from './InteractionsList'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Dashboard() {
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dailyGrowth, setDailyGrowth] = useState(null)
  const [insights, setInsights] = useState(null)
  const [autoReplyMessage, setAutoReplyMessage] = useState('')
  const [demographics, setDemographics] = useState(null)

  useEffect(() => {
    checkHealth()
    fetchData()
    fetchAutoReply()
    fetchDemographics()
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchData()
      fetchDemographics()
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
      
      // Calculate daily growth (simulated)
      const previousTotal = stats?.total || 0
      const currentTotal = statsResponse.data.data.total
      if (previousTotal > 0) {
        const growth = ((currentTotal - previousTotal) / previousTotal) * 100
        setDailyGrowth(growth)
      }
      
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
      
      // Generate insights
      const insightsData = {
        mostCommentedPost: interactionsResponse.data.data.find(i => i.type === 'comment')?.postId || 'N/A',
        mostCommonReaction: getMostCommonReaction(interactionsResponse.data.data),
        mostMentionedWord: getMostMentionedWord(interactionsResponse.data.data)
      }
      setInsights(insightsData)
      
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const fetchAutoReply = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auto-reply/templates/active`)
      const defaultTemplate = response.data.data.find(t => t.isDefault) || response.data.data[0]
      if (defaultTemplate) {
        setAutoReplyMessage(defaultTemplate.template)
      }
    } catch (error) {
      console.error('Error fetching auto-reply:', error)
    }
  }

  const fetchDemographics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/demographics`)
      setDemographics(response.data.data)
    } catch (error) {
      console.error('Error fetching demographics:', error)
    }
  }

  const getMostCommonReaction = (interactions) => {
    const reactions = interactions.filter(i => i.type === 'reaction').map(i => i.reactionType)
    if (reactions.length === 0) return '❤️ Like'
    const counts = {}
    reactions.forEach(r => counts[r] = (counts[r] || 0) + 1)
    const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
    const emojis = { like: '❤️', love: '😍', haha: '😂', wow: '😮', sad: '😢', angry: '😠' }
    return `${emojis[mostCommon] || '❤️'} ${mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1)}`
  }

  const getMostMentionedWord = (interactions) => {
    const words = interactions
      .filter(i => i.type === 'comment')
      .flatMap(i => i.message.toLowerCase().split(/\s+/))
      .filter(w => w.length > 4)
    
    if (words.length === 0) return 'vacante'
    
    const counts = {}
    words.forEach(w => counts[w] = (counts[w] || 0) + 1)
    const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
    return mostCommon
  }

  const getHealthStatus = () => {
    if (!health) return 'unknown'
    return health.status === 'ok' && health.mongodb === 'connected' 
      ? 'online' 
      : 'offline'
  }

  // Generate sparkline data (last 24 hours simulated)
  const sparklineData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    interactions: Math.floor(Math.random() * 10) + (stats?.last24Hours || 0) / 24
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-5xl font-bold tracking-tight">
                <span className="text-emerald-400 dark:text-emerald-500">A</span>
                <span className="text-white">xtronet</span>
              </h1>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider pt-2">
                Community Manager
              </div>
            </div>
            <p className="text-slate-300 dark:text-slate-400 text-base font-light">
              Monitoreo y análisis de interacciones de Instagram en tiempo real
            </p>
          </div>
          <div className="text-right ml-6">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
              getHealthStatus() === 'online' 
                ? 'bg-emerald-500/20 border border-emerald-500/50' 
                : 'bg-red-500/20 border border-red-500/50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                getHealthStatus() === 'online' 
                  ? 'bg-[#10b981] animate-pulse' 
                  : 'bg-red-400'
              }`}></div>
              <span className="text-sm font-medium">
                {getHealthStatus() === 'online' ? 'Sistema Activo' : 'Sistema Offline'}
              </span>
            </div>
            {health && (
              <div className="mt-2 flex items-center justify-end space-x-2 text-sm text-slate-400">
                <span>MongoDB:</span>
                {health.mongodb === 'connected' ? (
                  <span className="text-emerald-400 flex items-center">
                    <span className="mr-1">✅</span>
                    {health.mongodb}
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {health.mongodb || 'disconnected'}
                  </span>
                )}
              </div>
            )}
            {dailyGrowth !== null && (
              <div className={`mt-2 text-sm font-semibold ${
                dailyGrowth > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {dailyGrowth > 0 ? '+' : ''}{dailyGrowth.toFixed(1)}% vs ayer
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 dark:text-red-300 font-semibold">Error de conexión</p>
              <p className="text-red-600 dark:text-red-400 text-sm">
                {error}. Asegúrate de que el servidor backend esté ejecutándose en {API_BASE_URL}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && <Stats stats={stats} />}

      {/* Performance Indicator & Sparkline */}
      {dailyGrowth !== null && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Rendimiento Diario</h3>
            <span className={`text-2xl font-bold ${
              dailyGrowth > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {dailyGrowth > 0 ? '+' : ''}{dailyGrowth.toFixed(1)}%
            </span>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="interactions" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-5">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="mr-2 text-2xl">🔔</span>
                Notificaciones
              </h2>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
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
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                              {notif.user}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              notif.sentiment === 'positive'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : notif.sentiment === 'negative'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {notif.sentiment}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2">
                            {notif.message}
                          </p>
                          {notif.flagged && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1 block">
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

      {/* Quick Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">🗨️</span>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Post Más Comentado</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{insights.mostCommentedPost}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">❤️</span>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Reacción Más Común</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{insights.mostCommonReaction}</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">🧠</span>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Palabra Más Mencionada</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium capitalize">#{insights.mostMentionedWord}</p>
          </div>
        </div>
      )}

      {/* Auto-Reply Preview */}
      {autoReplyMessage && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Mensaje Automático Configurado</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Auto-Reply inteligente activo</p>
              </div>
            </div>
            <a 
              href="/auto-reply"
              className="bg-emerald-500 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              Editar Mensaje
            </a>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{autoReplyMessage}</p>
          </div>
        </div>
      )}

      {/* Demographics Analytics */}
      {demographics && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Información Demográfica Recolectada
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Locations */}
            {Object.keys(demographics.locations || {}).length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">📍 Ubicaciones</h4>
                <div className="space-y-2">
                  {Object.entries(demographics.locations).slice(0, 5).map(([location, count]) => (
                    <div key={location} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{location}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Age Groups */}
            {Object.keys(demographics.ageGroups || {}).length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">👥 Grupos de Edad</h4>
                <div className="space-y-2">
                  {Object.entries(demographics.ageGroups).map(([ageGroup, count]) => (
                    <div key={ageGroup} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{ageGroup} años</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {Object.keys(demographics.interests || {}).length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">🎯 Intereses</h4>
                <div className="space-y-2">
                  {Object.entries(demographics.interests).slice(0, 5).map(([interest, count]) => (
                    <div key={interest} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">{interest}</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {Object.keys(demographics.topics || {}).length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">💬 Temas</h4>
                <div className="space-y-2">
                  {Object.entries(demographics.topics).slice(0, 5).map(([topic, count]) => (
                    <div key={topic} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">{topic}</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
