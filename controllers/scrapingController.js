const { Cluster } = require('puppeteer-cluster');

const { interceptRequests, logs } = require('../src/utils');
const { getLinks } = require('../src/getLinks');
const { processLink } = require('../src/processLink');
const { getSearchTerms, getNumOfPages, getCurrentPage } = require('../src/pageFunctions');

const storesObj = {
    nike: {
        name: 'Nike',
        baseUrl: 'https://www.nike.com.br/',
        selectors: {
            links: '.ProductCard-styled__ProductCardContainer-sc-8f840517-5',
            productReference: '.ProductInfos-styled__AttributesList-sc-9b3422e5-3 li:not([data-testid])',
            img: 'img[data-testid="main-photo-0"]',
            sneakerName: 'h1',
            price: '.ProductHeader-styled__InstallmentPixBold-sc-7d51491a-17',
            discountPrice: 'span[data-testid="pricebox"]',
            availableSizes: 'div[data-testid="product-sizes"] > .TextBox__TextBoxContainer-sc-1217s2c-0:not(.SizeSelector-styled__DisabledTextBox-sc-14a71e11-1)',
            pagination: '.Typographystyled__StyledHeading-sc-1h4c8w0-1',
            colors: 'li[data-testid="color-description"]',
            categories: '#__NEXT_DATA__',
        },
        searchFor: [
            'nav/categorias/tenis/tipodeproduto/calcados'
        ]
    },
    netshoes: {
        name: 'Netshoes',
        baseUrl: 'https://www.netshoes.com.br/',
        selectors: {
            links: '.wrapper[itemscope][data-quickview] a, .items-wrapper .item-card__description',
            productReference: '.wishlist__heart',
            img: '',
            sneakerName: 'section.short-description h1, .product-title h1',
            price: '.ncard-hint--info__payment, .ncard-vertical-icon .ncard-hint--info .ncard-hint--info__text',
            discountPrice: '.current-price, div.default-price strong, .price__currency',
            availableSizes: 'ul.radio-options li:not(.unavailable) > a.product-item, ul.product__size--list li:not(.unavailable) > a',
            pagination: '',
            colors: '.tcell .sku-select-title, .product__color--selected span',
            categories: 'head script[type="text/javascript"]:not(#vwoCode, #gtm-init)',
            brand: '#features ul, .detail-content[data-content] ul',
        },
        searchFor: [
            'busca/adidas?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/asics?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/kappa?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/mizuno?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/new-balance?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/nike?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/olympikus?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/puma?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/saucony?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/reebok?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/under-armour?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/hocks?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/mad-rats?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/redley?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/tesla?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/converse?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/dc?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/columbia?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/oakley?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/the-north-face?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/ous?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/hoka?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/on-running?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/champion?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/topper?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/umbro?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'busca/qix?tipo-de-produto=chinelos-e-sandalias&tipo-de-produto=chuteiras&tipo-de-produto=tenis&unavailable=false',
            'lst/fila-calcados?mi=sub_fila_t4_calcados_fila_181023-mas-00&psn=Banner_Trio_4&unavailable=false',
            'chinelos?q=rider&unavailable=false',
            'sandalias?q=rider&unavailable=false',
            'chinelos?q=crocs&unavailable=false',
            'sandalias?q=crocs&unavailable=false',
        ]
    },
    sunsetskateshop: {
        name: 'SunsetSkateshop',
        baseUrl: 'https://www.sunsetskateshop.com.br/',
        selectors: {
            links: '.products__item.ng-scope',
            productReference: '.product__description',
            img: '.product__image-container',
            sneakerName: 'h2.product__title',
            price: 'h3.product__price',
            availableSizes: '.product__option label[ng-if="stock.items_number > 0"]',
            pagination: '',
            colors: ''
        },
        searchFor: [
            'adidas',
            'cariuma',
            'columbia',
            'dc',
            'fila',
            'new balance',
            'nike nsw',
            'nike sb',
            'oakley',
            'tesla',
            'the north face',
            'vans',
            'ous'
        ]
    },
    ostore: {
        name: 'Ostore',
        baseUrl: 'https://www.ostore.com.br/',
        selectors: {
            links: '.prateleira-full-site.n4colunas ul > li > .box-item.text-center:not(.product-off)',
            productReference: '.productDescription',
            img: '#image',
            sneakerName: '.productName',
            price: '.skuBestPrice',
            availableSizes: '.select-itens > div:not(.unavailable)',
            pagination: '.resultado-busca-numero > .value',
            colors: '.item.first-item > a',
            storeSku: '.skuReference'
        },
        searchFor: [
            'adidas',
            'asics',
            'converse',
            'fila',
            'new balance',
            'nike',
            'puma',
            'reebok',
            'rider',
            'vans',
        ]
    },
    wallsgeneralstore: {
        name: 'WallsGeneralStore',
        baseUrl: 'https://www.wallsgeneralstore.com.br/',
        selectors: {
            links: '.product-box.flex.flex-column.justify-between:not(.not-available)',
            productReference: 'span[itemprop="sku"]',
            img: '#imgView',
            sneakerName: '.product-colum-right h1',
            price: '#variacaoPreco',
            availableSizes: 'ul.lista_cor_variacao li:not(.sem_estoque )',
            pagination: '',
            colors: '#caracteristicas'
        },
        searchFor: [
            'asics',
            'converse',
            'new balance',
            'nike sb',
            'vans',
            'ous',
            'piet',
        ]
    },
    ratusskateshop: {
        name: 'RatusSkateshop',
        baseUrl: 'https://www.ratusskateshop.com.br/',
        selectors: {
            links: '.js-product-container.js-quickshop-container.js-quickshop-has-variants',
            productReference: 'div[data-store].description.product-description.product-description-desktop',
            img: '.js-desktop-zoom.p-relative.d-block, .js-mobile-zoom.p-relative.d-block',
            sneakerName: '#product-name',
            price: '#price_display',
            availableSizes: '#product_form  span.btn-variant-content:not(.hintup-nostock)',
            pagination: '',
            colors: 'div[data-variant="Cor"] > label.variant-label > strong.js-insta-variation-label',
            storeSku: 'script[data-component="structured-data.page"]'
        },
        searchFor: [
            'Cariuma',
            'Converse',
            'Dc',
            'New Balance',
            'Nike Sb',
            'Ous',
            'Tesla',
            'Vans',
        ]
    },
    maze: {
        name: 'Maze',
        baseUrl: 'https://www.maze.com.br/',
        selectors: {
            links: '.ui.card.produto.product-in-card.in-stock',
            productReference: '.row.desc_info > .column_1',
            img: 'a[data-standard][data-video-url]',
            sneakerName: '#produto-nome',
            price: '#preco',
            availableSizes: '.ui.variacao.check:not(.sold) > button.ui.basic.button',
            pagination: '#nextPage',
            colors: '',
            storeSku: 'h6.codProduto'
        },
        searchFor: [
            'nike',
            'adidas',
            'vans',
            'puma',
            'converse',
            'new balance',
        ]
    },
    sunika: {
        name: 'Sunika',
        baseUrl: 'https://www.sunika.com.br/',
        selectors: {
            links: 'li.purchasable',
            productReference: '#ld-json',
            img: '#ld-json',
            sneakerName: '.information div .name',
            price: '.priceContainer > strong > span',
            availableSizes: '.options > label:not(.unavailable) > span > b',
            pagination: '.pagination',
            colors: 'h2.cor'
        },
        searchFor: [
            'adidas',
            'asics',
            'cariuma',
            'clarks',
            'converse',
            'crocs',
            'fila',
            'golden goose',
            'hoka',
            'mizuno',
            'new balance',
            'on running',
            'reebok',
            'superga',
            'under armour',
            'vans',
            'vert',
        ]
    },
    correderua: {
        name: 'CDR',
        baseUrl: 'https://www.correderua.com.br/',
        selectors: {
            links: 'li.span3 > .cn-melhor-imagem',
            productReference: '.info-principal-produto span[itemprop^="sku"]',
            img: '.conteiner-imagem',
            sneakerName: '.nome-produto.titulo.cor-secundaria',
            price: '.preco-produto.destaque-avista strong[data-sell-price]',
            discountPrice: 'span.desconto-a-vista strong',
            availableSizes: 'a.atributo-item:not(.indisponivel)',
            pagination: '.pagination ul li a',
            colors: '',
            storeSku: '.acoes-flutuante > .acoes-produto[data-variacao-id=""]'
        },
        searchFor: [
            'fila',
            'nike-ebernon',
            'mad-rats',
            '02-nike-court-borough',
            '01-air-max',
            '2-m2k',
            'air-force',
            'nike-sb',
            'hocks',
            '01-qix-20410829',
            '1-redley',
            'adidas',
            'puma',
            'dc-shoes',
            'air-max-correlate-e-command',
            'new-balance-22697012',
            'nike-blazer',
            'nike-dunk',
            'chinelo-20723668',
        ]
    },
    artwalk: {
        name: 'Artwalk',
        baseUrl: 'https://www.artwalk.com.br/',
        selectors: {
            links: '.vtex-product-summary-2-x-container.vtex-product-summary-2-x-containerNormal',
            productReference: '.vtex-product-identifier-0-x-product-identifier__value',
            img: 'img.vtex-store-components-3-x-productImageTag--products-list--main',
            sneakerName: 'h1 span.vtex-store-components-3-x-productBrand',
            price: 'span.vtex-product-price-1-x-sellingPrice',
            availableSizes: 'div.valueWrapper.vtex-store-components-3-x-skuSelectorItem:not(.vtex-store-components-3-x-unavailable)',
            pagination: '.vtex-search-result-3-x-totalProducts--layout',
            colors: '.artwalk-store-theme-7-x-current_color_selected',
            storeSku: 'meta[property="product:sku"]'
        },
        searchFor: [
            'tenis/adidas',
            'tenis/nike',
            'tenis/puma',
            'tenis/jordan',
            'tenis/converse',
            'tenis/vans',
            'tenis/under-armour',
            'tenis/fila',
            'tenis/new-balance',
            'tenis/veja',
            'calcados/sandalias/crocs',
            'calcados/sandalias/rider',
            'calcados/chinelos/rider',
            'calcados/chinelos/jordan',
            'calcados/chinelos/adidas',
            'calcados/chinelos/nike',
        ]
    },
    gdlp: {
        name: 'GDLP',
        baseUrl: 'https://www.gdlp.com.br/',
        selectors: {
            links: 'li.item.last',
            productReference: '#product-attribute-specs-table tr.last.even > td',
            img: '.magic-slide.mt-active',
            sneakerName: '.product-name > .h1',
            price: '.regular-price > span.price, .special-price > span.price',
            availableSizes: 'option',
            pagination: '.amount--has-pages',
            colors: '.tab-content .std',
            storeSku: 'head script:not([async],[type])',
        },
        searchFor: [
            // 'calcados/adidas',
            // 'calcados/asics',
            // 'calcados/converse',
            // 'calcados/crocs',
            // 'calcados/fila',
            // 'calcados/mizuno',
            // 'calcados/new-balance',
            // 'calcados/nike',
            // 'marca/on',
            // 'calcados/ous',
            // 'calcados/puma',
            // 'calcados/reebok',
            // 'calcados/rider',
            // 'calcados/vans',
            'calcados/hoka',
        ]
    },
    lojavirus: {
        name: 'LojaVirus',
        baseUrl: 'https://www.lojavirus.com.br/',
        selectors: {
            links: '.fbits-item-lista-spot > div',
            productReference: '.paddingbox',
            img: '#galeria > a',
            sneakerName: '.fbits-produto-nome.prodTitle.title',
            price: '.precoPor',
            availableSizes: '.valorAtributo:not(.disabled)',
            pagination: '.fbits-paginacao ul li.pg a',
            colors: '.atributos-cor > div[data-nomeatributo="Cor"] div > .selected .nomeCor',
            storeSku: '.fbits-sku',
        },
        searchFor: [
            'converse-all-star-tipo-tenis',
            'vans-tipo-tenis',
            'veja',
            'nike-tipo-tenis',
            'new-balance'
        ]
    },
    youridstore: {
        name: 'YourID',
        baseUrl: 'https://youridstore.com.br/',
        selectors: {
            links: 'h2.product-name',
            productReference: '.sku > .value',
            img: '#zoom1',
            sneakerName: 'h1',
            price: '.price',
            availableSizes: '#configurable_swatch_c2c_tamanho li',
            pagination: '#narrow-by-list > dd',
            colors: '#select_label_c2c_cor',
            storeSku: '',
        },
        searchFor: [
            'tenis/tenis-adidas.html',
            'tenis/tenis-asics.html',
            'tenis/sandalia-crocs.html',
            'tenis/tenis-converse.html',
            'tenis/tenis-fila.html',
            'tenis/tenis-hoka.html',
            'tenis/tenis-air-jordan.html',
            'tenis/tenis-lacoste.html',
            'tenis/tenis-mizuno.html',
            'tenis/tenis-new-balance.html',
            'tenis/tenis-nike.html',
            'tenis/on-running.html',
            'tenis/tenis-puma.html',
            'tenis/tenis-reebok-classic.html',
            'tenis/tenis-ous.html',
            'tenis/tenis-vans.html'
        ]
    }
};

const scrapingController = {
    start: async (req, res) => {
        try {
            const { url, concurrency, storeName, saveType, headlessType } = req.body;
            const headless = headlessType === "false" ? false : 'shell';
            const cluster = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_CONTEXT,
                maxConcurrency: parseInt(concurrency),
                puppeteerOptions: {
                    args: [
                        '--no-sandbox',
                        '--no-first-run',
                        '--disable-gpu',
                        '--start-maximized',
                    ],
                    defaultViewport: null,
                    headless: headless,
                    slowMo: 100,
                }
            });

            const allResultsSet = new Set();
            const allSearchTermsSet = new Set();
            const globalStoreObj = storesObj[storeName];

            await cluster.task(async ({ page, data: { url } }) => {
                try {
                    await interceptRequests(page, globalStoreObj.name);
                    const searchUrls = getSearchTerms({ url, searchFor: globalStoreObj.searchFor, storeName: globalStoreObj.name });
                    searchUrls.forEach(link => allSearchTermsSet.add(link));
                } catch (error) {
                    console.error(`Error processing ${url}:`, error.message);
                    logs.addLog(`Error processing ${url}: ${error.message} - ${new Date().toISOString()}`);
                }
            });

            await cluster.queue({ url: url });
            await cluster.idle();
            await getLinksCluster([...allSearchTermsSet], globalStoreObj);

            async function getLinksCluster(searchUrls, storeObj) {
                const pagesQueue = async (queueObj) => {
                    const { url, storeName, pageNumbers } = queueObj;
                    if (pageNumbers > 1) {
                        for (let i = 2; i <= pageNumbers; i++) {
                            switch (storeName) {
                                case "CDR":
                                case "LojaVirus":
                                    await cluster.queue({ url: `${url}?pagina=${i}` });
                                    break;

                                case "GDLP":
                                    await cluster.queue({ url: `${url}/page/${i}` });
                                    break;

                                case "Ostore":
                                    await cluster.queue({ url: `${url}#${i}` });
                                    break;

                                case "Netshoes":
                                    await cluster.queue({ url: `${url}&page=${i}` });
                                    break;

                                case "Sunika":
                                    await cluster.queue({ url: `${url}?pg=${i}` });
                                    break;

                                case "Maze":
                                    await cluster.queue({ url: `${url}&pageNumber=${i}` });
                                    break;

                                case "Artwalk":
                                case "Nike":
                                    await cluster.queue({ url: `${url}?page=${i}` });
                                    break;

                                case "YourID":
                                    await cluster.queue({ url: `${url}?p=${i}` });
                                    break;

                                default:
                                    break;
                            }
                        }
                    }
                }

                await cluster.task(async ({ page, data: { url } }) => {
                    try {
                        await interceptRequests(page, storeObj.name);
                        const currentPage = await getCurrentPage({ url, storeName: storeObj.name });
                        if (currentPage === 1) {
                            const pageNumbers = await getNumOfPages({ page, storeName: storeObj.name, storeSelectors: storeObj.selectors, url });
                            await pagesQueue({ url, storeName: storeObj.name, pageNumbers });
                        }
                        const links = await getLinks({ page, url, storeObj, currentPage });
                        links && links.forEach(link => allResultsSet.add(link));

                    } catch (error) {
                        console.error(`Error getting links from ${url}:`, error.message);
                        logs.addLog(`Error getting links from ${url}: ${error.message} - ${new Date().toISOString()}`);
                    }
                });

                for (const url of searchUrls) {
                    cluster.queue({ url, storeObj });
                }

                await cluster.idle();
                console.log(`${allResultsSet.size} total results`);
                logs.addLog(`${allResultsSet.size} total results - ${new Date().toISOString()}`);
                await processResultsCluster([...allResultsSet], globalStoreObj);
            }

            async function processResultsCluster(results, storeObj) {
                await cluster.task(async ({ page, data: { url } }) => {
                    try {
                        await interceptRequests(page, storeObj.name);
                        await processLink({ page, url, storeObj, saveType });
                    } catch (error) {
                        console.error(`Error processing ${url}:`, error.message);
                        logs.addLog(`Error processing ${url}: ${error.message} - ${new Date().toISOString()}`);
                    }
                });

                for (const url of results) {
                    cluster.queue({ url, storeObj });
                }
                await cluster.idle();
            }

            await cluster.close();
            res.status(200).json({ msg: "Scraping completed" });
            logs.addLog(`Scraping for ${storeName} completed - ${new Date().toISOString()}`);
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        }
    },

    logs: async (req, res) => {
        try {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');

            const interval = setInterval(() => {
                const newLogs = logs.entries.splice(0);
                newLogs.forEach(log => {
                    res.write(`data: ${log}\n\n`);
                });
            }, 100);

            req.on('close', () => {
                clearInterval(interval);
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
};

module.exports = scrapingController