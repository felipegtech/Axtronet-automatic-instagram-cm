import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Instagram Interactions Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and analyze Instagram webhook interactions in real-time
          </p>
        </header>
        <Dashboard />
      </div>
    </div>
  )
}

export default App
