import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/notificationSlice.js';

export default function useSocket(userId) {
    const socketRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        socketRef.current = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
            auth: { token },
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            console.log('Socket.io connected');
            // Request joining the personal room
            socketRef.current.emit('join', userId);
        });

        socketRef.current.on('notification', (data) => {
            dispatch(addNotification(data));
            // In a real app we'd also trigger a toast here, e.g. toast(data.message)
            console.log('New notification received:', data);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [userId, dispatch]);

    return socketRef.current;
}
