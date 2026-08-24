const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Mengizinkan pengiriman file maksimal 100MB
const io = new Server(server, { maxHttpBufferSize: 1e8 });

// Menyajikan file tampilan dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

// Menyimpan data room di memori server
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
    console.log('User terhubung:', socket.id);

    // Event untuk membuat room acak baru dari Admin Panel
    socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(2, 7);
        rooms[roomId] = { messages: [] };
socket.emit('roomCreated', roomId);
});

    // Event saat user atau OBS join ke room
socket.on('joinRoom', ({ roomId, username }) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            socket.to(roomId).emit('message', {
        socket.join(roomId);
        
        // AUTO-CREATE ROOM: Jika room belum ada di memori server, buat secara otomatis 
        // (Ini yang membuat Room Permanen / Link tetap bisa langsung aktif tanpa error)
        if (!rooms[roomId]) {
            rooms[roomId] = { messages: [] };
        }

        // Kirim pemberitahuan bergabung (kecuali untuk Admin & OBS Display)
        if (username && username !== 'AdminPanel' && username !== 'Sistem Display') {
            io.to(roomId).emit('message', {
username: 'Sistem',
text: `${username} telah bergabung!`,
                type: 'text'
                type: 'system'
});
}
});

    socket.on('sendMessage', (data) => {
        if (rooms[data.roomId]) {
            io.to(data.roomId).emit('message', data);
    // Event saat pesan dikirim
    socket.on('sendMessage', ({ roomId, username, text, type }) => {
        // AUTO-CREATE ROOM: Mencegah pesan dibuang server jika room tereset
        if (!rooms[roomId]) {
            rooms[roomId] = { messages: [] };
}

        const messageData = { username, text, type };
        rooms[roomId].messages.push(messageData);

        // Batasi riwayat pesan di server agar performa tetap ringan
        if (rooms[roomId].messages.length > 50) {
            rooms[roomId].messages.shift();
        }

        // Sebarkan pesan ke semua perangkat di room tersebut (termasuk OBS)
        io.to(roomId).emit('message', messageData);
    });

    socket.on('disconnect', () => {
        console.log('User terputus:', socket.id);
});
});

// PENTING: Penyesuaian Port untuk Cloud Hosting
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
console.log(`Server berjalan di port ${PORT}`);
});
});
