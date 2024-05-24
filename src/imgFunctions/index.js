const { logs } = require('../utils');
async function getImg(imgObj) {
    const { page, storeObj } = imgObj;

    try {
        if (storeObj.name === "Netshoes") {
            const img = await page.evaluate(() => {
                return window.dataLayer[0].ecommerce.detail.products[0].image;
            });

            return `https://static.netshoes.com.br${img.replace("_detalhe1", "_zoom1")}`;
        }

        if (storeObj.name === "Sunika") {
            const productReference = await page.$eval(storeObj.selectors.productReference, (el) => {
                const match = el.innerText.match(/"image": \[\s*"([^"]*)"/i);
                return match ? match[1].trim() : el.innerText;
            })

            return productReference.trim();
        }

        if (storeObj.name === "WallsGeneralStore" || storeObj.name === "Artwalk") {
            const img = await page.$eval(storeObj.selectors.img, (el) => el?.src);
            return img;
        }

        if (storeObj.name === "Maze") {
            return await page.$eval(storeObj.selectors.img, el => el?.getAttribute("data-standard"));
        }

        if (storeObj.name === "YourID") {
            return await page.$eval(storeObj.selectors.img, el => el?.href);
        }

        const img = await page.$eval(storeObj.selectors.img, (el, storeObj) => {
            const imgElement = el.querySelector("img");

            if (storeObj.name === "WallsGeneralStore" || storeObj.name === "GDLP") {
                const aElement = el.querySelector("a")?.href;
                return aElement;
            }

            return imgElement?.src;
        }, storeObj);

        return img;
    } catch (error) {
        console.error("Error getting img:", error);
        logs.addLog(`Error getting img: ${error.message} - ${new Date().toISOString()}`);

        return null;
    }
}

module.exports = {
    getImg
}