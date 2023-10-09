import express, { NextFunction, Request, Response } from 'express';
import { db } from './db';
import router from './routes';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create the Users table
const createUserTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    blocked BOOLEAN NOT NULL
  )
`);
createUserTable.run();

// Create the Posts table
const createPostTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS posts (
    id integer  PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    userId INTEGER NOT NULL,
    flagged BOOLEAN NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  )
`);
createPostTable.run();

// Insert sample data
const insertSampleData = db.transaction(() => {
    const insertUser = db.prepare(
        'INSERT INTO users (name, role, blocked) VALUES (?, ?, ?)'
    );
    const insertPost = db.prepare(
        'INSERT INTO posts (title, content, userId, flagged) VALUES (?, ?, ?, ?)'
    );

    const users = [
        {
            id: 1,
            name: 'John Doe',
            role: 'member',
            blocked: 0,
        },
        {
            id: 2,
            name: 'Snow Mountain',
            role: 'member',
            blocked: 0,
        },
        {
            id: 3,
            name: 'David Woods',
            role: 'member',
            blocked: 1,
        },
        {
            id: 4,
            name: 'Maria Waters',
            role: 'moderator',
            blocked: 0,
        },
        {
            id: 5,
            name: 'Grace Stones',
            role: 'moderator',
            blocked: 1,
        },
    ];

    // const userId = insertUser.run('John Doe', 'member', 0).lastInsertRowid;
    users.forEach((user) => {
        insertUser.run(user.name, user.role, user.blocked);
    });

    insertPost.run(
        'Introduction to Cerbos',
        'In this article, you will learn how to integrate Cerbos authorization into an existing application',
        1,
        0
    );
});
insertSampleData();

app.use('/posts', router);
app.get('/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // await authorization(userId, 'view:all');
        const getUsers = db.prepare('SELECT * FROM users').all();
        res.json({
            code: 200,
            data: getUsers,
            message: 'All users fetched successfully',
        });
    } catch (error) {
        next(error);
    }
});
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({
        code: 400,
        message: error.stack,
    });
});

app.listen(8000, () => {
    console.log('App listening on port 8000!');
});

export default app;
