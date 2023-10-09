import sqlite3 from 'better-sqlite3';

export interface User {
    id: number;
    name: string;
    role: string;
    blocked: boolean;
}
export interface Post {
    id: number;
    title: string;
    content: string;
    userId: number;
    flagged: boolean;
}

// const db: DB = {
//     users: [
//         {
//             id: 1,
//             name: 'John Doe',
//             role: 'member',
//             blocked: false,
//         },
//         {
//             id: 2,
//             name: 'Snow Mountain',
//             role: 'member',
//             blocked: false,
//         },
//         {
//             id: 3,
//             name: 'David Woods',
//             role: 'member',
//             blocked: true,
//         },
//         {
//             id: 4,
//             name: 'Maria Waters',
//             role: 'moderator',
//             blocked: false,
//         },
//         {
//             id: 5,
//             name: 'Grace Stones',
//             role: 'moderator',
//             blocked: true,
//         },
//     ],
//     posts: [
//         {
//             id: 366283,
//             title: 'Introduction to Cerbos',
//             content:
//                 'In this article, you will learn how to integrate Cerbos authorization into an existing application',
//             userId: 1,
//             flagged: false,
//         },
//     ],
// };
export const db = new sqlite3(':memory:');
