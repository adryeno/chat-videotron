const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Mengizinkan pengiriman file maksimal 100MB
const io = new Server(server, { maxHttpBufferSize: 1e8 });

// Menyajikan file tampilan dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
    socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(2, 8);
        rooms[roomId] = { created_at: Date.now() };
        
        // Timer otomatis menghapus ruang obrolan setelah 24 jam
        setTimeout(() => {
            delete rooms[roomId];
            io.to(roomId).emit('roomExpired');
        }, 24 * 60 * 60 * 1000);

        socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', ({ roomId, username }) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            socket.to(roomId).emit('message', {
                username: 'Sistem',
                text: `${username} telah bergabung!`,
                type: 'text'
            });
        }
    });

    socket.on('sendMessage', (data) => {
        if (rooms[data.roomId]) {
            io.to(data.roomId).emit('message', data);
        }
    });
});

// PENTING: Penyesuaian Port untuk Cloud Hosting
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});