# SafeWatch - Kid-Friendly YouTube Viewer

## Overview
SafeWatch is a web application designed to provide a safe YouTube viewing experience for children under 12. It includes comprehensive content filtering to block inappropriate videos, including those with graphic violence and profanity.

## Key Features
- Direct blocklisting of known inappropriate videos
- Enhanced metadata filtering for titles, descriptions, and tags
- Child-friendly user interface with large buttons and simple navigation
- Parental controls with password protection
- Category-based browsing for kid-appropriate content
- Search functionality with inappropriate term filtering

## Technical Details
- Frontend: React with Vite
- Backend: Node.js with Express
- API: YouTube Data API v3
- Content Filtering: Multi-layered approach with metadata analysis

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- A YouTube Data API key

### Getting a YouTube API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the YouTube Data API v3
4. Create an API key
5. Copy the API key for use in the application

### Installation

#### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your YouTube API key:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   PORT=3001
   ALLOWED_ORIGINS=http://localhost:3000
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Running the Application

#### Using the Start Script (Linux/Mac)
1. Make the start script executable:
   ```
   chmod +x start.sh
   ```

2. Run the start script:
   ```
   ./start.sh
   ```

#### Manual Start (Windows)
1. Start the backend server:
   ```
   cd backend
   node server.js
   ```

2. In a separate Command Prompt window, start the frontend:
   ```
   cd frontend
   npm run dev
   ```

3. Access the application at http://localhost:3000

## Windows-Specific Instructions

### PowerShell Execution Policy
If you encounter PowerShell execution policy errors:

1. Run PowerShell as Administrator
2. Execute:
   ```
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Type "Y" to confirm

### Command Separator
PowerShell doesn't support the `&&` operator. Use these alternatives:

1. Run commands separately in different Command Prompt windows
2. Use semicolons in PowerShell:
   ```
   cd frontend; npm run dev
   ```

## Using the Application

### Parent Zone
- Default password: `parent123`
- Access parental controls at http://localhost:3000/parent
- Set time limits and content filtering levels

### Blocked Content
The application specifically blocks:
- Videos with graphic violence (e.g., https://www.youtube.com/shorts/jIqWSbIbxn0)
- Videos with profanity (e.g., https://www.youtube.com/shorts/gkpXk_15xdI)
- Videos with inappropriate metadata based on keyword filtering

## Troubleshooting

### API Key Issues
If you see "API key not valid" errors:
1. Verify your API key is correct in the `.env` file
2. Ensure the YouTube Data API v3 is enabled in your Google Cloud Console
3. Check for any quota limitations

### Connection Issues
If the frontend can't connect to the backend:
1. Ensure both servers are running
2. Check that the backend is running on port 3001
3. Verify the API URL in `/frontend/src/services/api.js` is set to `http://localhost:3001/api`

## License
This project is licensed under the MIT License.
