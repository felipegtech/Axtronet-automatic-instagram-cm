import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

function Stats({ stats }) {
  const statCards = [
    {
      title: 'Total Interactions',
      value: stats?.total || 0,
      icon: '📊',
      color: 'bg-blue-500'
    },
    {
      title: 'Comments',
      value: stats?.comments || 0,
      icon: '💬',
      color: 'bg-green-500'
    },
    {
      title: 'Reactions',
      value: stats?.reactions || 0,
      icon: '❤️',
      color: 'bg-red-500'
    },
    {
      title: 'DMs Sent',
      value: stats?.dmsSent || 0,
      icon: '📩',
      color: 'bg-purple-500'
    },
    {
      title: 'Last 24 Hours',
      value: stats?.last24Hours || 0,
      icon: '⏰',
      color: 'bg-yellow-500'
    }
  ]

  const sentimentData = stats?.sentiment ? [
    { name: 'Positive', value: stats.sentiment.positive || 0, color: '#10b981' },
    { name: 'Neutral', value: stats.sentiment.neutral || 0, color: '#6b7280' },
    { name: 'Negative', value: stats.sentiment.negative || 0, color: '#ef4444' }
  ].filter(item => item.value > 0) : []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl hover:border-emerald-300 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl">{stat.icon}</span>
              <div className={`${stat.color} w-2 h-16 rounded-t-full opacity-80`}></div>
            </div>
            <div className="text-slate-600 text-sm font-semibold mb-2 uppercase tracking-wide">
              {stat.title}
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {sentimentData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-3xl">💬</span>
            <h3 className="text-2xl font-bold text-slate-800">Análisis de Sentimiento</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default Stats

