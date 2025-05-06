const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');

describe('Bookmark Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fetch all bookmarks for a user', async () => {
    const response = await request(app).get('/api/bookmarks?userId=testUser');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should add a new bookmark', async () => {
    const newBookmark = {
      userId: 'testUser',
      spotifyTrackId: 'testTrackId',
      startTime: 30,
      endTime: 60,
    };

    const response = await request(app)
      .post('/api/bookmarks')
      .send(newBookmark);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.userId).toBe('testUser');
  });
});