const express = require('express');
const app = express();
const helmet = require('helmet');
const jobsRouter = require('./routes/jobs.router');
const PORT = process.env.PORT || 8000;

app.use(helmet());

app.use('/jobs', jobsRouter);

app.get('/*', (req, res) => {
    res.json('Welcome to homepage!!. Please use /jobs to get jobs list and also use json viewer in browser'); 
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});