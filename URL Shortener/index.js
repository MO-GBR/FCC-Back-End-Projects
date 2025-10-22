require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./DB/Connection');
const app = express();
const urlRouter = require('./Routes/url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/', urlRouter);

app.listen(port, function() {
  connectDB();
  console.log(`Listening on port ${port}`);
});
