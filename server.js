import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AppController = {
  async getStatus(req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    const status = { redis: redisStatus, db: dbStatus };
    return res.status(200).json(status);
  },

  async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();
      const stats = { users: usersCount, files: filesCount };
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default AppController;