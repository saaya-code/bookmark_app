const express = require('express');
const Bookmark = require('../models/Bookmark');
const router = express.Router();

// Get all bookmarks for a user
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.query.userId });
    res.json(bookmarks);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add a new bookmark
router.post('/', async (req, res) => {
  const { userId, spotifyTrackId, startTime, endTime } = req.body;

  try {
    const newBookmark = new Bookmark({ userId, spotifyTrackId, startTime, endTime });
    const bookmark = await newBookmark.save();
    res.json(bookmark);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;