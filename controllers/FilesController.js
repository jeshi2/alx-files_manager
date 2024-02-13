/* eslint-disable */
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import fs from 'fs';
import path from 'path';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const FilesController = {
  postUpload: async (req, res) => {
    const { 'x-token': token } = req.headers;
    const { name, type, parentId = '0', isPublic = false, data } = req.body;

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve user based on token
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate inputs
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check if parentId is valid
    if (parentId !== '0') {
      const parentFile = await dbClient.getFileById(parentId);
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Generate local file path
    const fileName = uuidv4();
    const localPath = path.join(FOLDER_PATH, fileName);

    // Save file to disk
    if (type !== 'folder') {
      const fileData = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, fileData);
    }

    // Create file object
    const fileObject = {
      userId,
      name,
      type,
      parentId,
      isPublic,
      localPath: type !== 'folder' ? localPath : undefined,
    };

    // Save file object to database
    const fileId = await dbClient.createFile(fileObject);

    // Return file object
    return res.status(201).json({ id: fileId, ...fileObject });
  },
};

export default FilesController;