// backend/routes/gameLogicRoute.js
const express = require('express');
const router = express.Router();
const { getAiMove, calculateScore } = require('../controller/gameLogic');

// API: Lấy nước đi của AI
// POST /api/game/ai-move
router.post('/ai-move', (req, res) => {
    const { aiBoard, playerBoard, dieValue } = req.body;
    
    if (!aiBoard || !playerBoard || !dieValue) {
        return res.status(400).json({ error: "Missing data" });
    }

    const result = getAiMove(aiBoard, playerBoard, dieValue);
    res.json(result); // Trả về { col: number }
});

// API: Tính điểm (Nếu muốn tính ở server cho bảo mật)
router.post('/calculate-score', (req, res) => {
    const { board } = req.body;
    const score = calculateScore(board);
    res.json({ score });
});

module.exports = router;