const axios = require("axios");
const { generateRandomUserAgent, logs } = require("../utils");

async function getSunsetLinks(url) {
    const term = url.split("/").pop();
    const linksSet = new Set();

    try {
        const reqURL = 'https://api.sunsetskateshop.com.br:8443/public/products/getBrandSize/0/183';

        const data = {
            category: "calcados",
            brand: term
        }

        const storeData = {
            "_id": "57a1e6130607512a23cdf437",
            "store": "SUNSET SKATESHOP",
            "cnpj": "10604561000153"
        };

        const headers = {
            'X-Store-Data': JSON.stringify(storeData),
            'Content-Type': 'application/json'
        };

        const response = await axios.post(reqURL, data, { headers });
        const responseData = response.data;
        responseData.data.forEach(item => item.total_itens > 0 && linksSet.add(`https://www.sunsetskateshop.com.br/produto/${item.slugname}`));

        const links = Array.from(linksSet);
        return links;
    } catch (error) {
        console.error("Error in getSunsetLinks:", error);
        logs.addLog(`Error in getSunsetLinks: ${error.message} - ${new Date().toISOString()}`);
        return [];
    }
}

async function getLinks(getLinksObj) {
    const { page, url, storeObj, currentPage } = getLinksObj;
    let retries = 0;
    const maxRetries = 20;
    let userAgent;

    const waitForTimeout = async (milliseconds) => {
        if (milliseconds > 0) {
            await page.waitForTimeout(milliseconds);
        }
    };

    while (retries < maxRetries) {
        try {
            await waitForTimeout(storeObj.name === "CDR" ? 3000 : 0);

            if (storeObj.name === "Artwalk") {
                await waitForTimeout(5000);
                await page.keyboard.press('Escape');
                await page.evaluate(() => window.scrollBy(0, 500));
            }

            if (storeObj.name === "SunsetSkateshop") {
                const links = await getSunsetLinks(url);
                console.log(links.length > 0 ? `Found ${links.length} links in ${url}` : `No links found in ${url}`);
                logs.addLog(links.length > 0 ? `Found ${links.length} links in ${url} - ${new Date().toISOString()}` : `No links found in ${url} - ${new Date().toISOString()}`);
                return links;
            }

            if (currentPage > 1) {
                await page.setUserAgent(await generateRandomUserAgent());
                await page.goto(url, { waitUntil: "domcontentloaded" });

                await waitForTimeout((storeObj.name === "CDR" || storeObj.name === "Ostore") ? 3000 : 0);

                if (storeObj.name === "Artwalk") {
                    await waitForTimeout(5000);
                    await page.keyboard.press('Escape');
                    await page.evaluate(() => window.scrollBy(0, 500));
                }
            }

            userAgent = await page.evaluate(() => navigator.userAgent);
            const blocked = await page.waitForSelector('#cf-wrapper, h4.please, .descr-reload', { timeout: 3000 }).catch(() => null);
            if (blocked) {
                logs.addLog(`Blocked by the site - ${new Date().toISOString()}`);
                throw new Error(`Blocked User Agent: ${userAgent}`);
            }

            const links = await page.$$eval(storeObj.selectors.links, (containers, storeObj) => {
                if (storeObj.name === "Netshoes") {
                    return containers
                        .filter(anchor => anchor && !anchor.querySelector('.fallback-btn'))
                        .map(anchor => anchor.href.replace(',', ''));
                }

                if (storeObj.name === "RatusSkateshop") {
                    return containers
                        .filter(container => container.querySelector('.item-actions.m-top-half'))
                        .map(container => container.querySelector("a")?.href.replace(',', ''));
                }

                if (storeObj.name === "Sunika") {
                    return containers
                        .map(container => `${container.querySelector("a")?.href.replace(',', '')}`);
                }

                return containers
                    .map(container => container.querySelector("a")?.href.replace(',', ''));
            }, storeObj);

            console.log(links.length > 0 ? `Found ${links.length} links in ${url}` : `No links found in ${url}`);
            logs.addLog(links.length > 0 ? `Found ${links.length} links in ${url} - ${new Date().toISOString()}` : `No links found in ${url} - ${new Date().toISOString()}`);
            return links;
        } catch (error) {
            retries++;
            await page.screenshot({ path: `${storeObj.name}-${retries}.png` });
            console.error(`
                \nError getting links from: ${url}
                \nError: ${error}
                \nUser Agent: ${userAgent}`);
        }
    }
    throw new Error(`Failed to get links after ${maxRetries} retries`);
}

module.exports = { getLinks };