function InteractionsList({ interactions, loading, onRefresh }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    // If less than a minute
    if (diff < 60000) return 'Just now'
    
    // If less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
    
    // If today
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    }
    
    // Otherwise, show date
    return date.toLocaleString()
  }

  const getTypeIcon = (type) => {
    return type === 'comment' ? '💬' : '❤️'
  }

  const getTypeColor = (type) => {
    return type === 'comment' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2 text-2xl">📊</span>
            Actividad Reciente
          </h2>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading && interactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-slate-600 font-medium">Cargando interacciones...</p>
          </div>
        ) : interactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-7xl mb-4">📭</div>
            <p className="text-slate-700 font-semibold text-lg">No hay interacciones aún</p>
            <p className="text-slate-500 text-sm mt-2">
              Envía una solicitud webhook para ver interacciones aquí
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Mensaje
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {interactions.map((interaction) => (
                <tr key={interaction._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(interaction.type)}`}>
                      <span className="mr-2">{getTypeIcon(interaction.type)}</span>
                      {interaction.type === 'comment' ? 'Comentario' : 'Reacción'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 max-w-md truncate font-medium">
                      {interaction.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-bold">
                          {interaction.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-slate-900">
                          @{interaction.user}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {formatTime(interaction.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {interactions.length > 0 && (
        <div className="bg-slate-50 px-6 py-4 text-sm text-slate-600 border-t border-slate-200 font-medium">
          Mostrando {interactions.length} interacciones más recientes
        </div>
      )}
    </div>
  )
}

export default InteractionsList

