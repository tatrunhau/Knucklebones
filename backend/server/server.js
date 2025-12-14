// backend/server/server.js

// 1. Load biến môi trường từ file .env
require('dotenv').config();

// 2. Import các thư viện cần thiết
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 3. Import các Route (Định tuyến)
// Route cho API REST (ví dụ: AI tính toán, lưu điểm số)
const gameRoutes = require('../routes/gameLogicRoute');
// Route cho Socket.IO (ví dụ: tạo phòng, đánh cờ 1v1)
const socketRouter = require('../routes/socketRouter');

// 4. Khởi tạo App và Server
const app = express();
const server = http.createServer(app);

// 5. Cấu hình Middleware
// CORS: Cho phép Frontend (port 3000) gọi được Backend
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

// JSON Parser: Để đọc dữ liệu JSON từ body request
app.use(express.json());

// 6. Cấu hình Routes (REST API)
// Mọi request bắt đầu bằng /api/game sẽ đi vào gameRoutes
app.use('/api/game', gameRoutes);

// Route kiểm tra sức khỏe server (Health Check)
app.get('/', (req, res) => {
    res.send('Knucklebones Game Server is Running!');
});

// 7. Cấu hình Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Kích hoạt Router cho Socket (Chuyển io instance vào router để xử lý)
socketRouter(io);

// 8. Khởi chạy Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🔗 Frontend URL allowed: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});