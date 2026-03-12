import { useSelector } from 'react-redux';

export default function useAuth() {
    const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
    return { user, isAuthenticated, isLoading, error };
}
