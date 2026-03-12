import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import useSocket from './hooks/useSocket';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';

function App() {
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading } = useSelector(state => state.auth);

    // Initialize socket connection using custom hook if authenticated
    useSocket(user?._id);

    // Attempt to load user profile if standard token exists in localStorage
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            dispatch(loadUser());
        } else {
            // If no token at all, stop loading state to show public pages immediately
            dispatch({ type: 'auth/loadUser/rejected' });
        }
    }, [dispatch]);

    if (isLoading) {
        return <div className="flex h-screen w-screen items-center justify-center bg-gray-50"><Spinner /></div>;
    }

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
                    <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/projects/:id" element={<KanbanBoard />} />
                        {/* Additional routes like /settings can be added here */}
                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
