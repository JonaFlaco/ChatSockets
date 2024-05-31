import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import pg from 'pg';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'chat_app',
    password: '123456',
    port: 5432,
});

app.use(express.json());
app.use(cors());

io.on('connection', socket => {
    console.log('Nuevo cliente conectado: ', socket.id);

    socket.on('message', async (data) => {
        console.log(data);
        // socket.broadcast.emit('message', data)
        const { body, userId } = data;

        try {
            // Obtener el nombre de usuario desde la base de datos
            const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length > 0) {
                const username = userResult.rows[0].username;
                // Guardar el mensaje en la base de datos
                await pool.query('INSERT INTO messages (body, user_id) VALUES ($1, $2)', [body, userId]);
                // Emitir el mensaje con el nombre de usuario
                io.emit('message', { body, userId, username });
            } else {
                console.error('Usuario no encontrado');
            }
        } catch (error) {
            console.error('Error al guardar el mensaje:', error);
        }
    });
});

// Manejo del registro de usuarios
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, password]);
        res.status(201).json({ userId: result.rows[0].id });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Manejo del inicio de sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username, password]);
        if (result.rows.length > 0) {
            res.status(200).json({ userId: result.rows[0].id });
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

server.listen(4000, () => {
    console.log('Server en el puerto 4000');
});
