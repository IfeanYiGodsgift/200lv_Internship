// Add the necessary imports
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

// Initialize the Express app
const app = express();
const port = 5000;

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dubpkh5s8',    // My cloud name
    api_key: '184825996268861',          // My API key
    api_secret: 's7GRxPkTqTycSCYIM_umzpNWMRE'     // My API secret
});

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files will be temporarily saved in the 'uploads' folder


// Middleware for logging each request
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} request to ${req.url}`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory in your frontend
app.use('/videos', express.static(path.join(__dirname, '..', 'video-app', 'public', 'videos')));
app.use('/thumbnails', express.static(path.join(__dirname, '..', 'video-app', 'public', 'thumbnails')));

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/videoData';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define the Video schema
const videoSchema = new mongoose.Schema({
    src: String,
    description: String,
    categories: [String],
    album: String,
});

// Create the Video model
const Video = mongoose.model('Video', videoSchema);

// Routes
app.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find();
        console.log(`GET /videos - Videos fetched successfully - Status: 200`);
        res.status(200).json(videos);
    } catch (err) {
        console.error(`GET /videos - Error fetching videos - Status: 500`, err);
        res.status(500).json({ error: err.message });
    }
});


// GET /videos/:id - Get a video by its ID
app.get('/videos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const video = await Video.findById(id);
        if (!video) {
            console.log(`GET /videos/${id} - Video not found - Status: 404`);
            return res.status(404).json({ error: 'Video not found' });
        }
        console.log(`GET /videos/${id} - Video fetched successfully - Status: 200`);
        res.status(200).json(video);
    } catch (err) {
        console.error(`GET /videos/${id} - Error fetching video - Status: 500`, err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/videos', async (req, res) => {
    const { src, description, categories, album } = req.body;

    try {
        // Upload video to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(src, {
            resource_type: 'video', // Ensure it's a video upload
            folder: 'video-app/videos' // Create a folder in Cloudinary for your app
        });

        const newVideo = new Video({
            src: uploadResponse.secure_url, // Use the Cloudinary video URL
            description,
            categories,
            album
        });

        const savedVideo = await newVideo.save();
        console.log(`POST /videos - Video: ${description} uploaded successfully to Cloudinary - Status: 201`);
        res.status(201).json(savedVideo);
    } catch (err) {
        console.error(`POST /videos - Error uploading video to Cloudinary - Status: 500`, err);
        res.status(500).json({ error: err.message });
    }
});


app.put('/videos/:id', async (req, res) => {
    const { id } = req.params;
    const { src, description, categories, album } = req.body;

    try {
        const updatedVideo = await Video.findByIdAndUpdate(id, { src, description, categories, album }, { new: true });
        if (!updatedVideo) {
            console.log(`PUT /videos/${id} - Video:${description} not found - Status: 404`);
            return res.status(404).json({ error: 'Video not found' });
        }
        console.log(`PUT /videos/${id} - Video:${description} updated successfully - Status: 200`);
        res.status(200).json(updatedVideo);
    } catch (err) {
        console.error(`PUT /videos/${id} - Error updating video:${description} - Status: 500`, err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/videos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedVideo = await Video.findByIdAndDelete(id);
        if (!deletedVideo) {
            console.log(`DELETE /videos/${id} - Video not found - Status: 404`);
            return res.status(404).json({ error: 'Video not found' });
        }
        console.log(`DELETE /videos/${id} - Video deleted successfully - Status: 200`);
        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (err) {
        console.error(`DELETE /videos/${id} - Error deleting video - Status: 500`, err);
        res.status(500).json({ error: err.message });
    }
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Load credentials from JSON file
    fs.readFile(path.join(__dirname, 'adminData.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(`POST /login - Error reading admin data - Status: 500`, err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        const credentials = JSON.parse(data);

        // Check if the provided credentials match any in the JSON file
        const encryptedPassword = crypto.createHash('md5').update(password).digest('hex');
        const user = credentials.find(cred => cred.username === username && cred.password === encryptedPassword);
        if (user) {
            console.log(`POST /login - Admin login successful - User: ${username} - Status: 200`);
            return res.status(200).json({ success: true });
        } else {
            console.log(`POST /login - Invalid credentials - User: ${username} - Status: 401`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Route to add new users
app.post('/add-user', (req, res) => {
    const { username, password } = req.body;

    // Load existing credentials from JSON file
    fs.readFile(path.join(__dirname, 'adminData.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(`POST /add-user - Error reading admin data - Status: 500`, err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        let credentials = JSON.parse(data);

        // Check if the username already exists
        if (credentials.some(cred => cred.username === username)) {
            console.log(`POST /add-user - Username already exists: ${username} - Status: 400`);
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const encryptedPassword = crypto.createHash('md5').update(password).digest('hex');
        console.log(`POST /add-user - Encrypted password for ${username}: ${encryptedPassword}`);

        // Add the new user
        credentials.push({ username, password: encryptedPassword });

        // Write updated credentials back to the file
        fs.writeFile(path.join(__dirname, 'adminData.json'), JSON.stringify(credentials, null, 2), (err) => {
            if (err) {
                console.error(`POST /add-user - Error writing admin data - Status: 500`, err);
                return res.status(500).json({ success: false, message: 'Server error' });
            }
            console.log(`POST /add-user - User added successfully: ${username} - Status: 201`);
            return res.status(201).json({ success: true, message: 'User added successfully' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
