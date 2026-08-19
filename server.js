import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jobsHandler from './api/jobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// 잡아바 API 요청 처리
app.all('/api/jobs', async (req, res) => {
    try {
        await jobsHandler(req, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 프론트엔드 빌드 파일 서빙
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});