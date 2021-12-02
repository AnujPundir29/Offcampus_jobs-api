const express = require('express');
const jobsRouter = express.Router();
const {
    httpGetAllJobs
} = require('./jobs.controller');

jobsRouter.get('/', httpGetAllJobs);

module.exports = jobsRouter;