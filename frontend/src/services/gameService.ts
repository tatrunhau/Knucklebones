// frontend/src/services/gameService.ts
import api from '@/lib/axios';

// Chỉ cần hàm này nếu bạn muốn Server tính nước đi cho AI (để game mượt hơn)
export const getServerAiMove = async (aiBoard: number[][], playerBoard: number[][], dieValue: number) => {
    try {
        const response = await api.post('/ai-move', { aiBoard, playerBoard, dieValue });
        return response.data; // Trả về { col: 2 }
    } catch (error) {
        console.error("Lỗi gọi AI Server:", error);
        return null;
    }
};