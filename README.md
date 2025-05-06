# Bookmark App v2

This project is a backend service for managing bookmarks, specifically designed to work with Spotify tracks. It provides APIs to create and retrieve bookmarks for users.

## Prerequisites

Before setting up this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/) (optional, for running MongoDB via Docker)

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd bookmark_app_v2
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure the Database**

   - If you are running MongoDB locally, ensure it is running on `localhost:27017`.
   - Alternatively, you can use Docker to run MongoDB:

     ```bash
     docker-compose up -d
     ```

   - Update the `config/db.js` file with your MongoDB connection string if needed.

4. **Start the Server**

   ```bash
   npm start
   ```

   The server will start on `http://localhost:5000` by default.

## API Endpoints

### 1. Get All Bookmarks

**GET** `/bookmarks`

Query Parameters:
- `userId` (required): The ID of the user whose bookmarks you want to retrieve.

### 2. Add a New Bookmark

**POST** `/bookmarks`

Request Body:
- `userId` (required): The ID of the user.
- `spotifyTrackId` (required): The Spotify track ID.
- `startTime` (optional): The start time of the bookmark.
- `endTime` (optional): The end time of the bookmark.

## Spotify Integration

### Prerequisites

To enable Spotify integration, you need to set up the following environment variables in a `.env` file:

- `SPOTIFY_CLIENT_ID`: Your Spotify app's client ID.
- `SPOTIFY_CLIENT_SECRET`: Your Spotify app's client secret.
- `SPOTIFY_REDIRECT_URI`: The redirect URI configured in your Spotify app.
- `JWT_SECRET`: A secret key for signing JSON Web Tokens (used for user authentication).

### API Endpoints for Spotify

#### 1. Generate Spotify OAuth Link

**GET** `/auth/spotify/link`

Response:
- `url`: The Spotify OAuth link for the user to authorize the app.

#### 2. Link Spotify Account

**POST** `/auth/spotify`

Request Body:
- `code` (required): The authorization code obtained from Spotify after user authorization.
- `userId` (required): The ID of the user linking their Spotify account.

Response:
- `message`: Confirmation that the Spotify account was linked successfully.

### Example Workflow

1. Call the `/auth/spotify/link` endpoint to get the Spotify OAuth link.
2. Redirect the user to the link and obtain the authorization code after they authorize the app.
3. Use the `/auth/spotify` endpoint to link the user's Spotify account using the authorization code.

## Integrating with a React Native Project

To integrate this backend with a React Native project, follow these steps:

1. **Set Up Axios**

   Install Axios in your React Native project:

   ```bash
   npm install axios
   ```

2. **Create an API Service**

   Create a file (e.g., `api.js`) in your React Native project to handle API requests:

   ```javascript
   import axios from 'axios';

   const API_BASE_URL = 'http://localhost:3000';

   export const getBookmarks = async (userId) => {
     try {
       const response = await axios.get(`${API_BASE_URL}/bookmarks`, {
         params: { userId },
       });
       return response.data;
     } catch (error) {
       console.error('Error fetching bookmarks:', error);
       throw error;
     }
   };

   export const addBookmark = async (bookmarkData) => {
     try {
       const response = await axios.post(`${API_BASE_URL}/bookmarks`, bookmarkData);
       return response.data;
     } catch (error) {
       console.error('Error adding bookmark:', error);
       throw error;
     }
   };
   ```

3. **Use the API in Your Components**

   Example usage in a React Native component:

   ```javascript
   import React, { useEffect, useState } from 'react';
   import { View, Text, Button } from 'react-native';
   import { getBookmarks, addBookmark } from './api';

   const App = () => {
     const [bookmarks, setBookmarks] = useState([]);

     useEffect(() => {
       const fetchBookmarks = async () => {
         try {
           const data = await getBookmarks('user123');
           setBookmarks(data);
         } catch (error) {
           console.error(error);
         }
       };

       fetchBookmarks();
     }, []);

     const handleAddBookmark = async () => {
       try {
         const newBookmark = await addBookmark({
           userId: 'user123',
           spotifyTrackId: 'track123',
           startTime: 30,
           endTime: 60,
         });
         setBookmarks((prev) => [...prev, newBookmark]);
       } catch (error) {
         console.error(error);
       }
     };

     return (
       <View>
         <Text>Bookmarks:</Text>
         {bookmarks.map((bookmark, index) => (
           <Text key={index}>{bookmark.spotifyTrackId}</Text>
         ))}
         <Button title="Add Bookmark" onPress={handleAddBookmark} />
       </View>
     );
   };

   export default App;
   ```

4. **Test the Integration**

   Ensure your backend is running and accessible. Use tools like [React Native Debugger](https://github.com/jhen0409/react-native-debugger) to debug API calls if needed.