# ExamStream - Online Exam Platform

A MERN stack application for conducting online exams with timed uploads and automatic answer submission to Google Drive.

## Features

- 👨‍🏫 **Instructor Dashboard**: Upload questions with images, set exam timers
- 👨‍🎓 **Student Portal**: View questions, upload answers with time limits
- ⏱️ **Smart Timers**: Countdown to exam start, exam duration, and upload deadline
- 📤 **File Management**: Automatic upload to cloud storage / Google Drive
- 🔒 **Auto-disable**: Upload buttons automatically disabled after time expires
- 🌐 **Multi-device**: Accessible from any device with internet

## Quick Start

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Configure Environment Variables

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### 3. Run Development Server

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Setup Instructions

### MongoDB Atlas (Free Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

### Cloudinary (File Storage)

1. Go to https://cloudinary.com
2. Create free account
3. Get cloud name, API key, and secret from dashboard
4. Add to `.env`

### Google Drive Integration (Optional)

1. Go to Google Cloud Console
2. Create project and enable Drive API
3. Create OAuth credentials
4. Add credentials to `.env`

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect GitHub repo
5. Set environment variables
6. Deploy

### Frontend (Vercel/Netlify)

1. Go to https://vercel.com or https://netlify.com
2. Import project from GitHub
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/build`
5. Add environment variable: `REACT_APP_API_URL=your_render_backend_url`
6. Deploy

## Default Credentials

**Instructor:**

- Email: instructor@examstream.com
- Password: instructor123

**Student:**

- Email: student@examstream.com
- Password: student123

## Tech Stack

- **Frontend**: React, Axios, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **File Storage**: Cloudinary / Google Drive
- **Authentication**: JWT

## Project Structure

```
ExamStream/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── public/
└── README.md
```

## Support

For issues or questions, please create an issue in the repository.
