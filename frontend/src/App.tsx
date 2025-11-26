import { useState, useEffect } from 'react';
import './App.css';

interface Task {
  id: number;
  title: string;
  description: string;
  completed?: boolean;
}

const API_URL = 'http://redesumes.site:3000/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Cargar tareas al inicio
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        console.log("Error al cargar tareas del server:", res.status);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        // Aseguramos que todas tengan completed: false si no viene
        const fixedTasks = data.map((t: any) => ({
          ...t,
          completed: t.completed === true // solo true si es true, si no → false
        }));
        setTasks(fixedTasks);
      }
    } catch (err) {
      console.log("No se pudo conectar al servidor");
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const nuevaTarea = {
      title: title.trim(),
      description: desc.trim()
    };

    // 1. La mostramos inmediatamente (optimistic)
    const tareaLocal: Task = {
      id: Date.now(), // ID temporal
      title: nuevaTarea.title,
      description: nuevaTarea.description,
      completed: false
    };

    setTasks(prev => [...prev, tareaLocal]);
    setTitle('');
    setDesc('');

    // 2. Intentamos guardar en el servidor
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaTarea)
      });

      if (res.ok) {
        // Si el servidor la guardó bien → recargamos todo (trae el ID real)
        await fetchTasks();
      } else {
        console.log("El servidor rechazó la tarea, pero la dejamos visible");
        // No hacemos nada → queda la tarea local
      }
    } catch (err) {
      console.log("Error de red, pero la tarea queda en pantalla");
      // La tarea queda visible aunque no se guardó
    }
  };

  const toggleComplete = async (id: number, current: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !current } : t));

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !current })
      });
    } catch (err) {
      // Silencioso
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Proyecto Final</h1>

        <form onSubmit={addTask} className="input-group">
          <input
            type="text"
            placeholder="Título de la tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-text"
            required
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="input-text"
          />
          <button type="submit" className="btn btn-add">
            + Agregar
          </button>
        </form>

        <div className="task-list">
          {tasks.length === 0 ? (
            <p className="no-tasks">No hay tareas pendientes</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completed === true ? 'completed' : 'pending'}`}
              >
                <div className="task-info">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <span className="badge">
                    {task.completed === true ? 'Completada' : 'Pendiente'}
                  </span>
                </div>
                <div className="task-actions">
                  <button
                    onClick={() => toggleComplete(task.id, task.completed === true)}
                    className="btn btn-check"
                  >
                    {task.completed === true ? '↩️' : '✓'}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-delete"
                  >
                    Trash
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;