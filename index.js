require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

app.get('/callback', (req, res) => {
  const { code, error } = req.query;
  console.log(req);

  if (error) {
    console.error('Error during Spotify authorization:', error);
    return res.status(400).send(`Authorization failed: ${error}`);
  }

  if (code) {
    console.log('Authorization code received:', code);
    return res.json({code: code});
  }

  res.status(400).send('No authorization code received.');
});
// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;