const { getSneakerTitle } = require("../titleFunctions");
const { getCategories } = require("../categoryFunctions");
const { getBrands } = require("../brandFunctions");
const { getProductReference } = require("../referenceFunctions");
const { getImg } = require("../imgFunctions");
const { getPrice, getDiscountPrice } = require("../priceFunctions");
const { getAvailableSizes } = require("../sizeFunctions");
const { getColors } = require("../colorFunctions");
const { getCodeFromStore } = require("../storeCodeFunctions");
const { updateOrCreateSneaker } = require("../updateOrCreateSneaker");
const { generateRandomUserAgent, logs } = require("../utils");

async function processLink(processLinkObj) {
    const { page, url, storeObj, saveType } = processLinkObj;
    let retries = 0;
    const maxRetries = 20;
    let userAgent

    while (retries < maxRetries) {
        try {
            await page.setUserAgent(await generateRandomUserAgent());
            storeObj.name === "CDR" && await page.waitForTimeout(3000);
            await page.goto(url, { waitUntil: "domcontentloaded" });

            userAgent = await page.evaluate(() => navigator.userAgent);
            const blocked = await page.waitForSelector('#cf-wrapper, h4.please, .descr-reload', { timeout: 3000 }).catch(() => null);
            if (blocked) {
                logs.addLog(`Blocked by the site - ${new Date().toISOString()}`);
                throw new Error(`Blocked User Agent: ${userAgent}`);
            }

            const srcLink = url
            const store = storeObj.name.toUpperCase();
            const sneakerTitle = await getSneakerTitle({ page, storeObj });
            const brands = await getBrands({ page, storeObj, sneakerTitle });
            const categories = await getCategories({ page, sneakerTitle, storeObj, brands });
            const productReference = await getProductReference({ page, storeObj, brands, sneakerTitle });
            const img = await getImg({ page, storeObj });
            const price = await getPrice({ page, storeObj });
            const discountPrice = await getDiscountPrice({ page, storeObj });
            const availableSizes = await getAvailableSizes({ page, storeObj });
            const colors = await getColors({ page, storeObj, sneakerTitle, productReference });
            const codeFromStore = await getCodeFromStore({ page, url, storeObj, productReference });

            const sneakerObj = {
                srcLink,
                productReference,
                store,
                img,
                sneakerTitle,
                categories,
                brands,
                colors,
                currentPrice: price,
                discountPrice: discountPrice,
                priceHistory: [{ price, date: new Date() }],
                availableSizes,
                codeFromStore
            };

            if (
                !sneakerTitle.toLowerCase().includes('calça') &&
                !sneakerTitle.toLowerCase().includes('camisa') &&
                !sneakerTitle.toLowerCase().includes('camiseta') &&
                !sneakerTitle.toLowerCase().includes('bolsa') &&
                !sneakerTitle.toLowerCase().includes('shorts') &&
                !sneakerTitle.toLowerCase().includes('mochila') &&
                !sneakerTitle.toLowerCase().includes('faixa')
            ) {
                await updateOrCreateSneaker(sneakerObj, saveType);

                storeObj.name === "CDR" && await page.waitForTimeout(5000);
                return;
            } else {
                console.log(`Not a sneaker: \n${srcLink}`);
                logs.addLog(`Not a sneaker: ${srcLink} - ${new Date().toISOString()}`);
                return;
            }
        } catch (error) {
            storeObj.name === "CDR" && await page.waitForTimeout(3000);
            retries++;
            console.log(`
            \nError processing link: ${url}
            \nError: ${error}
            \nUser Agent: ${userAgent}`);

            logs.addLog(`Error processing link: ${url} | ${error.message} - ${new Date().toISOString()}`);
        }
    }
    throw new Error(`
    \nFailed to process link after ${maxRetries} retries 
    \nUrl: ${url}
    \nUser agent: ${userAgent}
    `);
}

module.exports = { processLink };