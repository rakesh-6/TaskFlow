import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTaskStatus, optimisticTaskUpdate, revertOptimisticUpdate } from '../store/slices/taskSlice';
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

    useEffect(() => {
        dispatch(fetchProjectDetails(id));
        dispatch(fetchTasks({ projectId: id }));
    }, [id, dispatch]);

    useEffect(() => {
        // Group tasks into columns
        const grouped = {
            todo: [],
            'in-progress': [],
            'in-review': [],
            done: [],
        };

        // Sort tasks by explicit order field first (if implemented deeply), falling back to date
        const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

        sortedTasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task);
            } else {
                grouped.todo.push(task); // fallback
            }
        });

        setColumns(grouped);
    }, [tasks]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        // Capture previous state for rollback
        const previousStateString = JSON.stringify(tasks);

        // Calculate new order (simplified index mapping for demo, usually involves float gap math)
        const newStatus = destination.droppableId;
        const newOrder = destination.index;

        // Optimistically update redxux store
        dispatch(optimisticTaskUpdate({
            taskId: draggableId,
            newStatus,
            newOrder,
        }));

        try {
            await dispatch(updateTaskStatus({
                projectId: id,
                taskId: draggableId,
                status: newStatus,
                order: newOrder,
            })).unwrap();
        } catch (err) {
            // Revert if API fails
            dispatch(revertOptimisticUpdate(JSON.parse(previousStateString)));
            console.error('Failed to move task');
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
        <div className="h-full flex flex-col p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{currentProject?.name || 'Project Board'}</h1>
                <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hidden">
                    Add Task
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full min-w-max gap-6 pb-4">
                        {Object.keys(columns).map((status) => (
                            <div key={status} className="flex h-full w-80 flex-col rounded-lg bg-gray-100">
                                <div className="p-3">
                                    <h3 className="text-sm font-medium text-gray-900 flex justify-between">
                                        {columnHeaders[status]}
                                        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs text-gray-600">{columns[status].length}</span>
                                    </h3>
                                </div>

                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 overflow-y-auto p-3 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50' : ''
                                                }`}
                                        >
                                            {columns[status].map((task, index) => (
                                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`mb-3 rounded bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-indigo-500' : 'hover:shadow'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                                            </div>
                                                            {task.priority && (
                                                                <span className="mt-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                                                                    {task.priority}
                                                                </span>
                                                            )}
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
