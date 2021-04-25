const { json } = require('body-parser');
const express = require('express');
const { response } = require('../app');
const router = express.Router();

const localAuth = require('../auth/local');
const authHelpers = require('../auth/_helpers');

router.post('/register', (req, res, next) => {
    return authHelpers.createUser(req)
        .then((user) => {
            return localAuth.encodeToken(user[0]);
        })
        .then((token) => {
            res.status(200).json({
                status: 'success',
                token: token
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: 'error'
            });
        });
});

router.post('/login', async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const response = await authHelpers.getUser(username);
        authHelpers.comparePass(password, response.password);
        const token = localAuth.encodeToken(response);
        return res.status(200).json({
            status: 'success',
            token: token
        });
    } catch (err) {
        return res.status(500).json({
            status: 'error'
        });
    }
});

router.get('/user', authHelpers.ensureAuthenticated, (req, res, next) => {
    res.status(200).json({
        status: 'success'
    });
});

module.exports = router;
