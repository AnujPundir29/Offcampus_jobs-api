const express = require('express');
const jobsRouter = express.Router();
const {
    httpGetAllJobs,
    httpGetJobsByCategory,
    httpGetJobById,
    httpGetJobsByCategoryById
} = require('./jobs.controller');

jobsRouter.get('/', httpGetAllJobs);

jobsRouter.get('/category', httpGetJobsByCategory);

jobsRouter.get('/:id', httpGetJobById);

jobsRouter.get('/category/:id', httpGetJobsByCategoryById);

module.exports = jobsRouter;