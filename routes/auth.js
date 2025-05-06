const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const User = require('../models/User');
const router = express.Router();

router.post('/spotify', async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log('Spotify token response:', response.data);
    const { access_token, refresh_token } = response.data;

    // Fetch Spotify user profile to get spotifyId
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const spotifyId = profileResponse.data.id;

    // Save user to database
    let user = await User.findOne({ spotifyId });
    if (!user) {
      user = new User({ spotifyId, accessToken: access_token, refreshToken: refresh_token });
    } else {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
    }
    await user.save();

    res.json({ access_token, refresh_token });
  } catch (err) {
    console.error('Error during Spotify authentication:', err.response?.data || err.message);
    res.status(err.response?.status || 500).send(err.response?.data || 'Spotify authentication failed');
  }
});

module.exports = router;