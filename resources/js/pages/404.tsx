import { Link } from '@inertiajs/react';
import { Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4">
      <div className="flex flex-col items-center">
        <Ghost className="w-24 h-24 text-purple-500 mb-4 animate-bounce" />
        <h1 className="text-7xl font-extrabold text-blue-600 mb-2 drop-shadow-lg">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Sorry, the page you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
