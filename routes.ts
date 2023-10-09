import express, { NextFunction, Request, Response } from 'express';
import { Post, db } from './db';
import authorization from './auth';

const router = express.Router();

const checkPostExistAndGet = (id: number) => {
    const getPost = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!getPost) throw new Error("Post doesn't exist");
    return getPost;
};

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, content } = req.body;
        const { user_id: userId } = req.headers;

        await authorization(userId, 'create', req.body);

        const newData = {
            title,
            content,
            userId: Number(userId),
            flagged: 0,
        };
        db.prepare(
            'insert into posts (title, content, userId, flagged) values (?, ?, ?, ?)'
        ).run(newData.title, newData.content, newData.userId, newData.flagged);

        res.status(201).json({
            code: 201,
            data: newData,
            message: 'Post created successfully',
        });
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id: userId } = req.headers;
        await authorization(userId, 'view:all');

        const getPosts = db
            .prepare('SELECT * FROM posts WHERE flagged = ?')
            .all(0);
        res.json({
            code: 200,
            data: getPosts,
            message: 'All posts fetched successfully',
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id: userId } = req.headers;
        await authorization(userId, 'view:single');
        const getPost = db
            .prepare('select * from posts where flagged = ? and id = ?')
            .get(0, Number(req.params.id));
        res.json({
            code: 200,
            data: getPost,
            message: 'Post fetched successfully',
        });
    } catch (error) {
        next(error);
    }
});

router.patch(
    '/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, content } = req.body;
            const { user_id: userId } = req.headers;
            const postId = Number(req.params.id);
            checkPostExistAndGet(postId);

            const originalPost: Post = db
                .prepare('select * from posts where id = ?')
                .get(postId) as Post;

            const updatedPost = {
                title,
                content,
                userId: originalPost.userId,
                flagged: originalPost.flagged,
            };

            await authorization(userId, 'update', updatedPost);

            db.prepare(
                'update posts set title = ?, content = ? where id = ?'
            ).run(title, content, postId);

            res.json({
                code: 200,
                data: updatedPost,
                message: 'Post updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { user_id: userId } = req.headers;
            const postId = Number(req.params.id);
            const post = checkPostExistAndGet(postId);

            await authorization(userId, 'delete', post);
            db.prepare('delete from posts where id = ?').run(postId);

            res.json({
                code: 200,
                message: 'Post deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/flag/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let flaggedContent = {
                flagged: req.body.flag,
            };
            const { user_id: userId } = req.headers;

            const postId = req.params.id;
            checkPostExistAndGet(Number(postId));

            await authorization(userId, 'flag', flaggedContent);

            db.prepare('update posts set flagged = ? where id = ?').run(
                req.body.flag,
                postId
            );

            res.json({
                code: 200,
                data: flaggedContent,
                message: `Post ${
                    req.body.flag ? 'flagged' : 'unflagged'
                } successfully`,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
