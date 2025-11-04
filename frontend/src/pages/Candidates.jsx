import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Candidates() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [filters, setFilters] = useState({
    interestArea: '',
    reactionType: '',
    sentiment: '',
    status: ''
  })
  const [inviteMessage, setInviteMessage] = useState('')

  useEffect(() => {
    fetchCandidates()
  }, [filters])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.interestArea) params.append('interestArea', filters.interestArea)
      if (filters.reactionType) params.append('reactionType', filters.reactionType)
      if (filters.sentiment) params.append('sentiment', filters.sentiment)
      if (filters.status) params.append('status', filters.status)

      const response = await axios.get(
        `${API_BASE_URL}/api/candidates?${params.toString()}`
      )
      setCandidates(response.data.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching candidates:', error)
      setLoading(false)
    }
  }

  const handleInvite = async (candidateId) => {
    if (!inviteMessage.trim()) {
      alert('Please enter a message')
      return
    }

    try {
      await axios.post(`${API_BASE_URL}/api/candidates/${candidateId}/invite`, {
        message: inviteMessage
      })
      setInviteMessage('')
      setSelectedCandidate(null)
      fetchCandidates()
      alert('Invitation sent successfully!')
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Error al enviar la invitación')
    }
  }

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/candidates/${candidateId}`, {
        status: newStatus
      })
      fetchCandidates()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'interviewed': 'bg-purple-100 text-purple-800',
      'hired': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">👥</span>
          Candidates / Users Section
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Area
            </label>
            <select
              value={filters.interestArea}
              onChange={(e) => setFilters({ ...filters, interestArea: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reaction Type
            </label>
            <select
              value={filters.reactionType}
              onChange={(e) => setFilters({ ...filters, reactionType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="like">❤️ Like</option>
              <option value="love">😍 Love</option>
              <option value="haha">😂 Haha</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentiment
            </label>
            <select
              value={filters.sentiment}
              onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interviewed">Interviewed</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Candidates List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-lg">No candidates found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {candidate.instagramHandle.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          @{candidate.instagramHandle}
                        </h3>
                        {candidate.name && (
                          <span className="text-gray-600">({candidate.name})</span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span>Score: <strong>{candidate.engagementScore}</strong></span>
                        {candidate.interestAreas.length > 0 && (
                          <span>
                            Interests: {candidate.interestAreas.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Profile
                    </button>
                    <select
                      value={candidate.status}
                      onChange={(e) => handleStatusChange(candidate._id, e.target.value)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile View Modal */}
      {selectedCandidate && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Profile: @{selectedCandidate.instagramHandle}
            </h2>
            <button
              onClick={() => setSelectedCandidate(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">📋 Information</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {candidate.name || 'N/A'}</p>
                <p><strong>Email:</strong> {candidate.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {candidate.phone || 'N/A'}</p>
                <p><strong>Engagement Score:</strong> {selectedCandidate.engagementScore}/100</p>
                <p><strong>Status:</strong> {selectedCandidate.status}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">💼 Job Interests</h3>
              {selectedCandidate.jobOfferInterest.length > 0 ? (
                <div className="space-y-2">
                  {selectedCandidate.jobOfferInterest.map((interest, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <p className="text-sm">
                        Interest Level: <strong>{interest.interestLevel}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No job interests yet</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">💬 Conversation History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedCandidate.conversations.length > 0 ? (
                selectedCandidate.conversations.map((conv, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{conv.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        conv.sentiment === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : conv.sentiment === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conv.sentiment}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{conv.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No conversations yet</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">📩 Send Invitation</h3>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Enter invitation message..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => handleInvite(selectedCandidate._id)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Send DM Invitation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Candidates

