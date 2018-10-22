const puppeteer = require('puppeteer'),
    fs = require('fs'),
    options = require('./config/config'),
    errors = require('./config/errors'),
    CSV = require('./js/CSV'),
    hangoutsCrawler = require('./crawlers/Hangouts').default;


async function autoLogin(page) {
    console.log("\x1b[36m", `trying to autenthicate with:\x1b[31m ${options.login.email}`);
    console.time('\x1b[32m authenticated');
    await page.click('#identifierId')
    await page.keyboard.type(options.login.email);
    await page.click('#identifierNext > div.ZFr60d.CeoRYc');
    await page.waitFor(1000);
    await page.click('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
    await page.keyboard.type(options.login.password);
    await page.click('#passwordNext > div.ZFr60d.CeoRYc');
    console.timeEnd('\x1b[32m authenticated');
}


function printCSV(array) {
    let csvWithoutHeader = CSV.toCSV(array);
    console.log(csvWithoutHeader)
    let finalCSV = `name,date,message\n${csvWithoutHeader}`
    return finalCSV;
}


(async () => {
    const isAutoLogin = process.env.AUTO_LOGIN || options.login.autoLogin;

    const browser = await puppeteer.launch({
        headless: isAutoLogin,
        defaultViewport: {
            height: 1000,
            width: 1000
        },
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3563.0 Safari/537.36')
    await page.goto(options.webpage)

    if (isAutoLogin) await autoLogin(page);

    page.on('load', async () => {
        //If the was succesfully redirected to the chat after the login
        if (page.url().includes(options.webpage)) {
            //remove the page listeners
            page.removeAllListeners('load');
            let messages = null;
            let count = 0;
            const type = typeof options.crawlerOptions.roomURL;
            if (type === 'object') {
                //Crawl the chat rooms
                for (let i = 0; i < options.crawlerOptions.roomURL.length; i++) {
                    const url = options.crawlerOptions.roomURL[i];
                    await page.goto(options.webpage + '/room/' + url);

                    console.log(`\x1b[36m getting messages from: \x1b[31m ${url}`)
                    messages = await hangoutsCrawler(page);
                    count += messages.length;
                    console.log(`\x1b[32m crawled: \x1b[36m${messages.length} messages`)
                    fs.writeFileSync(`./bank/${url}.json`, JSON.stringify(messages));
                    fs.writeFileSync(`./bank/${url}.csv`, JprintCSV(messages));
                }
                console.log(`\x1b[31m Total crawled: \x1b[36m${count} messages`)
            } else {
                throw Error(errors.config.invalidRoomType);
            }


            //Crawl the direct messages
            if (typeof options.crawlerOptions.dmURL === 'object') {
                let count = 0;
                for (let i = 0; i < options.crawlerOptions.dmURL.length; i++) {
                    const url = options.crawlerOptions.dmURL[i];
                    await page.goto(options.webpage + '/dm/' + url);
                    console.log(`\x1b[36m getting messages from: \x1b[31m ${url}`)
                    messages = await hangoutsCrawler(page);
                    count += messages.length;
                    console.log(`\x1b[32m crawled: \x1b[36m${messages.length} messages`)
                    fs.writeFileSync(`./bank/${url}.json`, JSON.stringify(messages));
                    fs.writeFileSync(`./bank/${url}.csv`, printCSV(messages));
                }
                console.log(`\x1b[31m Total crawled: \x1b[36m${count} messages`)
            } else throw Error(errors.config.invalidRoomType)

        }

    });

})();