# ExamStream - Deployment Guide

## 🚀 Complete Setup & Deployment Instructions

### Part 1: Initial Setup (5 minutes)

#### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Part 2: Database Setup (5 minutes)

#### MongoDB Atlas (Free Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Click "Build a Database" → Choose FREE tier
4. Select a cloud provider and region (closest to you)
5. Click "Create Cluster" (takes 1-3 minutes)
6. Click "Connect" → "Connect your application"
7. Copy the connection string
8. Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/examstream?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_min_32_characters_long_12345
NODE_ENV=development

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Drive (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=
```

**Important:** Replace `<username>` and `<password>` in the MongoDB URI with your database user credentials.

### Part 3: Cloudinary Setup (5 minutes)

Cloudinary provides free cloud storage for images and files.

1. Go to https://cloudinary.com/users/register/free
2. Create a free account
3. Go to Dashboard
4. Copy these credentials:
   - Cloud Name
   - API Key
   - API Secret
5. Add them to `backend/.env` file

### Part 4: Testing Locally (2 minutes)

#### Option A: Run Both Together

```bash
npm run dev
```

#### Option B: Run Separately

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm start
```

Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Part 5: Google Drive Integration (Optional - 10 minutes)

If you want answers to be automatically uploaded to Google Drive:

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add credentials to `backend/.env`

**Note:** This is optional. Files will be stored on Cloudinary without Google Drive setup.

---

## 🌐 Deployment to Production (20-30 minutes)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - ExamStream"
git branch -M main
git remote add origin https://github.com/yourusername/examstream.git
git push -u origin main
```

### Step 2: Deploy Backend to Render (Free)

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** examstream-api
   - **Environment:** Node
   - **Region:** Choose closest to you
   - **Branch:** main
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Add Environment Variables (click "Advanced"):

   ```
   MONGODB_URI = your_mongodb_connection_string
   JWT_SECRET = your_secret_key
   CLOUDINARY_CLOUD_NAME = your_cloud_name
   CLOUDINARY_API_KEY = your_api_key
   CLOUDINARY_API_SECRET = your_api_secret
   NODE_ENV = production
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://examstream-api.onrender.com`

**Important:** Free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-50 seconds.

### Step 3: Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com and sign up with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** build

5. Add Environment Variable:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api`

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Your app is live at: `https://examstream.vercel.app`

#### Alternative: Deploy Frontend to Netlify

1. Go to https://netlify.com and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Configure:
   - **Base directory:** frontend
   - **Build command:** `npm run build`
   - **Publish directory:** frontend/build

5. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend-url.onrender.com/api`

6. Click "Deploy site"

---

## ✅ Final Testing Checklist

After deployment, test these features:

- [ ] User Registration (Instructor & Student)
- [ ] User Login
- [ ] Create Exam (Instructor)
- [ ] Add Questions with Images (Instructor)
- [ ] View Exams (Student)
- [ ] Timer Functionality
- [ ] Upload Answer (Student)
- [ ] View Submissions (Instructor)
- [ ] Auto-disable Upload after Deadline

---

## 🔧 Troubleshooting

### Backend Issues

**Error: Cannot connect to MongoDB**

- Check your MongoDB URI in `.env`
- Ensure IP whitelist is set to `0.0.0.0/0` in MongoDB Atlas

**Error: Cloudinary upload failed**

- Verify Cloudinary credentials
- Check file size (max 10MB)

### Frontend Issues

**Error: Cannot connect to API**

- Check `REACT_APP_API_URL` environment variable
- Ensure backend is running
- Check CORS settings in backend

**Error: Token expired**

- Login again
- Check JWT_SECRET consistency

### Deployment Issues

**Render: Build Failed**

- Check `package.json` scripts
- Ensure all dependencies are listed
- Check Node.js version compatibility

**Vercel: Build Failed**

- Clear build cache and retry
- Check environment variables
- Ensure `frontend` directory structure

---

## 📱 Usage Instructions

### For Instructors:

1. Register with role "Instructor"
2. Login to instructor dashboard
3. Click "Create New Exam"
4. Fill in:
   - Exam title and description
   - Start time (when exam begins)
   - Exam duration (how long students have)
   - Upload deadline (final time for submissions)
5. Click "Create Exam"
6. Add questions with "Add Question" button
7. Upload images for questions (optional)
8. Monitor student submissions in real-time

### For Students:

1. Register with role "Student"
2. Login to student dashboard
3. See list of available exams
4. Click "View Exam" to open
5. Wait for exam start time (countdown shown)
6. Once started, read questions
7. Upload answers for each question
8. Monitor upload deadline timer
9. Submit before deadline (auto-disabled after)

---

## 🎯 Quick Time Estimate for Tonight

- **Installation & Setup:** 10-15 minutes
- **MongoDB & Cloudinary Setup:** 10 minutes
- **Local Testing:** 5 minutes
- **Deployment (Backend + Frontend):** 20-30 minutes
- **Final Testing:** 10 minutes

**Total:** 55-70 minutes (if everything goes smoothly)

---

## 💡 Pro Tips

1. **Test locally first** before deploying
2. **Keep backup** of `.env` file
3. **Use longer JWT_SECRET** (32+ characters)
4. **Whitelist all IPs** (0.0.0.0/0) in MongoDB Atlas
5. **Free tier limitations:**
   - Render: Sleeps after 15 min inactivity
   - MongoDB Atlas: 512MB storage
   - Cloudinary: 25GB bandwidth/month

---

## 🆘 Need Quick Help?

Common first-time deployment issues:

1. MongoDB connection fails → Check IP whitelist
2. CORS errors → Add frontend URL to CORS whitelist
3. File upload fails → Verify Cloudinary credentials
4. 404 on refresh → Configure SPA routing on hosting

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs on Render dashboard
3. Verify environment variables
4. Try clearing browser cache

Good luck with your deployment! 🚀
