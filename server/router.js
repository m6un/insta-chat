const express = require('express');
const Router = express.Router();

Router.get('/', (req, res) => {
    res.send("server is up and running")
})

module.exports = Router;