const cheerio = require('cheerio');
const axios = require('axios');

async function httpGetAllJobs(req, res) {
    const response = await axios.get('https://www.studentscircles.com/category/it-jobs/');

    const html = response.data;
    const $ = cheerio.load(html);
}

module.exports = {
    httpGetAllJobs
}