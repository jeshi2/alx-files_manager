/* eslint-disable */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

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

    const { name, type, data, parentId = '0', isPublic = false } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parent;
    if (parentId !== '0') {
      parent = await dbClient.getFile(parentId);
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    let localPath;
    if (type === 'file' || type === 'image') {
      const fileContent = Buffer.from(data, 'base64');
      const fileId = uuidv4();
      localPath = `${FOLDER_PATH}/${fileId}`;
      fs.writeFileSync(localPath, fileContent);
    }

    const newFile = {
      userId,
      name,
      type,
      parentId,
      isPublic,
      localPath,
    };
    const fileId = await dbClient.createFile(newFile);

    return res.status(201).json({
      id: fileId,
      userId,
      name,
      type,
      parentId,
      isPublic,
    });
  },
};

export default FilesController;