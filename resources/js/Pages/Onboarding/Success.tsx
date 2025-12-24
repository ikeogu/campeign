// resources/js/pages/onboarding/Success.tsx
import { Link } from "react-router-dom";

export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg bg-white shadow rounded-xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Onboarding Complete
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome to the platform. Your dashboard is now ready.
        </p>

        <Link
          to="/dashboard"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
