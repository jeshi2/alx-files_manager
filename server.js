/* eslint-disable */
import express from 'express';
import routes from './routes';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Load all routes from the routes directory
app.use('/', routes);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
