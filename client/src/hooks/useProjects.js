import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../store/slices/projectSlice.js';

export default function useProjects() {
    const dispatch = useDispatch();
    const { projects, loading, error, currentProject } = useSelector((state) => state.projects);

    useEffect(() => {
        // Only fetch if empty to prevent over-fetching on re-renders,
        // in a real app you might want stricter caching or use RTK Query
        if (projects.length === 0 && !loading) {
            dispatch(fetchProjects());
        }
    }, [dispatch, projects.length, loading]);

    return { projects, loading, error, currentProject };
}
