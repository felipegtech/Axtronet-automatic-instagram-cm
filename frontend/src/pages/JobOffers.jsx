import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function JobOffers() {
  const [jobOffers, setJobOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hashtags: '',
    autoPublish: false
  })
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    fetchJobOffers()
  }, [])

  const fetchJobOffers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/job-offers`)
      setJobOffers(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching job offers:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const hashtagsArray = formData.hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)

      const payload = {
        ...formData,
        hashtags: hashtagsArray
      }

      if (editingOffer) {
        await axios.put(`${API_BASE_URL}/api/job-offers/${editingOffer._id}`, payload)
      } else {
        await axios.post(`${API_BASE_URL}/api/job-offers`, payload)
      }

      setShowForm(false)
      setEditingOffer(null)
      setFormData({ title: '', description: '', hashtags: '', autoPublish: false })
      fetchJobOffers()
    } catch (error) {
      console.error('Error saving job offer:', error)
      alert('Error al guardar la oferta')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return
    
    try {
      await axios.delete(`${API_BASE_URL}/api/job-offers/${id}`)
      fetchJobOffers()
    } catch (error) {
      console.error('Error deleting job offer:', error)
      alert('Error al eliminar la oferta')
    }
  }

  const handlePublish = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/job-offers/${id}/publish`, {
        instagramPostId: `post_${id}`
      })
      fetchJobOffers()
    } catch (error) {
      console.error('Error publishing job offer:', error)
      alert('Error al publicar la oferta')
    }
  }

  const fetchAnalytics = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/job-offers/${id}/analytics`)
      setAnalytics(response.data.data)
      setSelectedOffer(id)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const chartData = analytics ? [
    { name: 'Reactions', value: analytics.interactions.reactions },
    { name: 'Comments', value: analytics.interactions.comments },
    { name: 'Candidates', value: analytics.candidates.total }
  ] : []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">🧾</span>
            Job Offers Management
          </h1>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingOffer(null)
              setFormData({ title: '', description: '', hashtags: '', autoPublish: false })
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Job Offer
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingOffer ? 'Edit Job Offer' : 'Create New Job Offer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                  placeholder="trabajo, empleo, carrera"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoPublish"
                  checked={formData.autoPublish}
                  onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="autoPublish" className="text-sm text-gray-700">
                  Enable Automated Publishing
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingOffer ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingOffer(null)
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Job Offers List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading job offers...</p>
          </div>
        ) : jobOffers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg">No job offers yet</p>
            <p className="text-sm">Create your first job offer to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobOffers.map((offer) => (
              <div key={offer._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                  {offer.published && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Published
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {offer.description}
                </p>
                {offer.hashtags.length > 0 && (
                  <div className="mb-3">
                    {offer.hashtags.map((tag, index) => (
                      <span key={index} className="text-xs text-blue-600 mr-2">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Reactions: {offer.analytics?.reactions || 0}</span>
                  <span>Candidates: {offer.analytics?.interestedCandidates || 0}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchAnalytics(offer._id)}
                    className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    📈 Analytics
                  </button>
                  {!offer.published && (
                    <button
                      onClick={() => handlePublish(offer._id)}
                      className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingOffer(offer)
                      setFormData({
                        title: offer.title,
                        description: offer.description,
                        hashtags: offer.hashtags.join(', '),
                        autoPublish: offer.autoPublish
                      })
                      setShowForm(true)
                    }}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(offer._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {analytics && selectedOffer && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📈 Analytics Dashboard</h2>
            <button
              onClick={() => {
                setAnalytics(null)
                setSelectedOffer(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Reactions</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.interactions.reactions}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Comments</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.interactions.comments}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Candidates</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.candidates.total}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-yellow-600">
                {analytics.interactions.total}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {analytics.candidates.total > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Interested Candidates</h3>
              <div className="space-y-2">
                {analytics.candidates.list.slice(0, 10).map((candidate) => (
                  <div key={candidate._id} className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">@{candidate.instagramHandle}</p>
                      {candidate.name && (
                        <p className="text-sm text-gray-600">{candidate.name}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      Score: {candidate.engagementScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JobOffers

