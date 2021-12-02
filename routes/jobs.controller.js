const cheerio = require('cheerio');
const axios = require('axios');

const jobs = [];
const app = []

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
        const WEB_URL = 'https://www.studentscircles.com/category/it-jobs/';
        const jobsData = await getUrlandTitle(WEB_URL, 'a:contains("Off Campus")');

        for (var i = 0; i < jobsData.length; i++) {
            const title = jobsData[i].attribs.title;
            const url = jobsData[i].attribs.href;
            var result = jobs.filter(x => x.title === title);
            if (result.length === 0 && title) {
                jobs.push({
                    title,
                    url,
                });
            }
        }

        for (var i = 0; i < jobs.length; ++i) {
            const URL = jobs[i]['url'];
            
            const applyData = await getUrlandTitle(URL, '.dblclick_btn');

            const url = applyData[0].attribs.href;
            jobs[i] = Object.assign(jobs[i], {
                'apply': url
            });
        }
        res.json(jobs);

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    httpGetAllJobs
}