require("dotenv").config();
const randomUserAgent = require('random-useragent');

const logs = {
    entries: [],
    addLog: function (log) {
        this.entries.push(log);
    }
};

async function interceptRequests(page, storeName) {
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        if (request.resourceType() === 'image' ||
            request.resourceType() === 'font' ||
            request.resourceType() === 'video' ||
            request.resourceType() === 'media' ||
            (request.resourceType() === 'stylesheet' &&
                storeName !== 'WallsGeneralStore' &&
                storeName !== 'RatusSkateshop' &&
                storeName !== 'Artwalk')) {
            request.abort();
        } else {
            request.continue();
        }
    });

    page.on('dialog', async (dialog) => {
        if (dialog) {
            try {
                await dialog.accept();
            } catch (error) {
                console.error('Erro ao aceitar o diálogo:', error.message);
            }
        }
    });
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

async function generateRandomUserAgent() {
    let userAgent;

    do {
        userAgent = randomUserAgent.getRandom();
    } while (problematicUserAgents(userAgent));

    return userAgent;
}

function problematicUserAgents(userAgent) {
    const lowercaseUserAgent = userAgent.toLowerCase();

    const problematicPatterns = [
        /20040614/i,
        /20091107/i,
        /20100101/i,
        /20100907/i,
        /20110303/i,
        /20110622/i,
        /20110623/i,
        /20120813/i,
        /20121129/i,
        /20121202/i,
        /20130401/i,
        /2009042316/i,
        /20120403211507/i,

        // Padrões relacionados a bots e crawlers
        /spider/i,
        /scraper/i,
        /msnbot/i,
        /wget/i,
        /crawler/i,
        /bot/i,
        /bots/i,

        // Outros padrões
        /mobi/i,
        /p1000m/i,
        /i800/i,
        /libwww/i,
        /java/i,
        /peach/i,
        /python/i,
        /adobe/i,
        /download/i,
        /downloader/i,
        /superbot/i,
        /webcopier/i,
        /wget/i,
        /playstation/i,
        /wii/i,
        /qupzilla/i,
        /htmlparser/i,
        /validator/i,
        /facebook/i,
        /grub/i,
        /itunes/i,
        /url/i,
        /roku/i,
        /tv/i,
        /search/i,
        /jeeves/i,
        /adsbot/i,
        /googlebot/i,
        /yandex/i,
        /yahoo/i,
        /facebookexternalhit/i,
        /alexa/i,
        /beos/i,
        /os\/2/i,
        /bloglines/i,
        /blackberry/i,
        /nokia/i,
        /vodafone/i,
        /docomo/i,
        /lumia/i,
        /khtml/i,
        /galeon/i,
        /links/i,
        /win95/i,
        /msie/i,
        /sonyericsson/i,
        /sony ericsson/i,
        /presto/i,
        /jaunty/i,
        /seamonkey/i,
        /nextreaming/i,
        /kindle/i,
        /lg/i,
        /minefield/i,
        /emailwolf/i,
        /palmos/i,
        /xenu/i,
        /sunos/i,
        /offline/i,
        /feedfetcher/i,
        /mediapartners/i,
        /konqueror/i,
        /uzbl/i,
        /mot-/i,
        /iceape/i,
        /w3m/i,
        /epiphany/i,
        /minimo/i,
        /portalmmm/i,
        /sec-/i,
        /windows xp/i,
        /midori/i,
        /openbsd/i,
        /trident/i,
        /9a3pre/i,
        /iceweasel/i,
        /avant/i,
        /shadowfox/i,
        /samsung-/i,
        /matbjs/i,
        /debian/i,
        /netsurf/i,
        /fennec/i,
        /karmic/i,
        /nook/i,
        /dillo/i,
        /clr/i,
        /swiftfox/i,
        /namoroka/i,
        /gregarius/i,
        /freebsd/i,
        /irix/i,
        /phoenix/i,
        /netscape/i,
        /\[en\]/i,
        /csscheck/i,
        /opera\/9/i,
        /headlesschrome/i,
        /helena/i,
        /netbsd/i,
        /i686/i,
        /gentoo/i,
        /gtb5/i,
        /ppc/i,
        /wow64/i,
        /gutsy/i,
        /htc/i,
    ];

    return problematicPatterns.some(pattern => pattern.test(lowercaseUserAgent));
}

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function removeDots(str) {
    return str.replace(/\./g, "");
}

const lastString = string => string.match(/\w+$/)[0];
const last2Strings = string => string.split(" ").slice(-1).join("");

module.exports = {
    interceptRequests,
    generateRandomUserAgent,
    arraysEqual,
    removeAccents,
    removeDots,
    lastString,
    last2Strings,
    logs,
};
