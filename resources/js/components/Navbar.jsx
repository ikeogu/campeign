import { Link } from "@inertiajs/react";

export default function Navbar() {
    return (
        <nav className="w-full flex justify-between items-center py-4 px-6 bg-white shadow-sm fixed top-0 left-0 z-50">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-md"></div>
                <span className="text-xl font-semibold text-gray-800">GigsandCampaigns</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-gray-700 hover:text-green-600">
                    Home
                </Link>
                <Link to="/login" className="text-gray-700 hover:text-green-600">
                    Login
                </Link>
                <Link
                    to="/signup"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
