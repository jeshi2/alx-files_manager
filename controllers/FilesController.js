/* eslint-disable */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const FilesController = {
  postUpload: async (req, res) => {
    const { name, type, data, parentId = 0, isPublic = false } = req.body;
    const token = req.headers['x-token'];
    
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.getFileById(parentId);
      if (!parentFile || parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent not found or is not a folder' });
      }
    }

    const fileDocument = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'file' || type === 'image') {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileUUID = uuidv4();
      const localPath = `${filePath}/${fileUUID}`;
      await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));
      fileDocument.localPath = localPath;
    }

    const newFile = await dbClient.createFile(fileDocument);
    return res.status(201).json(newFile);
  },
};

export default FilesController;
