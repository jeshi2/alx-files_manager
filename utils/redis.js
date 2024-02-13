/* eslint-disable */
import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor () {
    this.client = createClient({
      host: 'localhost',
      port: 6379
    });

    this.isClientConnected = true;

    this.client.on('error', (error) => {
      console.error('Redis error:', error);
      this.isClientConnected = false;
    });

    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  isAlive () {
    return this.isClientConnected;
  }

  async get (key) {
    return promisify(this.client.get).bind(this.client)(key);
  }

  async set (key, value, durationInSeconds) {
    return promisify(this.client.set).bind(this.client)(key, value, 'EX', durationInSeconds);
  }

  async del (key) {
    return promisify(this.client.del).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
