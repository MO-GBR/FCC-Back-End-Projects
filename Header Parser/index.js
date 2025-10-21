// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// API endpoint (both /api and /api/whoami accepted)
app.get(['/api', '/api/whoami'], (req, res) => {
  // IP: prefer X-Forwarded-For (trust proxy above), fallback to req.connection or req.socket
  // express populates req.ip using trust proxy setting; we'll use req.ip but sanitize IPv6 prefix
  let ipaddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;

  // If x-forwarded-for contains multiple IPs, take the first one
  if (req.headers['x-forwarded-for']) {
    ipaddress = req.headers['x-forwarded-for'].split(',')[0].trim();
  }

  // Some platforms give IPv6 mapped IPv4 like ::ffff:127.0.0.1 — tidy that
  if (typeof ipaddress === 'string' && ipaddress.startsWith('::ffff:')) {
    ipaddress = ipaddress.replace('::ffff:', '');
  }

  // Language — use Accept-Language header's first value
  const langHeader = req.headers['accept-language'] || '';
  const language = langHeader.split(',')[0] || '';

  // Software — use User-Agent header (full string inside parentheses is acceptable)
  const software = req.headers['user-agent'] || '';

  res.json({
    ipaddress,
    language,
    software
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
