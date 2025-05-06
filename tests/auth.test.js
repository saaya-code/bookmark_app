const request = require("supertest");
const app = require("../index");
const nock = require("nock");
const mongoose = require("mongoose");
const User = require("../models/User");

describe("Auth Routes", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    nock("https://accounts.spotify.com").post("/api/token").reply(200, {
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
    nock.cleanAll();
  });

  describe("Spotify Callback and User Saving", () => {
    beforeAll(async () => {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });

    afterAll(async () => {
      await mongoose.connection.close();
    });

    it("should save user with Spotify ID and tokens", async () => {
      const mockSpotifyId = "mock_spotify_id";
      const mockAccessToken = "mock_access_token";
      const mockRefreshToken = "mock_refresh_token";

      // Simulate saving user to database
      let user = await User.findOne({ spotifyId: mockSpotifyId });
      if (!user) {
        user = new User({
          email: "test@example.com",
          username: "testuser",
          password: "password123",
          spotifyId: mockSpotifyId,
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        });
      } else {
        user.accessToken = mockAccessToken;
        user.refreshToken = mockRefreshToken;
      }
      await user.save();

      // Verify user is saved correctly
      const savedUser = await User.findOne({ spotifyId: mockSpotifyId });
      expect(savedUser).not.toBeNull();
      expect(savedUser.spotifyId).toBe(mockSpotifyId);
      expect(savedUser.accessToken).toBe(mockAccessToken);
      expect(savedUser.refreshToken).toBe(mockRefreshToken);
    });

    it("should handle missing Spotify ID gracefully", async () => {
      const invalidSpotifyId = "non_existent_id";
      const user = await User.findOne({ spotifyId: invalidSpotifyId });
      expect(user).toBeNull();
    });

  });
});
