require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const axios = require('axios');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

app.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('Error during Spotify authorization:', error);
    return res.status(400).send(`Authorization failed: ${error}`);
  }

  if (code) {
    try {
      // Exchange the authorization code for tokens
      const response = await axios.post('https://accounts.spotify.com/api/token', null, {
        params: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
          client_id: process.env.SPOTIFY_CLIENT_ID,
          client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, refresh_token } = response.data;

      // Save the tokens and Spotify ID to the database
      const spotifyUser = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const { id: spotifyId, email } = spotifyUser.data;

      let user = await User.findOne({ spotifyId });
      if (!user) {
        user = new User({
          email: email || 'unknown@example.com',
          username: spotifyId,
          password: 'defaultpassword', // Replace with a secure method
          spotifyId,
          accessToken: access_token,
          refreshToken: refresh_token,
        });
      } else {
        user.accessToken = access_token;
        user.refreshToken = refresh_token;
      }
      await user.save();

      res.json({ message: 'Authorization successful', user });
    } catch (err) {
      console.error('Error exchanging authorization code:', err);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(400).send('No authorization code received.');
  }
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookmarks', require('./routes/bookmarks'));

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;