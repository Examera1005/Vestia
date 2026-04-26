import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleExtractClothingRequest } from './server/geminiService.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.post('/api/extract-clothing', (req, res) => {
  handleExtractClothingRequest(req, res);
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Vestia server listening on http://0.0.0.0:${port}`);
});
