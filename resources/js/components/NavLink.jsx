import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-brand-500 text-brand-700 focus:border-brand-700'
                    : 'border-transparent text-gray-500 hover:border-brand-300 hover:text-brand-600 focus:border-brand-300 focus:text-brand-600') +
                className
            }
        >
            {children}
        </Link>
    );
}
