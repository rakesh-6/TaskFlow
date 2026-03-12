import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useSelector(state => state.auth);

    // Prevent redirect while initial `loadUser` checking user session
    if (isLoading) return null;

    return isAuthenticated ? (
        <div className="flex h-screen flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto w-full">
                <Outlet />
            </main>
        </div>
    ) : (
        <Navigate to="/login" replace />
    );
}
