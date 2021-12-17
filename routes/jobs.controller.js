const cheerio = require('cheerio');
const axios = require('axios');
const NodeCache = require("node-cache");
const serverCache = new NodeCache();

var jobs = [];
// var jobProfile = [];
var category = {};

const platforms = [{
        source: 'studentscircles',
        address: 'https://www.studentscircles.com/category/it-jobs/page/',
    },
    // {
    //     source: 'offcampusjobs4u',
    //     address: 'https://www.offcampusjobs4u.com',
    // },
];


async function getUrlandTitle(URL, param) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
    };

    const response = await axios.get(URL, headers);

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

async function loadAllJobs_1() {
    try {
        for (let j = 0; j < platforms.length; j++) {
            const platform = platforms[j];
            for (let page = 1; page <= 8; page++) {
                const WEB_URL = platform.address + page;
                const jobsData = await getUrlandTitle(WEB_URL, 'a:contains("2022")');

                for (var i = 0; i < jobsData.length; i++) {
                    // const title = jobsData[i].attribs.title + '';
                    var title = jobsData[i].children[0].data + '';
                    title = title.split(',')[0];
                    const url = jobsData[i].attribs.href + '';
                    var result = jobs.filter(x => x.title === title);
                    if (result.length === 0 && title !== "undefined") {
                        const id = title.split(' ')[0].replace(/\s/g, '');
                        jobs.push({
                            id,
                            title,
                            url,
                            source: platform.source,
                            apply: 'https://offcampus-job.herokuapp.com/jobs/' + id,
                            // apply: 'http://localhost:8000/jobs/' + id,
                        });
                        var jobProfile = title.split('|')[1].trim();
                        var jobProfileId = jobProfile.replace(/\s/g, '');
                        if (jobProfile.indexOf('Software') !== -1) {
                            jobProfile = 'Software';
                            jobProfileId = 'Software';
                        }
                        category[jobProfile] = {
                            View: 'https://offcampus-job.herokuapp.com/jobs/category/' + jobProfileId
                            // View: 'http://localhost:8000/jobs/category/' + jobProfileId
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function httpGetAllJobs(req, res) {
    try {
        return res.status(200).json(jobs);
    } catch (error) {
        console.log(error);
        return res.send('Some error there !!');
    }
}

async function httpGetJobsByCategory(req, res) {
    try {
        return res.status(200).json(category);
    } catch (error) {
        console.log(error);
        return res.send('Some error there !!');
    }
}

async function httpGetJobById(req, res) {
    try {
        const id = req.params.id;
        if (serverCache.has(id)) {
            console.log('Retrieved value from cache !!')
            return res.redirect(serverCache.get(id));
        } else {
            const job = jobs.find(job => job.id === id);
            const JOB_URL = job.url;
            const jobSource = job.source;
            let applyData;
            if (jobSource === 'studentscircles') {
                applyData = await getUrlandTitle(JOB_URL, '.dblclick_btn');
            } else if (jobSource === 'offcampusjobs4u') {
                applyData = await getUrlandTitle(JOB_URL, 'a:contains("Click")');
            }
            const url = applyData[0].attribs.href;
            
            applyData = await getUrlandTitle(url, 'a:contains("Click")');
            const originalUrl = applyData[0].attribs.href;
            
            console.log('not in cache');
            serverCache.set(id, originalUrl);
            return res.redirect(originalUrl);
        }

    } catch (error) {
        console.log(error);
        return res.send('Some error there !!');
    }
}

async function httpGetJobsByCategoryById(req, res) {
    try {
        const id = req.params.id;
        const profile = id.split(/(?=[A-Z])/).join(' ');

        var jobByProfile = jobs.filter(job => job.title.includes(profile));
        res.status(200).send(jobByProfile);
    } catch (error) {
        console.log(error);
        return res.send('Some error there !!');
    }
}


module.exports = {
    loadAllJobs_1,
    httpGetAllJobs,
    httpGetJobsByCategory,
    httpGetJobById,
    httpGetJobsByCategoryById
}