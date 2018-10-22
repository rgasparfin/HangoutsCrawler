
async function hangoutsCrawler(page) {
    
    return await page.evaluate(_ => {
        return new Promise(async (resolve, reject) => {
            let messagesContainerDiv = document.getElementsByClassName('Bl2pUd krjOGe')[0]
            let hiddenMessagesDivs = document.getElementsByClassName('Jqvwfe Aw0Lwf YQsadf');
            let lastScrollHeight = -1;

            function extractMessagesFromElements(threads) {
                let messagesBank = [];

                //Iterate over the threads
                for (let i = 0; i < threads.length; i++) {
                    const thread = threads[i];

                    //Iterate over the messages of that thread
                    for (let i = 0; i < thread.children.length; i++) {
                        const messageElement = thread.children[i];

                        //If the element is a div its a new message
                        const username = messageElement.getElementsByClassName('NGoCob SAS2Ne')[0].children[0].innerText;
                        const time = messageElement.dataset.created;
                        const message = messageElement.getElementsByClassName('iKCcE hu21Y')[0].innerText;
                        (messageElement.nodeName === 'DIV') ? messagesBank.push({ user: username, date: time, message }) : messagesBank[messagesBank.length - 1].message += '\n ' + message;;
                    }
                }
                return resolve(messagesBank);
            }


            function scrollMore() {
                return setTimeout(() => {
                    if (hiddenMessagesDivs.length) {
                        for (let i = 0; i < hiddenMessagesDivs.length; i++) {
                            hiddenMessagesDivs[i].click();
                        }
                    }

                    //scroll a bit to activate the google listenner
                    messagesContainerDiv.scrollTop = 100;
                    //scrollback to the top
                    return setTimeout(() => {
                        messagesContainerDiv.scrollTop = 0;
                        if (messagesContainerDiv.scrollHeight != lastScrollHeight) {
                            lastScrollHeight = messagesContainerDiv.scrollHeight
                            return scrollMore();
                        }
                        return extractMessagesFromElements(document.getElementsByClassName('jGyvbd GVSFtd'));
                    }, 100)
                }, 1000);
            }

            setTimeout(scrollMore, 1000);
        })
    });
}

module.exports = {
    default: hangoutsCrawler
}