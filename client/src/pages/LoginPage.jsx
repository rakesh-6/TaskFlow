import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';
import Spinner from '../components/Spinner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
        return () => dispatch(clearError());
    }, [isAuthenticated, navigate, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
                        Sign in to TaskFlow
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                {searchParams.get('expired') && (
                    <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                            <div className="ml-3 text-sm text-yellow-700">
                                Your session has expired. Please log in again.
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                        >
                            {isLoading ? <Spinner size="5" className="text-white" /> : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2 px-4 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
