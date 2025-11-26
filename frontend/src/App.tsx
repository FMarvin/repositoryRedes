import { useState, useEffect } from 'react';
import './App.css';

interface Task {
  id: number;
  title: string;
  description: string;
  completed?: boolean; // ← ahora opcional
}

const API_URL = 'http://redesumes.site:3000/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return setTasks([]);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setTasks([]);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = { title: title.trim(), description: desc.trim() || "" };
    const tempId = Date.now();
    const optimisticTask: Task = { ...newTask, id: tempId, completed: false };

    setTasks((prev: Task[]) => [...prev, optimisticTask]);
    setTitle('');
    setDesc('');

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      await fetchTasks(); // ← recarga real
    } catch (error) {
      console.error("Error al guardar");
      alert("Tarea visible pero puede no haberse guardado");
    }
  };

  const toggleComplete = async (id: number, current: boolean) => {
    setTasks((prev: Task[]) => prev.map(t => 
      t.id === id ? { ...t, completed: !current } : t
    ));

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !current }),
      });
    } catch (err) {}
  };

  const deleteTask = async (id: number) => {
    if (!confirm("¿Borrar?")) return;
    setTasks((prev: Task[]) => prev.filter(t => t.id !== id));
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Hola ingee - Proyecto Final</h1>

        <form onSubmit={addTask} className="input-group">
          <input type="text" placeholder="Título de la tarea" value={title} onChange={e => setTitle(e.target.value)} required className="input-text" />
          <input type="text" placeholder="Descripción (opcional)" value={desc} onChange={e => setDesc(e.target.value)} className="input-text" />
          <button type="submit" className="btn btn-add">+ Agregar</button>
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
                  <button onClick={() => toggleComplete(task.id, task.completed === true)} className="btn btn-check">
                    {task.completed === true ? '↩️' : '✓'}
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="btn btn-delete">
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