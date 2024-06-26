import io from 'socket.io-client';
import React, { useState, useEffect } from 'react';

const socket = io('/');

function App() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newMessage = {
            body: message,
            userId: userId,
            username: username,
        };
        socket.emit('message', newMessage);
        setMessage('');
    };

    useEffect(() => {
        socket.on('message', receiveMessage);

        return () => {
            socket.off('message', receiveMessage);
        };
    }, []);

    const receiveMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://192.168.3.61:4000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: e.target.username.value,
                    password: e.target.password.value,
                }),
            });
            const data = await response.json();
            if (response.status === 201) {
                setUsername(e.target.username.value);
                setUserId(data.userId);
                setIsLoggedIn(true);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error al registrar:', error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://192.168.3.21:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: e.target.username.value,
                    password: e.target.password.value,
                }),
            });
            const data = await response.json();
            if (response.status === 200) {
                setUsername(e.target.username.value);
                setUserId(data.userId);
                setIsLoggedIn(true);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    };

    return (
        <div className="h-screen bg-zinc-800 text-white flex items-center justify-center">
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="bg-zinc-900 p-10">
                    <h1 className="text-2xl font-bold my-2">SALA DE CHAT</h1>
                    <ul>
                        {messages.map((message, i) => (
                            <li
                                key={i}
                                className={`my-2 p-2 table text-sm rounded-md ${
                                    message.userId === userId ? 'bg-sky-700 ml-auto' : 'bg-black'
                                }`}
                            >
                                <b className="text-sm block">
                                    USUARIO: {message.userId === userId ? 'Tú' : message.username}
                                </b>
                                <span className="text-md">{message.body}</span>
                            </li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        placeholder="Escribe tu mensaje...."
                        className="border-2 border-zinc-500 p-2 w-full text-black"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit">Enviar</button>
                </form>
            ) : (
                <div>
                    <form onSubmit={handleRegister} className="bg-zinc-900 p-10">
                        <h1 className="text-2xl font-bold my-2">Registrarse</h1>
                        <input
                            type="text"
                            name="username"
                            placeholder="Nombre de usuario"
                            className="border-2 border-zinc-500 p-2 w-full text-black"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            className="border-2 border-zinc-500 p-2 w-full text-black"
                        />
                        <button type="submit">Registrarse</button>
                    </form>
                    <form onSubmit={handleLogin} className="bg-zinc-900 p-10">
                        <h1 className="text-2xl font-bold my-2">Iniciar sesión</h1>
                        <input
                            type="text"
                            name="username"
                            placeholder="Nombre de usuario"
                            className="border-2 border-zinc-500 p-2 w-full text-black"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            className="border-2 border-zinc-500 p-2 w-full text-black"
                        />
                        <button type="submit">Iniciar sesión</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default App;
