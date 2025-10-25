import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-4">Terrier Taste</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-lg">
        Discover the best bites around campus and beyond. Join a community of food lovers.
      </p>
      <Link
        to="/explore"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Explore Now
      </Link>
    </main>
  )
}
