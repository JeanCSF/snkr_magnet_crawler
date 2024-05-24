const { Decimal128 } = require("mongodb");
const { logs } = require("../utils");


function parseDecimal(str) {
    const cleanedStr = str.replace(/[^0-9.,]/g, '');
    const dotDecimalStr = cleanedStr.replace(/\./g, '').replace(',', '.');
    return new Decimal128(dotDecimalStr);
}

async function getPrice(priceObj) {
    const { page, storeObj } = priceObj;

    try {
        if (storeObj.name === "Netshoes") {
            const selectorsArr = storeObj.selectors.price.split(", ");
            const isMobile = await page.$(selectorsArr[1]);
            if (isMobile) {
                const price = await page.$eval(selectorsArr[1], el => el?.innerText.split(" ")[1].trim());
                return parseDecimal(price);
            } else {
                const price = await page.$eval(selectorsArr[0], el => el?.innerText.split(" ")[1].trim());
                return parseDecimal(price);
            }
        }

        const price = await page.$eval(storeObj.selectors.price, (el, storeObj) => {
            if (storeObj.name === "WallsGeneralStore") { return el.innerText.trim(); }
            const removeDelTag = (element) => {
                const delElement = element.querySelector('del');
                if (delElement) {
                    delElement.remove();
                }
            };

            removeDelTag(el);

            const priceText = el.innerText.trim();
            const match = priceText.match(/R\$\s*([\d.,]+)/);
            const sellPriceAttribute = el.getAttribute('data-sell-price');

            if (match) {
                return match[1];
            } else {
                return storeObj.name === "CDR" && sellPriceAttribute.replace('.', ',');
            }
        }, storeObj);

        return parseDecimal(price);

    } catch (error) {
        console.error("Error getting price:", error);
        logs.addLog(`Error getting price: ${error.message} - ${new Date().toISOString()}`);

        return null;
    }
}

async function getDiscountPrice(discountPriceObj) {
    const { page, storeObj } = discountPriceObj;

    try {
        if (storeObj.name === "CDR") {
            const discountPrice = await page.$eval(storeObj.selectors.discountPrice, (el) => {
                const priceText = el.innerText;
                const match = priceText.match(/R\$\s*([^\n]+)$/);
                if (match) {
                    return match[1];
                }
                return null;
            })
            return discountPrice ? parseDecimal(discountPrice) : discountPrice;
        }

        if (storeObj.name === "Netshoes") {
            const discountPrice = await page.evaluate(() => {
                let data = window.dataLayer[0];
                return data.ecommerce.detail.products[0].price;
            });

            return discountPrice;
        }

        if (storeObj.name === "Nike") {
            const discountPrice = await page.$eval(storeObj.selectors.discountPrice, el => el?.innerText.split(" ")[1].trim());

            return parseDecimal(discountPrice);
        }

        return null;
    } catch (error) {
        console.error("Error getting discount price:", error);
        logs.addLog(`Error getting discount price: ${error.message} - ${new Date().toISOString()}`);

        return null;
    }
}

module.exports = {
    getPrice,
    getDiscountPrice
}