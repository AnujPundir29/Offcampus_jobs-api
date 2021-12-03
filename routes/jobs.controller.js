const cheerio = require('cheerio');
const axios = require('axios');
const NodeCache = require("node-cache");
const serverCache = new NodeCache();

const jobs = [];

async function getUrlandTitle(URL, param) {
    const response = await axios.get(URL);

    const html = await response.data;
    const $ = cheerio.load(html);

    // $(`a:contains(${param})`, html).each(function () {
    //     const title = $(this).text();
    //     const url = $(this).attr('href');

    //     if (title.indexOf('img') === -1) {
    //         jobs.push({
    //             title,
    //             url,
    //         });
    //     }
    // });

    // grab the enchor tag
    const result = $(param, html);
    return result;
}

async function httpGetAllJobs(req, res) {
    try {
        if (serverCache.has('allJobs')) {

            console.log('Retrieved value from cache !!')
            res.json(serverCache.get('allJobs'));
        } else {
            const WEB_URL = 'https://www.studentscircles.com/category/it-jobs/';
            const jobsData = await getUrlandTitle(WEB_URL, 'a:contains("Off Campus")');

            for (var i = 0; i < jobsData.length; i++) {
                const title = jobsData[i].attribs.title + '';
                const url = jobsData[i].attribs.href;
                var result = jobs.filter(x => x.title === title);
                if (result.length === 0 && title !== "undefined") {
                    const id = title.split(' ')[0];
                    jobs.push({
                        id,
                        title,
                        url,
                        apply: 'https://offcampus-jobs.herokuapp.com/jobs/' + id,
                    });
                }
            }

            serverCache.set('allJobs', jobs)
            console.log('Value not present in cache, performing computation')
            res.json(jobs);
        }

    } catch (error) {
        console.log(error);
    }
}

async function httpGetJobById(req, res) {
    try {
        if (serverCache.has('jobById')) {
            console.log('Retrieved value from cache !!')
            res.send(serverCache.get('jobById'));
        } else {

            const id = req.params.id;
            const job = jobs.find(job => job.id === id);
            const JOB_URL = job.url;
            const applyData = await getUrlandTitle(JOB_URL, '.dblclick_btn');

            const url = applyData[0].attribs.href;
            const response = await axios.get(url);
            const html = await response.data;

            serverCache.set('jobById', html)
            console.log('Value not present in cache, performing computation')
            res.send(html);
        }
    } catch (error) {
        console.log(error);
    }

}

module.exports = {
    httpGetAllJobs,
    httpGetJobById
}