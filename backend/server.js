require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración de la conexión usando variables de entorno
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'app_db',
    port: process.env.DB_PORT || 3306
};

// Función para conectar con reintentos
async function connectToDB() {
    let retries = 5;
    while (retries) {
        try {
            const connection = await mysql.createConnection(dbConfig);
            console.log("¡Conectado a la Base de Datos MySQL exitosamente!");
            return connection;
        } catch (err) {
            console.error(`Error conectando a DB, reintentando... (${retries} restantes)`);
            console.error("Detalle:", err.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
    console.error("No se pudo conectar a la base de datos.");
    process.exit(1);
}

let db;
connectToDB().then(connection => { db = connection; });

// --- RUTAS ---

// 1. Obtener todas las tareas
app.get('/tasks', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM tasks');
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 2. Crear una tarea
app.post('/tasks', async (req, res) => {
    const { title, description } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO tasks (title, description) VALUES (?, ?)',
            [title, description]
        );
        res.json({ id: result.insertId, title, description, completed: false });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3. Actualizar estado de tarea
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    try {
        await db.execute('UPDATE tasks SET completed = ? WHERE id = ?', [completed, id]);
        res.json({ message: 'Tarea actualizada' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 4. Eliminar tarea
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Tarea eliminada' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Ruta de salud
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});