// frontend/src/hooks/useGameSocket.ts
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const useGameSocket = (isMultiplayer: boolean) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // State lưu dữ liệu game từ server trả về
    const [gameState, setGameState] = useState<any>(null);
    const [myRole, setMyRole] = useState<'p1' | 'p2' | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!isMultiplayer) return;

        // 1. Kết nối
        const socket = io(SERVER_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log("Đã kết nối Socket:", socket.id);
        });

        // 2. Lắng nghe các sự kiện game
        socket.on('roomCreated', (code) => {
            console.log("Phòng đã tạo:", code);
            setMyRole('p1'); // Người tạo là P1
        });

        socket.on('gameStart', (data) => {
            console.log("Game bắt đầu!", data);
            setGameState(data); // Lưu thông tin ban đầu
            // Nếu chưa có role (người join), xác định role dựa trên socket ID
            if (socket.id === data.players.p2) {
                setMyRole('p2');
            }
        });

        socket.on('gameStateUpdate', (data) => {
            setGameState(data); // Cập nhật bàn cờ mới
        });

        socket.on('error', (msg) => {
            setErrorMsg(msg);
        });

        // Cleanup
        return () => {
            socket.disconnect();
        };
    }, [isMultiplayer]);

    // --- Các hàm hành động (Gửi lên Server) ---

    const createRoom = (code: string) => {
        socketRef.current?.emit('createRoom', code);
    };

    const joinRoom = (code: string) => {
        socketRef.current?.emit('joinRoom', code);
    };

    const makeMove = (colIndex: number, roomCode: string) => {
        socketRef.current?.emit('makeMove', { roomCode, colIndex });
    };

    return { 
        socket: socketRef.current, 
        isConnected, 
        gameState, 
        myRole, 
        errorMsg,
        createRoom, // <-- Gọi hàm này để tạo phòng
        joinRoom,   // <-- Gọi hàm này để vào phòng
        makeMove 
    };
};