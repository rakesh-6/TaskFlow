import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// --- Mock Data ---
const INITIAL_DATA = {
    columns: {
        'col-1': { id: 'col-1', title: 'To Do', taskIds: ['task-1', 'task-2', 'task-3', 'task-4'] },
        'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['task-5', 'task-6'] },
        'col-3': { id: 'col-3', title: 'Done', taskIds: ['task-7', 'task-8'] },
    },
    tasks: {
        'task-1': { id: 'task-1', title: 'Design system audit', status: 'todo' },
        'task-2': { id: 'task-2', title: 'Implement swipe gestures', status: 'todo' },
        'task-3': { id: 'task-3', title: 'Accessibility review', status: 'todo' },
        'task-4': { id: 'task-4', title: 'Performance benchmarks', status: 'todo' },
        'task-5': { id: 'task-5', title: 'Responsive grid system', status: 'in-progress' },
        'task-6': { id: 'task-6', title: 'Keyboard shortcuts panel', status: 'in-progress' },
        'task-7': { id: 'task-7', title: 'Project setup', status: 'done' },
        'task-8': { id: 'task-8', title: 'Initial research', status: 'done' },
    },
    columnOrder: ['col-1', 'col-2', 'col-3'],
};

// --- Custom Hooks ---
const useUndo = () => {
    const [undoAction, setUndoAction] = useState(null);
    const [showUndo, setShowUndo] = useState(false);

    const triggerUndo = (action) => {
        setUndoAction(() => action);
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 5000);
    };

    const handleUndo = () => {
        if (undoAction) undoAction();
        setShowUndo(false);
    };

    return { showUndo, triggerUndo, handleUndo };
};

// --- Main Component ---
export default function TaskFlowRebuild() {
    const [data, setData] = useState(INITIAL_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { showUndo, triggerUndo, handleUndo } = useUndo();

    // Simulate initial loading for skeleton demo
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Filter tasks based on search
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerSearch = searchTerm.toLowerCase();
        const newTasks = {};
        Object.entries(data.tasks).forEach(([id, task]) => {
            if (task.title.toLowerCase().includes(lowerSearch)) {
                newTasks[id] = task;
            }
        });

        const newColumns = {};
        Object.entries(data.columns).forEach(([id, col]) => {
            newColumns[id] = {
                ...col,
                taskIds: col.taskIds.filter(tid => newTasks[tid]),
            };
        });

        return { ...data, tasks: newTasks, columns: newColumns };
    }, [data, searchTerm]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '?' && !editingTaskId) setShowShortcuts(prev => !prev);
            if (e.key === 'Escape') {
                setShowShortcuts(false);
                setEditingTaskId(null);
            }
            if (e.key === '/' && !editingTaskId) {
                e.preventDefault();
                document.getElementById('task-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editingTaskId]);

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const start = data.columns[source.droppableId];
        const finish = data.columns[destination.droppableId];

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...start, taskIds: newTaskIds };
            setData(prev => ({
                ...prev,
                columns: { ...prev.columns, [newColumn.id]: newColumn },
            }));
            return;
        }

        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = { ...start, taskIds: startTaskIds };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finish, taskIds: finishTaskIds };

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        }));
    };

    const addTask = (columnId, title) => {
        if (!title.trim()) return;
        const newId = `task-${Date.now()}`;
        const newTask = { id: newId, title, status: 'todo' };

        setData(prev => ({
            ...prev,
            tasks: { ...prev.tasks, [newId]: newTask },
            columns: {
                ...prev.columns,
                [columnId]: {
                    ...prev.columns[columnId],
                    taskIds: [newId, ...prev.columns[columnId].taskIds],
                },
            },
        }));
    };

    const deleteTask = (taskId, columnId) => {
        const previousData = JSON.parse(JSON.stringify(data));
        setData(prev => {
            const newTasks = { ...prev.tasks };
            delete newTasks[taskId];
            const newColumn = {
                ...prev.columns[columnId],
                taskIds: prev.columns[columnId].taskIds.filter(id => id !== taskId),
            };
            return {
                ...prev,
                tasks: newTasks,
                columns: { ...prev.columns, [columnId]: newColumn },
            };
        });
        triggerUndo(() => setData(previousData));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3 lg:top-0 lg:bottom-0 lg:left-0 lg:w-64 lg:border-r lg:border-t-0 flex lg:flex-col justify-around lg:justify-start lg:gap-8 transition-all duration-300">
                <div className="hidden lg:flex items-center gap-3 px-2 py-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">T</div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</h1>
                </div>

                <div className="flex lg:flex-col gap-1 w-full max-w-md lg:max-w-none">
                    {['Dashboard', 'Projects', 'Tasks', 'Settings'].map(item => (
                        <button key={item} className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 lg:py-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group">
                            <span className="w-6 h-6 rounded bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-xs">O</span>
                            <span className="text-xs lg:text-sm font-medium">{item}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <main className="pb-24 lg:pb-8 lg:pl-64 min-h-screen transition-all duration-300">
                <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-transparent">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Launch Board</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live project • {Object.keys(data.tasks).length} tasks total
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <input
                                id="task-search"
                                type="text"
                                placeholder="Search tasks... (/)"
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">S</span>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                            <span>+</span> New Task
                        </button>
                    </div>
                </header>

                <div className="px-6 py-4">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {data.columnOrder.map(columnId => {
                                const column = filteredData.columns[columnId];
                                return (
                                    <div key={columnId} className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
                                        <div className="flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800 tracking-tight">{column.title}</h3>
                                                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-bold">{column.taskIds.length}</span>
                                            </div>
                                        </div>

                                        <div className="px-1">
                                            <input
                                                type="text"
                                                placeholder="+ Add task"
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        addTask(columnId, e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                        </div>

                                        <Droppable droppableId={columnId}>
                                            {(provided, snapshot) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.ref}
                                                    className={`min-h-[200px] flex flex-col gap-3 p-1 transition-all duration-300 rounded-2xl ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}
                                                >
                                                    {isLoading ? (
                                                        [1, 2, 3].map(i => (
                                                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-pulse">
                                                                <div className="h-4 bg-slate-100 rounded-md w-3/4 mb-4"></div>
                                                                <div className="flex justify-between items-center">
                                                                    <div className="h-6 w-6 bg-slate-100 rounded-full"></div>
                                                                    <div className="h-3 bg-slate-100 rounded-md w-12"></div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        column.taskIds.map((taskId, index) => {
                                                            const task = data.tasks[taskId];
                                                            return (
                                                                <Draggable key={taskId} draggableId={taskId} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.ref}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-xl rotate-2 scale-105 border-indigo-400 z-50' : ''}`}
                                                                        >
                                                                            <div className="flex items-start justify-between gap-3">
                                                                                {editingTaskId === taskId ? (
                                                                                    <input
                                                                                        autoFocus
                                                                                        className="flex-1 text-sm font-medium text-slate-900 border-b border-indigo-500 focus:outline-none"
                                                                                        value={task.title}
                                                                                        onChange={(e) => {
                                                                                            const newTitle = e.target.value;
                                                                                            setData(prev => ({
                                                                                                ...prev,
                                                                                                tasks: { ...prev.tasks, [taskId]: { ...task, title: newTitle } }
                                                                                            }));
                                                                                        }}
                                                                                        onBlur={() => setEditingTaskId(null)}
                                                                                        onKeyDown={(e) => e.key === 'Enter' && setEditingTaskId(null)}
                                                                                    />
                                                                                ) : (
                                                                                    <p
                                                                                        className="text-sm font-medium text-slate-900 leading-snug cursor-pointer flex-1"
                                                                                        onClick={() => setEditingTaskId(taskId)}
                                                                                    >
                                                                                        {task.title}
                                                                                    </p>
                                                                                )}
                                                                                <button
                                                                                    onClick={() => deleteTask(taskId, columnId)}
                                                                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                                                                >
                                                                                    D
                                                                                </button>
                                                                            </div>
                                                                            <div className="mt-4 flex items-center justify-between">
                                                                                <div className="flex -space-x-1.5 ">
                                                                                    {[1, 2].map(i => (
                                                                                        <div key={i} className={`inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-${2 + i}00 text-[8px] flex items-center justify-center font-bold`}>U</div>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="flex items-center gap-3 text-slate-400">
                                                                                    <span className="text-[10px] font-semibold">C 2</span>
                                                                                    <span className="text-[10px] font-semibold">A 1</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })
                                                    )}
                                                    {!isLoading && column.taskIds.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                                                            <span className="text-2xl mb-2 grayscale">✨</span>
                                                            <p className="text-xs font-medium text-slate-400">No tasks here</p>
                                                            <button className="mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-700">Add first task</button>
                                                        </div>
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                </div>
            </main>

            {showUndo && (
                <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                        <span className="text-sm font-medium">Task deleted from board</span>
                        <button
                            onClick={handleUndo}
                            className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Undo
                        </button>
                    </div>
                </div>
            )}

            {showShortcuts && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Keyboard Shortcuts</h3>
                            <button onClick={() => setShowShortcuts(false)} className="text-slate-400 hover:text-slate-600">X</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { key: '?', label: 'Open shortcuts help' },
                                { key: '/', label: 'Search tasks' },
                                { key: 'Esc', label: 'Cancel editing or close modal' },
                                { key: 'N', label: 'Create new task (global)' },
                            ].map(shortcut => (
                                <div key={shortcut.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-sm text-slate-600 font-medium">{shortcut.label}</span>
                                    <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-900">{shortcut.key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
