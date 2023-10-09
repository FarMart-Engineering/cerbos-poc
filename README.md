# Cerbos POC

This repo contains the code for a demo project made with the aim of demonstrating the implementation of an RBAC system using the Cerbos library.

## How To Run

1. Clone this repo.

```
git clone git@github.com:aayush-farmart/cerbos-poc.git
```

2. Make sure you have Docker set up on your local machine.
3. Start up the Cerbos server from the root folder.

```
docker run --rm --name cerbos -v $(pwd)/cerbos-poc/policies:/policies -p 3592:3592 -p 3593:3593 ghcr.io/cerbos/cerbos:latest
```

4. Start up the express server in watch mode using

```
npm run dev:pm2
```

## Usage

This project is a naive blog post manager. There are two types of users defined: **members** and **moderators**.

The user schema has the following properties:

```
id serial primary key,
name text not null,
role text not null,
blocked boolean not null
```

Members and moderators who have been blocked are not allowed to perform any kind of actions.

Members are allowed to:

1. view all blog posts.
2. create a new post.
3. update their own blog posts, unless their blog post is flagged by a moderator.
4. delete their own posts.

Moderators are allowed to:

1. view all blog posts.
2. flag malicious posts.
3. update flagged posts.

This project uses an in-memory sqlite database that has some default data preloaded. The preloaded data can be found in the `index.ts` file.

The following routes are exposed:

1. POST /posts : Create a new post.
2. GET /posts : Fetch all unflagged posts.
3. GET /posts/:id : Fetch post by id (if unflagged).
4. PATCH /posts/:id : Update post by id (if unflagged).
5. DELETE /posts/:id : Delete post by id.
6. POST /posts/flag/:id : Change the flagged status of a post.

Use the following cURL commands to test the various routes

#### Create Post

```
curl --location --request POST 'http://localhost:8000/posts/' --header 'user_id: 1' --header 'Content-Type: application/json' --data-raw '{
    "title": "Introduction to Cerbos",
    "content": "Welcome to Cerbos authorization package"
}'
```

#### Update Post

```
curl --request PATCH 'http://localhost:8000/posts/1' --header 'user_id: 1' --header 'Content-Type: application/json' --data-raw '{
    "title": "Welcome to Cerbos",
    "content": "10 things you need to know about Cerbos"
}'
```

#### View All Posts

```
curl --request GET 'http://localhost:8000/posts/' --header 'user_id: 1'
```

#### View Single Post

```
curl --request GET 'http://localhost:8000/posts/1' --header 'user_id: 1'
```

#### Flag Post

```
curl --request POST 'http://localhost:8000/posts/flag/1' --header 'user_id: 5' --header 'Content-Type: application/json' --data-raw '{
    "flag": true
}'
```

#### Delete Post

```
curl --request DELETE 'http://localhost:8000/posts/1' --header 'user_id: 1'
```

Play around with these cURL requests to see Cerbos blocking unauthorized users from accessing resources.

### Future Work

Currently, the userId is passed as a header to each API call. However, in a real world application the userId(and any other necessary authentication value) should ideally be encoded in a JWT that is sent as a Bearer token to the server. Check https://github.com/cerbos/express-jwt-cerbos/blob/main/README.md for this implementation.
