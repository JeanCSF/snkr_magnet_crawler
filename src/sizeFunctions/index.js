const { logs } = require('../utils');

async function getAvailableSizes(sizesObj) {
    const { page, storeObj } = sizesObj;

    try {
        const availableSizesSet = new Set();
        if (storeObj.name === "Netshoes") {
            const availableSizes = await page.evaluate(() => {
                return window.dataLayer[0].ecommerce.detail.products[0].availableSizes.split(',');
            });

            availableSizes.forEach(size => !isNaN(size.split('/')[0]) && availableSizesSet.add(size.split('/')[0]));
            return [...availableSizesSet];
        }

        const availableSizes = await page.$$eval(storeObj.selectors.availableSizes, (els) => {
            return els
                .filter(el => !el.classList.contains('item_unavailable') && !el.classList.contains('disabled'))
                .map((el) => {
                    const sizeText = el.innerText.trim();
                    const numericSize = parseFloat(sizeText.replace(',', '.'));
                    return !isNaN(numericSize) ? numericSize : null;
                })
                .filter((size) => size !== null);
        });

        availableSizes.forEach(size => availableSizesSet.add(size));

        return [...availableSizesSet];

    } catch (error) {
        console.error("Error getting available sizes:", error);
        logs.addLog(`Error getting available sizes: ${error.message} - ${new Date().toISOString()}`);

        return [];
    }
}

module.exports = {
    getAvailableSizes
}