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

    async getFileById(fileId) {
        const db = this.client.db();
        const filesCollection = db.collection('files');
        return filesCollection.findOne({ _id: ObjectId(fileId) });
    }

    async createFile(fileData) {
        const db = this.client.db();
        const filesCollection = db.collection('files');
        const insertResult = await filesCollection.insertOne(fileData);
        return { id: insertResult.insertedId, ...fileData };
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

    async createFile(file) {
        const db = this.client.db();
        const filesCollection = db.collection('files');
        const { insertedId } = await filesCollection.insertOne(file);
        return insertedId.toString();
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
