
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY, 
    title VARCHAR(10) NOT NULL,
    description VARCHAR(50)
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY, 
    email VARCHAR(128) UNIQUE NOT NULL, 
    password VARCHAR(128) NOT NULL, 
    username VARCHAR(128) UNIQUE, 
    dob DATE, 
    address VARCHAR(128),
    date_created DATE,
    role_id INT REFERENCES roles(role_id)
);

CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY, 
    title VARCHAR(20) NOT NULL, 
    description VARCHAR(50), 
    role_id INT REFERENCES roles(role_id)
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY, 
    title VARCHAR(255) NOT NULL, 
    body VARCHAR NOT NULL, 
    date_created TIMESTAMP,
    author VARCHAR REFERENCES users(username), 
    user_id INT REFERENCES users(user_id)
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY, 
    comment VARCHAR(255), 
    date_created TIMESTAMP ,
    author VARCHAR REFERENCES users(username),
    user_id INT REFERENCES users(user_id), 
    post_id INT REFERENCES posts(post_id)
);