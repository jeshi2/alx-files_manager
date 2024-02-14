/* eslint-disable */
import { MongoClient, ObjectId } from 'mongodb';

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';

        const uri = `mongodb://${host}:${port}/${database}`;

        this.client = new MongoClient(uri, { useUnifiedTopology: true });

        this.client.connect((err) => {
            if (err) {
                console.error('DB connection error:', err);
            } else {
                console.log('Connected to MongoDB');
            }
        });
    }

    async createFile(userId, name, type, parentId = 0, isPublic = false, localPath = null) {
        const db = this.client.db();
        const filesCollection = db.collection('files');
        const fileDoc = {
            userId: ObjectId(userId),
            name,
            type,
            isPublic,
            parentId: parentId !== 0 ? ObjectId(parentId) : 0,
        };
        if (localPath) {
            fileDoc.localPath = localPath;
        }
        const result = await filesCollection.insertOne(fileDoc);
        return result.insertedId.toString();
    }

    async getFileById(fileId) {
        const db = this.client.db();
        const filesCollection = db.collection('files');
        return filesCollection.findOne({ _id: ObjectId(fileId) });
    }

    async getUserByEmailAndPassword(email, password) {
        const db = this.client.db();
        const usersCollection = db.collection('users');
        return usersCollection.findOne({ email, password });
    }

    async getUserById(userId) {
        const db = this.client.db();
        const usersCollection = db.collection('users');
        return usersCollection.findOne({ _id: ObjectId(userId) });
    }

    async getUserByEmail(email) {
        const db = this.client.db();
        const usersCollection = db.collection('users');
        return usersCollection.findOne({ email });
    }

    async createUser(email, hashedPassword) {
        const db = this.client.db();
        const usersCollection = db.collection('users');
        const newUser = {
            email,
            password: hashedPassword,
        };
        const result = await usersCollection.insertOne(newUser);
        return result.ops[0];
    }

    getFilesByParentId(userId, parentId, skip, limit) {
        return this.db
          .collection('files')
          .find({ userId, parentId })
          .skip(skip)
          .limit(limit)
          .toArray();
      }
      
      getFileById(fileId) {
        return this.db
          .collection('files')
          .findOne({ _id: ObjectId(fileId) });
      }

    isAlive() {
        return this.client.isConnected();
    }

    async nbUsers() {
        const db = this.client.db();
        const usersCollection = db.collection('users');
        return usersCollection.countDocuments();
    }

    async nbFiles() {
        const db = this.client.db();
        const filesCollection = db.collection('files');
        return filesCollection.countDocuments();
    }
}

const dbClient = new DBClient();
export default dbClient;
