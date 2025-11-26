import { useState, useEffect } from 'react';
import './App.css';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const API_URL = 'http://redesumes.site:3000/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false); // Para evitar doble envío

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      
      // Asegúrate de que sea un array
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.warn("Respuesta inesperada:", data);
        setTasks([]);
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
      alert("No se pudieron cargar las tareas. ¿El servidor está encendido?");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTaskFromForm = {
      title: title.trim(),
      description: desc.trim(),
      completed: false
    };

    // Optimistic UI: agregamos la tarea inmediatamente (con ID temporal)
    const tempId = Date.now();
    const optimisticTask = { ...newTaskFromForm, id: tempId };
    setTasks(prev => [...prev, optimisticTask]);

    // Limpiamos el formulario
    setTitle('');
    setDesc('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskFromForm),
      });

      if (response.ok) {
        const createdTask = await response.json(); // ¡Importante! El backend debe devolver la tarea creada con su ID real
        // Reemplazamos la tarea temporal por la real
        setTasks(prev => prev.map(t => t.id === tempId ? createdTask : t));
      } else {
        throw new Error("Error al guardar en el servidor");
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
      alert("No se pudo guardar la tarea. Se revertirá.");
      // Quitamos la tarea optimista si falló
      setTasks(prev => prev.filter(t => t.id !== tempId));
      // Recargamos por si acaso
      fetchTasks();
    }
  };

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: !currentStatus } : t
    );
    setTasks(updatedTasks); // Optimistic update

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      fetchTasks(); // Revertir si falla
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("¿Seguro que quieres borrar esta tarea?")) return;

    setTasks(prev => prev.filter(t => t.id !== id)); // Optimistic delete

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error al eliminar");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar. Recargando...");
      fetchTasks();
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Hola ingee - Proyecto Final 🚀</h1>

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
          <button type="submit" className="btn btn-add" disabled={loading}>
            ➕ Agregar
          </button>
        </form>

        <div className="task-list">
          {loading && tasks.length === 0 ? (
            <p>Cargando tareas...</p>
          ) : tasks.length === 0 ? (
            <p className="no-tasks">No hay tareas pendientes</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : 'pending'}`}>
                <div className="task-info">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <span className="badge">
                    {task.completed ? 'Completada' : 'Pendiente'}
                  </span>
                </div>
                <div className="task-actions">
                  <button
                    onClick={() => toggleComplete(task.id, task.completed)}
                    className="btn btn-check"
                  >
                    {task.completed ? '↩️' : '✅'}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-delete"
                  >
                    🗑️
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