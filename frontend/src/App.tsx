import { useState, useEffect } from 'react';
import './App.css';

// Interfaz para definir cómo se ve una tarea
interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

// URL de tu backend en producción
// NOTA: Esta es la dirección pública de tu servidor
const API_URL = 'http://redesumes.site:3000/tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // Cargar las tareas al abrir la página
  useEffect(() => {
    fetchTasks();
  }, []);

  // Función para pedir las tareas al servidor
  const fetchTasks = async () => {
    try {
      console.log("Cargando tareas...");
      const res = await fetch(API_URL);
      const data = await res.json();
      console.log("Tareas recibidas:", data);
      setTasks(data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  // Función para agregar tarea (CORREGIDA PARA ACTUALIZAR EN CALIENTE)
  const addTask = async (e: any) => {
    e.preventDefault();
    if (!title.trim()) return; 

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc }),
      });

      if (response.ok) {
        // 1. ¡TRUCO! Recargar la lista desde el servidor inmediatamente
        await fetchTasks(); 
        
        // 2. Limpiar los campos del formulario
        setTitle('');
        setDesc('');
      } else {
        console.error("Error del servidor al guardar");
      }

    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  // Función para marcar como completada/pendiente
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

  // Función para eliminar tarea
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

        {/* Lista de Tareas */}
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