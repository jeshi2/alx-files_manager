/* eslint-disable */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

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
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.getFileById(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    let localPath = null;
    if (type === 'file' || type === 'image') {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      localPath = `${filePath}/${uuidv4()}`;
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
    }

    const fileId = await dbClient.createFile(userId, name, type, parentId, isPublic, localPath);
    const newFile = { id: fileId, userId, name, type, isPublic, parentId };
    return res.status(201).json(newFile);
  },
};

export default FilesController;