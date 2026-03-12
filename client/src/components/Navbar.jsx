import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { unreadCount } = useSelector((state) => state.notifications);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <nav className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <Link to="/" className="flex flex-shrink-0 items-center gap-2">
                            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">TaskFlow</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            <span className="sr-only">View notifications</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            )}
                        </button>
                        <div className="flex items-center gap-2">
                            {user?.avatar ? (
                                <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="ml-2 flex flex-col items-start gap-1">
                                <button onClick={handleLogout} className="text-sm font-medium text-gray-700 hover:text-gray-900 leading-none">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
