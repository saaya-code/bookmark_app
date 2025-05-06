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
  const { userId, spotifyTrackId, title, description, startTime, endTime } = req.body;

  try {
    const newBookmark = new Bookmark({ userId, spotifyTrackId, title, description, startTime, endTime });
    const bookmark = await newBookmark.save();
    res.json(bookmark);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update a bookmark
router.put('/:id', async (req, res) => {
  const { title, description, startTime, endTime } = req.body;

  try {
    const updatedBookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      { title, description, startTime, endTime, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedBookmark) {
      return res.status(404).send('Bookmark not found');
    }

    res.json(updatedBookmark);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete a bookmark
router.delete('/:id', async (req, res) => {
  try {
    const deletedBookmark = await Bookmark.findByIdAndDelete(req.params.id);

    if (!deletedBookmark) {
      return res.status(404).send('Bookmark not found');
    }

    res.json({ message: 'Bookmark deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;