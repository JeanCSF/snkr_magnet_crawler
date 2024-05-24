const { generateRandomUserAgent, lastString, logs } = require("../utils");

function createSearchUrl(url, term, storeName) {
    if (storeName === "CDR") {
        return [`${url}${term}`];
    }

    if (storeName === "GDLP") {
        return [`${url}${term.replace(/\s+/g, "-").toLowerCase()}`];
    }

    if (storeName === "Artwalk") {
        return [`${url}${term}`];
    }

    if (storeName === "LojaVirus") {
        return [`${url}${term}`];
    }

    if (storeName === "Sunika") {
        return [`${url}marcas/${term.replace(/\s+/g, "-").toLowerCase()}.partial`];
    }

    if (storeName === "Maze") {
        switch (term) {
            case "nike":
                return ['https://www.maze.com.br/product/getproductscategory/?path=%2Fcategoria%2Ftenis%2Fnike&viewList=g&pageSize=0&category=124682'];

            case "adidas":
                return ['https://www.maze.com.br/product/getproductscategory/?path=%2Fcategoria%2Ftenis%2Fadidas&viewList=g&pageSize=0&category=124985'];

            case "vans":
                return ['https://www.maze.com.br/product/getproductscategory/?path=%2Fcategoria%2Ftenis%2Fvans&viewList=g&pageSize=0&category=125036'];

            case "puma":
                return ['https://www.maze.com.br/product/getproductscategory/?path=%2Fcategoria%2Ftenis%2Fpuma&viewList=g&pageSize=0&category=124701'];

            case "converse":
                return ['https://www.maze.com.br/product/getproductscategory/?path=%2Fcategoria%2Ftenis%2Fconverse&viewList=g&pageSize=0&category=125146'];

            case "new balance":
                return ['https://www.maze.com.br/product/getproductscategory/?path=%2Fcategoria%2Ftenis%2Fnew-balance&viewList=g&pageSize=0&category=125147'];

            default:
                break;
        }
    }

    if (storeName === "RatusSkateshop") {
        if (term === "Dc" || term === "New Balance" || term === "Nike Sb") {
            return [`${url}tenis1/?mpage=10&Marca=${encodeURIComponent(term)}`, `${url}tenisquickstrike/?mpage=2&Marca=${encodeURIComponent(term)}`];
        }

        return [`${url}tenis1/?mpage=10&Marca=${encodeURIComponent(term)}`];
    }

    if (storeName === "WallsGeneralStore") {
        if (term === "converse") {
            return [`${url}calcados/converse`]
        }
        return [`${url}loja/busca.php?palavra_busca=${term.replace(/\s+/g, "+").toLowerCase()}&variants%5B%5D=Categorias%7C%7CT%C3%AAnis`];
    }

    if (storeName === "Ostore") {
        return [`${url}sneakers/${encodeURIComponent(term).toLowerCase()}?O=OrderByReleaseDateDESC&PS=28`];
    }

    if (storeName === "SunsetSkateshop") {
        return [`${url}marca/calcados/${term.replace(/\s+/g, "-").toLowerCase()}`];
    }

    if (
        storeName === "Netshoes" ||
        storeName === "YourID" ||
        storeName === "Nike"
    ) {
        return [`${url}${term}`];
    }

    console.error("Invalid URL:", url);
    return url;
}

function getSearchTerms(searchTermObj) {
    const { url, searchFor, storeName } = searchTermObj;
    const searchTerms = [];
    try {
        for (const term of searchFor) {
            const searchUrl = createSearchUrl(url, term, storeName);
            searchTerms.push(...searchUrl);
        }
    } catch (error) {
        console.error("Error getting search terms:", error);
        logs.addLog(`Error getting search terms: ${error.message} - ${new Date().toISOString()}`);

        return [];
    }
    return searchTerms;
}

async function getNumOfPages(numOfPagesObj) {
    const { page, storeName, storeSelectors, url } = numOfPagesObj;
    try {
        await page.setUserAgent(await generateRandomUserAgent());
        await page.goto(url);
        switch (storeName) {
            case "CDR":
            case "LojaVirus":
                return await page.evaluate((selectors) => {
                    const links = document.querySelectorAll(selectors.pagination);
                    if (links.length >= 2) {
                        return parseInt(links[links.length - 2].innerText);
                    }
                    return null;
                }, storeSelectors);

            case "GDLP":
                const totalGdlp = await page.evaluate((selectors) => {
                    const element = document.querySelector(selectors.pagination);
                    return element ? element.textContent.trim().split(' ')[2] : null;
                }, storeSelectors);
                return totalGdlp ? Math.ceil(totalGdlp / 40) : null;

            case "Ostore":
                const totalOstore = await page.$eval(storeSelectors.pagination, (totalElement) => {
                    return totalElement ? parseInt(totalElement.textContent.trim()) : null;
                });
                return totalOstore ? Math.ceil(totalOstore / 28) : null;

            case "Netshoes":
                let totalNetshoes = null;
                const isMobile = await page.$('.info-list__quantity');
                if (isMobile) {
                    totalNetshoes = await page.$eval('.info-list__quantity', (el) => el.innerText.trim().split(' ')[0]);
                } else {
                    totalNetshoes = await page.$eval('.items-info.half span.block', (el) => {
                        const elArr = el.innerText.trim().split(' ');
                        return parseInt(elArr[elArr.length - 2]);
                    });
                }
                return totalNetshoes ? Math.ceil(totalNetshoes / 42) : null;

            case "Sunika":
                const totalSunika = await page.$eval(storeSelectors.pagination, (el) => el.innerText.trim());
                return totalSunika ? parseInt(lastString(totalSunika)) : null;

            case "Maze":
                const hasNextPage = await page.$(storeSelectors.pagination, { timeout: 1500 });
                if (hasNextPage) {
                    const totalMaze = await page.$eval(storeSelectors.pagination, (el) => {
                        const lastPage = el.getAttribute('data-last-page');
                        if (lastPage) {
                            return lastPage;
                        }
                        return null;
                    });
                    return totalMaze ? parseInt(totalMaze) : null;
                }
                return 1;

            case "Artwalk":
                const totalArtwalk = await page.$eval(storeSelectors.pagination, (el) => {
                    const products = el?.innerText.match(/\d+/g);
                    if (products) {
                        return parseInt(products[0]);
                    }
                    return null;
                })
                return totalArtwalk ? Math.ceil(totalArtwalk / 12) : null;

            case "YourID":
                const totalYourID = await page.$$eval(storeSelectors.pagination, (els) => els[1].innerText.split(" ")[1].replace(/[()]/g, '').trim());
                return totalYourID ? Math.ceil(totalYourID / 48) : null;

            case "Nike":
                const totalNike = await page.$eval(storeSelectors.pagination, el => el?.innerText.replace(/[()]/g, '').trim());
                // return totalNike ? Math.ceil(totalNike / 30) : null;
                return 1;
            default:
                return null;
        }
    } catch (error) {
        console.error("Error getting num of pages:", error);
        logs.addLog(`Error getting num of pages: ${error.message} - ${new Date().toISOString()}`);

        return null;
    }
}

async function getCurrentPage(currentPageObj) {
    const { url, storeName } = currentPageObj;
    try {
        const searchParams = new URLSearchParams(url);
        switch (storeName) {
            case "CDR":
            case "Artwalk":
            case "LojaVirus":
            case "YourID":
            case "Sunika":
            case "Nike":
                const pageMatch = url.match(/=(\d+)/);
                return pageMatch ? parseInt(pageMatch[1]) : 1;

            case "GDLP":
                const lastNumberMatch = url.match(/\/(\d+)(\/?)$/);
                const lastNumberString = lastNumberMatch ? lastNumberMatch[1] : null;
                return lastNumberString ? parseInt(lastNumberString) : 1;

            case "Ostore":
                const match = url.match(/#(\d+)/);
                return match ? parseInt(match[1]) : 1;

            case "Netshoes":
                return parseInt(searchParams.get("page")) || 1;

            case "Maze":
                const MazeMatch = url.match(/pageNumber=(\d+)/);
                return MazeMatch ? parseInt(MazeMatch[1]) : 1;

            default:
                return 1;
        }
    } catch (error) {
        console.error("Error getting current page:", error);
        logs.addLog(`Error getting current page: ${error.message} - ${new Date().toISOString()}`);

        return 1;
    }
}

module.exports = {
    getSearchTerms,
    getNumOfPages,
    getCurrentPage
}