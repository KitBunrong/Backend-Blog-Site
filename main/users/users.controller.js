const express = require('express');
const router = express.Router();
const authorize = require('main/_helpers/authorize')
const bcrypt = require('bcrypt')
const config = require('config.json');
const jwt = require('jsonwebtoken');
const pool = require('../db')

/* 
    Sign-up and sign-in options
*/
router.post('/admin/signup', (req, res, next) => {
    const check = /\S+@\S+\.\S+/.test(req.body.email)

    if (check) {
        const hashpass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))
            const values = [req.body.email, hashpass, 1]
            pool.query(`INSERT INTO users(email, password, role_id, date_created) 
                VALUES($1, $2, $3, NOW())`, values, (q_err, q_res) => {
                if (q_err) return next(q_err)
                res.json(q_res.rows)
            })
    } else {
        res.status(400).send({ 'message': 'Please enter a valid email address' });
    }
})

router.post('/user/signup', (req, res, next) => {
    const check = /\S+@\S+\.\S+/.test(req.body.email)

    if (check) {
        pool.query(`SELECT role_id FROM roles WHERE title = 'user'`, (q_err, q_res) => {
            role_id = q_res.rows[0].role_id
            const hashpass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))
            const values = [req.body.email, hashpass, role_id]
            pool.query(`INSERT INTO users(email, password, role_id, date_created) 
                VALUES($1, $2, $3, NOW())`, values, (q_err, q_res) => {
                if (q_err) return next(q_err)
                res.json(q_res.rows)
            })
        });
    } else {
        res.status(400).send({ 'message': 'Please enter a valid email address' });
    }
})

router.post('/user/login', (req, res, next) => {
    const values = [req.body.email]
    pool.query(`SELECT user_id, title FROM users JOIN roles  ON users.role_id = roles.role_id WHERE users.email = $1`, values, (q_err, q_res) => {
        const user_id = q_res.rows[0].user_id
        const role = q_res.rows[0].title
        pool.query(`SELECT password FROM users WHERE email = $1`, values, (q_err, q_res) => {
            if (q_err) return next(q_err)
            const result = bcrypt.compareSync(req.body.password, q_res.rows[0].password)

            if (result) {
                const token = jwt.sign({ sub: user_id, role: role }, config.secret);
                res.json({ "token": token })
            } else {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        })
    })


})

/* 
    USERS ROUTES SECTION
*/
router.get('/get/allusers', authorize('admin'), (req, res, next) => {
    pool.query(`SELECT * FROM users`, (q_err, q_res) => {
        res.json(q_res.rows)
    })
})


/* 
    POSTS ROUTES SECTION
*/
router.post('/posts/poststodb', authorize(), (req, res, next) => {
    const values = [req.body.title, req.body.body, req.body.user_id, req.body.username]
    pool.query(`INSERT INTO posts(title, body, user_id, author, date_created) 
                VALUES($1, $2, $3, $4, NOW())`, values, (q_err, q_res) => {
        if (q_err) return next(q_err)
        res.json(q_res.rows)
    })
})

router.get('/get/allposts', authorize(), (req, res, next) => {
    pool.query(`SELECT * FROM posts ORDER BY date_created DESC`, (q_err, q_res) => {
        res.json(q_res.rows)
    })
})

router.put('/put/post', authorize(), (req, res, next) => {
    const values = [req.body.title, req.body.body, req.body.user_id, req.body.post_id, req.body.author]
    pool.query(`UPDATE posts SET title=$1, body=$2, user_id=$3, author=$5, date_created=NOW() 
                WHERE post_id=$4`, values, (q_err, q_res) => {
        res.json(q_res.rows)
    })
})

router.delete('/delete/postcomments', authorize(), (req, res, next) => {
    const post_id = req.body.post_id
    pool.query(`DELETE FROM comments WHERE post_id = $1`, [post_id], (q_err, q_res) => {
        res.json(q_res.rows)
    })
})

router.delete('/delete/post', authorize(), (req, res, next) => {
    const post_id = req.body.post_id
    pool.query(`DELETE FROM posts WHERE post_id=$1`, [post_id], (q_err, q_res) => {
        res.json(q_res.rows)
    })
})


/* 
    COMMENTS ROUTES SECTION
*/
router.post('/post/commentstodb', authorize(), (req, res, next) => {
    const values = [req.body.comment, req.body.author, req.body.user_id, req.body.post_id]
    pool.query(`INSERT INTO comments(comment, author, user_id, post_id, date_created) 
                VALUES($1, $2, $3, $4, NOW())`, values, (q_err, q_res) => {
        res.json(q_res.rows)
    })
})

router.get('/get/allpostcomments', authorize(), (req, res, next) => {
    pool.query(`SELECT * FROM comments`, (q_err, q_res) => {
        res.json(q_res.rows)
    })
})

router.put('/put/commentstodb', authorize(), (req, res, next) => {
    const values = [req.body.comment, req.body.author, req.body.user_id, req.body.post_id, req.body.comment_id]
    pool.query(`UPDATE comments SET comment=$1, author=$2, user_id=$3, post_id=$4 
                WHERE comment_id=$5`, values, (q_err, q_res) => {
        res.json(q_res.rows)
    })
})

router.delete('/delete/comment', authorize(), (req, res, next) => {
    const comment_id = req.body.comment_id
    pool.query(`DELETE FROM comments WHERE comment_id=$1`, [comment_id], (q_err, q_res) => {
        res.json(q_res.rows)
    })
})

module.exports = router;
