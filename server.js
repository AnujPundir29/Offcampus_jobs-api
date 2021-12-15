const express = require('express');
const app = express();
const helmet = require('helmet');
const jobsRouter = require('./routes/jobs.router');
const {
    loadAllJobs_1,
} = require('./routes/jobs.controller');
const PORT = process.env.PORT || 8000;

app.use(helmet());

app.use('/jobs', jobsRouter);

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

async function startServer() {
    console.time('test');    
    await loadAllJobs_1();
    console.timeEnd('test'); //Prints something like that-> test: 11374.004ms
    console.log('All Data Loaded!!!');
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

startServer();