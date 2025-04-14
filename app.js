require('dotenv').config();

const express = require('express');
const cors = require('cors');  
const app = express();

// Middleware for parsing incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins (or specify your allowed origins)
app.use(cors(
    ["http://localhost:3000", "production url", "http://localhost:3001"]
));

// Use the port from the environment variable or default to 8000
const port = process.env.PORT || 8000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
