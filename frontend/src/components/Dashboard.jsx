import { useState, useEffect } from 'react'
import axios from 'axios'
import Stats from './Stats'
import InteractionsList from './InteractionsList'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Dashboard() {
  const [health, setHealth] = useState(null)
  const [stats, setStats] = useState(null)
  const [interactions, setInteractions] = useState([])
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
        axios.get(`${API_BASE_URL}/api/interactions`)
      ])
      
      setStats(statsResponse.data.data)
      setInteractions(interactionsResponse.data.data)
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
      {/* Health Status Indicator */}
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              getHealthStatus() === 'online' 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-red-500'
            }`}></div>
            <div>
              <span className="font-semibold text-gray-700">Server Status: </span>
              <span className={`font-bold ${
                getHealthStatus() === 'online' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {getHealthStatus().toUpperCase()}
              </span>
            </div>
          </div>
          {health && (
            <div className="text-sm text-gray-500">
              MongoDB: {health.mongodb || 'disconnected'}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">
              Error: {error}. Make sure the backend server is running on {API_BASE_URL}
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && <Stats stats={stats} />}

      {/* Interactions List */}
      <InteractionsList 
        interactions={interactions} 
        loading={loading}
        onRefresh={fetchData}
      />
    </div>
  )
}

export default Dashboard

