const express = require('express');
const app = express();
const jobsRouter = require('./routes/jobs.router');
const PORT = process.env.PORT || 8000;

app.use('/jobs', jobsRouter);

app.get('/*', (req, res) => {
    res.json('Welcome to homepage')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});