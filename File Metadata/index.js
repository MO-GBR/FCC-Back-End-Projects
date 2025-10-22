require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup (store in memory — we don't need to save files on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// File metadata endpoint (FCC expects /api/fileanalyse)
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Build response exactly as FCC expects
  const { originalname, mimetype, size } = req.file;
  return res.json({
    name: originalname,
    type: mimetype,
    size: size
  });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`File Metadata Microservice running on port ${PORT}`);
});
