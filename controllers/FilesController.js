/* eslint-disable */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  postUpload: async (req, res) => {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if ((type !== 'folder') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.getFileById(parentId);
      if (!parentFile || parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    let localPath;
    if (type !== 'folder') {
      const fileData = Buffer.from(data, 'base64');
      const filePath = `${FOLDER_PATH}/${uuidv4()}`;
      fs.writeFileSync(filePath, fileData);
      localPath = filePath;
    }

    const newFile = await dbClient.createFile(userId, name, type, parentId, isPublic, localPath);
    return res.status(201).json(newFile);
  },
};

export default FilesController;