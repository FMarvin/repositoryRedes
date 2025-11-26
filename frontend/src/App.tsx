import { useState, useEffect } from 'react';
import './App.css';

// Interfaz para definir cómo se ve una tarea
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

// AHORA (Usa tu dominio real):
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
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  // AQUÍ ESTABA EL ERROR: Cambiamos 'FormEvent' por 'any' para evitar problemas de TypeScript
  const addTask = async (e: any) => {
    e.preventDefault();
    if (!title) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc }),
      });
      setTitle('');
      setDesc('');
      fetchTasks();
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      fetchTasks();
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("¿Seguro que quieres borrar esta tarea?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Hola pedrito</h1>

        <form onSubmit={addTask} className="input-group">
          <input
            type="text"
            placeholder="Título de la tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-text"
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="input-text"
          />
          <button type="submit" className="btn btn-add">
            ➕ Agregar
          </button>
        </form>

        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : 'pending'}`}>
              <div className="task-info">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <span className="badge">
                  {task.completed ? 'Completada' : 'Pendiente'}
                </span>
              </div>
              <div className="task-actions">
                <button
                  onClick={() => toggleComplete(task.id, task.completed)}
                  className="btn btn-check"
                  title="Marcar como lista"
                >
                  {task.completed ? '↩️' : '✅'}
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="btn btn-delete"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="no-tasks">No hay tareas pendientes</p>}
        </div>
      </div>
    </div>
  );
}

export default App;