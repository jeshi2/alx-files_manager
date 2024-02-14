/* eslint-disable */
import sha1 from 'sha1';
import dbClient from '../utils/db';
//import redisClient from '../utils/redis';

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists
    const userExists = await dbClient.getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password
    const hashedPassword = sha1(password);

    // Create a new user in the database
    try {
      const newUser = await dbClient.createUser(email, hashedPassword);
      return res.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },


};

export default UsersController;