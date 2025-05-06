const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const User = require('../models/User'); // Added User model import
const jwt = require('jsonwebtoken');

// Generate a valid JWT token for testing
const token = jwt.sign({ userId: '6819faa4c24bb3be2dd8a076' }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Bookmark Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Ensure the default user exists
    const userId = '6819faa4c24bb3be2dd8a076';
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      const newUser = new User({
        _id: userId,
        email: 'default@example.com',
        username: 'defaultuser',
        password: 'defaultpassword', // Replace with a secure method
      });
      await newUser.save();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fetch all bookmarks for an authenticated user', async () => {
    const response = await request(app)
      .get(`/api/bookmarks`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should add a new bookmark for an authenticated user', async () => {
    const newBookmark = {
      userId: '6819faa4c24bb3be2dd8a076', // Include the userId field
      spotifyTrackId: 'testTrackId',
      title: 'Test Title',
      description: 'Test Description',
      startTime: 30,
      endTime: 60,
    };

    const response = await request(app)
      .post('/api/bookmarks')
      .set('Authorization', `Bearer ${token}`)
      .send(newBookmark);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe('Test Title');
    expect(response.body.description).toBe('Test Description');
  });

  it('should update a bookmark for an authenticated user', async () => {
    const bookmark = new Bookmark({
      userId: '6819faa4c24bb3be2dd8a076',
      spotifyTrackId: 'testTrackId',
      title: 'Old Title',
      description: 'Old Description',
      startTime: 30,
      endTime: 60,
    });

    await bookmark.save();

    const updatedData = {
      title: 'Updated Title',
      description: 'Updated Description',
      startTime: 40,
      endTime: 70,
    };

    const response = await request(app)
      .put(`/api/bookmarks/${bookmark._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Title');
    expect(response.body.description).toBe('Updated Description');
  });

  it('should delete a bookmark for an authenticated user', async () => {
    const bookmark = new Bookmark({
      userId: '6819faa4c24bb3be2dd8a076',
      spotifyTrackId: 'testTrackId',
      title: 'Title to Delete',
      description: 'Description to Delete',
      startTime: 30,
      endTime: 60,
    });

    await bookmark.save();

    const response = await request(app)
      .delete(`/api/bookmarks/${bookmark._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Bookmark deleted successfully');
  });
});