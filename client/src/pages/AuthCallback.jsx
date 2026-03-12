import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setOAuthSession, loadUser } from '../store/slices/authSlice';
import Spinner from '../components/Spinner';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            dispatch(setOAuthSession(token));
            dispatch(loadUser()).then(() => {
                navigate('/');
            });
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [searchParams, dispatch, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="12" />
                <h2 className="text-xl font-semibold text-gray-700">Completing sign in...</h2>
            </div>
        </div>
    );
}
