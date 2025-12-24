import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
// Removed InputLabel and PrimaryButton as we are using raw HTML elements for styling
import GuestLayout from '@/Layouts/GuestLayout'; // Keep this if you want the outer structure
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';


export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        // Cleanup function to clear password field on unmount/reset
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        // Replaced GuestLayout with the desired centered wrapper for styling consistency
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Head title="Log in" />

            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Welcome Back
                </h2>

                {/* Status message (e.g., successful password reset) */}
                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent" // Updated styling
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoComplete="username"
                            required
                            autoFocus // equivalent to isFocused={true}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block mb-1 font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent" // Updated styling
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    {/* Remember Me Checkbox (keeping Breeze Checkbox structure but updating color style) */}
                    <div className="block">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                // Added focus style from green theme
                                className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Remember me
                            </span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end">
                        {/* Forgot Password Link */}
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="rounded-md text-sm text-gray-600 underline hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" // Updated hover/focus color
                            >
                                Forgot your password?
                            </Link>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="ms-4 w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition" // Adopted the provided button styling
                        >
                            {processing ? 'Please wait...' : 'Log in'}
                        </button>
                    </div>
                </form>

                {/* Sign Up Link */}
                <p className="text-center text-sm mt-4">
                    Don’t have an account?
                    <Link
                        href={route('register')} // Using Inertia's Link and route()
                        className="text-green-600 font-semibold ml-1 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
