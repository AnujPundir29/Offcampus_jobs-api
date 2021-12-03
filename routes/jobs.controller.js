const cheerio = require('cheerio');
const axios = require('axios');
const NodeCache = require("node-cache");
const serverCache = new NodeCache();

const jobs = [];

const platforms = [{
        source: 'studentscircles',
        address: 'https://www.studentscircles.com/category/it-jobs/',
    },
    {
        source: 'offcampusjobs4u',
        address: 'https://www.offcampusjobs4u.com/',
    },
];


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

async function loadAllJobs() {
    try {
        for (let j = 0; j < platforms.length; j++) {
            const platform = platforms[j];
            const WEB_URL = platform.address;
            const jobsData = await getUrlandTitle(WEB_URL, 'a:contains("Off Campus")');

            for (var i = 0; i < jobsData.length; i++) {
                const title = jobsData[i].attribs.title + '';
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
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function httpGetAllJobs(req, res) {
    try {
        if (serverCache.has('allJobs')) {
            console.log('Retrieved value from cache !!')
            res.json(serverCache.get('allJobs'));
        } else {
            serverCache.set('allJobs', jobs)
            console.log('Value not present in cache, performing computation')
            res.json(jobs);
        }
    } catch (error) {
        console.log(error);
        res.send('Some error there !!');
    }
}

async function httpGetJobById(req, res) {
    try {
        const id = req.params.id;
        if (serverCache.has(id)) {
            console.log('Retrieved value from cache !!')
            res.redirect(serverCache.get(id));
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

            console.log('not in cache');
            serverCache.set(id, url);
            res.redirect(url);
        }

    } catch (error) {
        console.log(error);
        res.send('Some error there !!');
    }

}

module.exports = {
    loadAllJobs,
    httpGetAllJobs,
    httpGetJobById
}