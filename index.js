const puppeteer = require('puppeteer'),
    fs = require('fs'),
    options = require('./config/config'),
    errors = require('./config/errors'),
    hangoutsCrawler = require('./crawlers/Hangouts').default;


(async () => {


    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
            height: 1000,
            width: 1000
        }
    });

    const page = await browser.newPage();
    await page.goto(options.webpage)

    page.on('load', async () => {
        //If the was succesfully redirected to the chat after the login
        if (page.url().includes(options.webpage)) {
            //remove the page listeners
            page.removeAllListeners('load');
            let messagesInJSON = null;

            const type = typeof options.crawlerOptions.roomURL;
            if (type === 'string') {
                //Go to the room we want to crawl
                await page.goto(options.webpage + '/room/' + options.crawlerOptions.roomURL);
                messagesInJSON = await hangoutsCrawler(page);
                return fs.writeFileSync(`./bank/${options.crawlerOptions.roomURL}.json`, messagesInJSON);

            } else if (type === 'object') {
                for (let i = 0; i < options.crawlerOptions.roomURL.length; i++) {
                    const url = options.crawlerOptions.roomURL[i];
                    await page.goto(options.webpage + '/room/' + url);
                    messagesInJSON = await hangoutsCrawler(page);
                    fs.writeFileSync(`./bank/${url}.json`, messagesInJSON);
                }


            } else {
                throw Error(errors.config.invalidRoomType);
            }
        }

    });

})();

