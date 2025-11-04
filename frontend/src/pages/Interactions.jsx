import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function Interactions() {
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    source: '',
    sentiment: '',
    reactionType: ''
  })
  const [selectedInteraction, setSelectedInteraction] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [predefinedReplies] = useState([
    'Hola! Gracias por tu interés. Te contactaremos pronto.',
    'Gracias por tu comentario. Revisa nuestra biografía para más información.',
    '¡Excelente! Nuestro equipo revisará tu perfil.',
    'Nos encanta tu interés. Déjanos un DM para más detalles.'
  ])
  const [aiSuggestion, setAiSuggestion] = useState('')

  useEffect(() => {
    fetchInteractions()
  }, [filters])

  const fetchInteractions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.source) params.append('source', filters.source)
      if (filters.sentiment) params.append('sentiment', filters.sentiment)
      
      const response = await axios.get(
        `${API_BASE_URL}/api/interactions?${params.toString()}`
      )
      let filtered = response.data.data
      
      if (filters.reactionType) {
        filtered = filtered.filter(i => i.reactionType === filters.reactionType)
      }
      
      setInteractions(filtered)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching interactions:', error)
      setLoading(false)
    }
  }

  const generateAISuggestion = (interaction) => {
    // Simple AI suggestion based on sentiment
    if (interaction.sentiment === 'positive') {
      return '¡Gracias por tu interés! Nos encanta tu entusiasmo. 💼'
    } else if (interaction.sentiment === 'negative') {
      return 'Lamentamos tu experiencia. Por favor, contáctanos por DM para resolver esto.'
    } else {
      return 'Hola @' + interaction.user + '! 👋 Gracias por tu comentario. Te contactaremos pronto.'
    }
  }

  const handleReply = async (moveToDM = false) => {
    if (!selectedInteraction || !replyText.trim()) return

    try {
      await axios.post(
        `${API_BASE_URL}/api/interactions/${selectedInteraction._id}/reply`,
        { message: replyText, moveToDM }
      )
      
      // Update local state
      setInteractions(interactions.map(i => 
        i._id === selectedInteraction._id 
          ? { ...i, replied: true, replyMessage: replyText, movedToDM: moveToDM }
          : i
      ))
      
      setSelectedInteraction(null)
      setReplyText('')
      setAiSuggestion('')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Error al enviar respuesta')
    }
  }

  const handlePredefinedReply = (reply) => {
    setReplyText(reply)
    if (selectedInteraction) {
      setAiSuggestion(generateAISuggestion(selectedInteraction))
    }
  }

  const getReactionEmoji = (type) => {
    const emojis = {
      'like': '❤️',
      'love': '😍',
      'haha': '😂',
      'wow': '😮',
      'sad': '😢',
      'angry': '😠'
    }
    return emojis[type] || '❤️'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">🎧</span>
          Instagram Listener / Interactions
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post/Story
            </label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="post">Post</option>
              <option value="story">Story</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="comment">Comment</option>
              <option value="reaction">Reaction</option>
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
              <option value="wow">😮 Wow</option>
              <option value="sad">😢 Sad</option>
              <option value="angry">😠 Angry</option>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Feed */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📥 Live Feed</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading interactions...</p>
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No interactions found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction._id}
                      className={`bg-white p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                        interaction.sentiment === 'negative'
                          ? 'border-red-500 bg-red-50'
                          : interaction.sentiment === 'positive'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300'
                      } ${
                        selectedInteraction?._id === interaction._id
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedInteraction(interaction)
                        setAiSuggestion(generateAISuggestion(interaction))
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-800">
                              {interaction.user}
                            </span>
                            {interaction.type === 'reaction' && (
                              <span className="text-xl">
                                {getReactionEmoji(interaction.reactionType)}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              interaction.sentiment === 'positive'
                                ? 'bg-green-100 text-green-800'
                                : interaction.sentiment === 'negative'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {interaction.sentiment}
                            </span>
                            {interaction.replied && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                ✓ Replied
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{interaction.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Reply Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">💬 Quick Reply Panel</h2>
              
              {selectedInteraction ? (
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Replying to:</p>
                    <p className="font-semibold text-gray-800">{selectedInteraction.user}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedInteraction.message}</p>
                  </div>

                  {/* AI Suggestion */}
                  {aiSuggestion && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">🤖 AI Suggestion:</p>
                      <p className="text-sm text-blue-700">{aiSuggestion}</p>
                      <button
                        onClick={() => setReplyText(aiSuggestion)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Use this suggestion
                      </button>
                    </div>
                  )}

                  {/* Predefined Replies */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Predefined Replies:</p>
                    <div className="space-y-2">
                      {predefinedReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handlePredefinedReply(reply)}
                          className="w-full text-left text-xs p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                        >
                          {reply.substring(0, 50)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Reply:
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your reply here..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleReply(false)}
                      disabled={!replyText.trim()}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      💬 Reply as Comment
                    </button>
                    <button
                      onClick={() => handleReply(true)}
                      disabled={!replyText.trim()}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      📩 Move to DM
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👆</div>
                  <p>Select an interaction to reply</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Interactions

