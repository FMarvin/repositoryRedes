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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      console.log("Intentando cargar tareas desde:", API_URL);
      const res = await fetch(API_URL);
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const data = await res.json();
      console.log("Tareas recibidas del servidor:", data);
      
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error("La respuesta no es una lista:", data);
        setTasks([]);
      }
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  const addTask = async (e: any) => {
    e.preventDefault();
    if (!title.trim()) return; 

    const newTask = { title, description: desc };
    console.log("Enviando nueva tarea:", newTask);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        console.log("Tarea guardada con éxito. Recargando lista...");

        setTitle('');
        setDesc('');

        await fetchTasks(); 
      } else {
        console.error("Error del servidor al guardar:", response.status);
      }

    } catch (error) {
      console.error("Error de red al crear tarea:", error);
    }
  };

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      fetchTasks(); // Recargar lista para ver el cambio de color
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("¿Seguro que quieres borrar esta tarea?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTasks(); // Recargar lista para que desaparezca
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Hola ingee - Proyecto Final 🚀</h1>

        {/* Formulario de agregar */}
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
          {tasks.length === 0 ? (
            <p className="no-tasks">No hay tareas pendientes</p>
          ) : (
            tasks.map((task) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;