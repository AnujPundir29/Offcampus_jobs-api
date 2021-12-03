const express = require('express');
const jobsRouter = express.Router();
const {
    httpGetAllJobs,
    httpGetJobById
} = require('./jobs.controller');

jobsRouter.get('/', httpGetAllJobs);

jobsRouter.get('/:id', httpGetJobById);

module.exports = jobsRouter;