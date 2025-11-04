import { Header } from '../components/Layout/Header'

export function Stats() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Statistics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This page will show your reading statistics. Coming soon!
          </p>
        </div>
      </main>
    </div>
  )
}
