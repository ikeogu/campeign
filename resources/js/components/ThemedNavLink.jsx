import { Link } from '@inertiajs/react';

const ThemedNavLink = ({ href, active, children, icon }) => {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                active
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 translate-x-1'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
            }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="text-sm tracking-tight">{children}</span>
        </Link>
    );
};

// This line fixes the "does not provide an export named default" error
export default ThemedNavLink;
