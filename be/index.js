const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple translate route that returns "cat child sorry"
app.post('/translate', (req, res) => {
  res.json({
    translation: "cat child sorry"
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`POST endpoint: http://localhost:${PORT}/translate`);
});
