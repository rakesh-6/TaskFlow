import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useProjects from '../hooks/useProjects';
import useAuth from '../hooks/useAuth';
import { createProject } from '../store/slices/projectSlice';
import Spinner from '../components/Spinner';

export default function Dashboard() {
    const { user } = useAuth();
    const { projects, loading } = useProjects();
    const dispatch = useDispatch();

    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        await dispatch(createProject({ name: newProjectName }));
        setNewProjectName('');
        setIsCreating(false);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0]}
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <button
                        onClick={() => setIsCreating(true)}
                        className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        New Project
                    </button>
                </div>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateProject} className="mb-8 flex gap-4 bg-white p-4 shadow rounded-lg max-w-md">
                    <input
                        type="text"
                        autoFocus
                        placeholder="Project name..."
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">Create</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
            ) : projects.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link key={project._id} to={`/projects/${project._id}`} className="block">
                            <div className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:shadow-md transition-shadow">
                                <div className="flex-shrink-0">
                                    <span className="inline-block h-10 w-10 overflow-hidden rounded-full bg-indigo-100 flex items-center justify-center">
                                        <span className="text-lg font-medium text-indigo-700">{project.name.charAt(0).toUpperCase()}</span>
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900">{project.name}</p>
                                    <p className="truncate text-sm text-gray-500">{project.members.length} member{project.members.length !== 1 && 's'}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
