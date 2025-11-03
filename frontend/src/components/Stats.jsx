function Stats({ stats }) {
  const statCards = [
    {
      title: 'Total Interactions',
      value: stats.total,
      icon: '📊',
      color: 'bg-blue-500'
    },
    {
      title: 'Comments',
      value: stats.comments,
      icon: '💬',
      color: 'bg-green-500'
    },
    {
      title: 'Reactions',
      value: stats.reactions,
      icon: '❤️',
      color: 'bg-red-500'
    },
    {
      title: 'Last 24 Hours',
      value: stats.last24Hours,
      icon: '⏰',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{stat.icon}</span>
            <div className={`${stat.color} w-2 h-12 rounded-t-full`}></div>
          </div>
          <div className="text-gray-600 text-sm font-medium mb-1">
            {stat.title}
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Stats

