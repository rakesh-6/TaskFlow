import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTaskStatus, optimisticTaskUpdate, revertOptimisticUpdate, createTask, deleteTask, updateTask } from '../store/slices/taskSlice';
import { fetchProjectDetails } from '../store/slices/projectSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Spinner from '../components/Spinner';

export default function KanbanBoard() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { tasks, loading } = useSelector(state => state.tasks);
    const { currentProject, loading: projectLoading } = useSelector(state => state.projects);

    const [columns, setColumns] = useState({
        todo: [],
        'in-progress': [],
        'in-review': [],
        done: [],
    });

    const [isAddingTask, setIsAddingTask] = useState(null); // stores the status/column ID
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        dispatch(fetchProjectDetails(id));
        dispatch(fetchTasks({ projectId: id }));
    }, [id, dispatch]);

    useEffect(() => {
        const grouped = {
            todo: [],
            'in-progress': [],
            'in-review': [],
            done: [],
        };

        const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

        sortedTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            } else {
                grouped.todo.push(task);
            }
        });

        setColumns(grouped);
    }, [tasks]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const previousStateString = JSON.stringify(tasks);
        const newStatus = destination.droppableId;
        const newOrder = destination.index;

        dispatch(optimisticTaskUpdate({ taskId: draggableId, newStatus, newOrder }));

        try {
            await dispatch(updateTaskStatus({
                projectId: id,
                taskId: draggableId,
                status: newStatus,
                order: newOrder,
            })).unwrap();
        } catch (err) {
            dispatch(revertOptimisticUpdate(JSON.parse(previousStateString)));
        }
    };

    const handleCreateTask = async (status) => {
        if (!newTaskTitle.trim()) return;
        try {
            await dispatch(createTask({
                projectId: id,
                data: { title: newTaskTitle, status, order: columns[status].length }
            })).unwrap();
            setNewTaskTitle('');
            setIsAddingTask(null);
        } catch (err) {
            alert('Failed to create task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await dispatch(deleteTask({ projectId: id, taskId })).unwrap();
        } catch (err) {
            alert('Failed to delete task');
        }
    };

    const handleEditTask = async (task) => {
        const newTitle = window.prompt('Edit task title:', task.title);
        if (newTitle === null || newTitle === task.title || !newTitle.trim()) return;
        try {
            await dispatch(updateTask({
                projectId: id,
                taskId: task._id,
                data: { title: newTitle }
            })).unwrap();
        } catch (err) {
            alert('Failed to update task');
        }
    };

    if (projectLoading || (loading && tasks.length === 0)) {
        return <div className="flex h-full items-center justify-center"><Spinner size="10" /></div>;
    }

    const columnHeaders = {
        todo: 'To Do',
        'in-progress': 'In Progress',
        'in-review': 'In Review',
        done: 'Done'
    };

    return (
        <div className="h-full flex flex-col p-8 bg-gray-50">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{currentProject?.name || 'Project Board'}</h1>
                    <p className="text-sm text-gray-500">Manage tasks and track project progress</p>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full min-w-max gap-6 pb-4">
                        {Object.keys(columns).map((status) => (
                            <div key={status} className="flex h-full w-80 flex-col rounded-xl bg-gray-100/50 border border-gray-200 shadow-sm">
                                <div className="p-4 flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        {columnHeaders[status]}
                                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500 font-bold">{columns[status].length}</span>
                                    </h3>
                                    <button
                                        onClick={() => setIsAddingTask(status)}
                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                        title="Add task"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </button>
                                </div>

                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 overflow-y-auto px-4 pb-4 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}
                                        >
                                            {isAddingTask === status && (
                                                <div className="mb-4 rounded-lg bg-white p-3 shadow-md border-2 border-indigo-500">
                                                    <input
                                                        autoFocus
                                                        value={newTaskTitle}
                                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(status)}
                                                        placeholder="Task title..."
                                                        className="w-full border-none p-0 text-sm focus:ring-0 placeholder-gray-400"
                                                    />
                                                    <div className="mt-2 flex justify-end gap-2 text-xs font-semibold">
                                                        <button
                                                            onClick={() => setIsAddingTask(null)}
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleCreateTask(status)}
                                                            className="text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            Create
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {columns[status].map((task, index) => (
                                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`group relative mb-3 rounded-lg bg-white p-4 shadow-sm border border-gray-200 transition-all ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 scale-105 rotate-2' : 'hover:shadow-md hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start gap-2">
                                                                <p className="text-sm font-medium text-gray-900 line-clamp-2">{task.title}</p>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleEditTask(task)}
                                                                        className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                                                        title="Edit"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteTask(task._id)}
                                                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                                        title="Delete"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 flex items-center justify-between">
                                                                {task.priority && (
                                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${task.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                                            task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                                                                'bg-blue-50 text-blue-700 border border-blue-100'
                                                                        }`}>
                                                                        {task.priority}
                                                                    </span>
                                                                )}
                                                                <div className="flex -space-x-1 overflow-hidden">
                                                                    {task.assignee?.avatar && (
                                                                        <img src={task.assignee.avatar} className="inline-block h-5 w-5 rounded-full ring-2 ring-white" alt="" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}
