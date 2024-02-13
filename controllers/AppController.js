import express from 'express';
import routes from './routes';

const app = express();

// Load all routes from routes/index.js
app.use('/', routes);

// Set the port from environment variable PORT or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});