const { arraysEqual, logs } = require("../utils");
const { Sneaker: SneakerModel } = require("../../models/Sneaker");
const ExcelJS = require("exceljs");
const path = require("path");
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet("Test Data");
worksheet.addRow(["Store", "Product Reference", "Brand", "Sneaker Title", "Categories", "Colors", "Current Price", "Discount Price", "Available Sizes", "Date", "Link", "Image", "Code From Store"]);

async function updateOrCreateSneaker(sneakerObj, saveType) {
    const { codeFromStore, store } = sneakerObj;
    try {
        if (saveType === "excel") {
            if (sneakerObj.availableSizes.length >= 1) {
                worksheet.addRow([sneakerObj.store, sneakerObj.productReference, sneakerObj.brands.join(', '), sneakerObj.sneakerTitle, sneakerObj.categories.join(', '), sneakerObj.colors.join(', '), sneakerObj.currentPrice, sneakerObj.discountPrice, sneakerObj.availableSizes.join(', '), new Date().toLocaleString(), sneakerObj.srcLink, sneakerObj.img, sneakerObj.codeFromStore]);
                const filePath = path.join(__dirname, "../test_data/test_data.xlsx");
                await workbook.xlsx.writeFile(filePath);
                console.log(`Added ${sneakerObj.sneakerTitle} to test data`);
                logs.addLog(`Added ${sneakerObj.sneakerTitle} to test data - ${new Date().toISOString()}`);
            } else {
                console.log(`${sneakerObj.sneakerTitle} has no available sizes.`);
                logs.addLog(`${sneakerObj.sneakerTitle} has no available sizes. - ${new Date().toISOString()}`);
            }
        } else {
            const existingSneaker = await SneakerModel.findOne({ store, codeFromStore });
            if (existingSneaker) {
                const sizesChanged = !arraysEqual(existingSneaker.availableSizes, sneakerObj.availableSizes);
                const hasAvailableSizes = sneakerObj.availableSizes.length >= 1;
                const priceChanged = Number(existingSneaker.currentPrice) !== Number(sneakerObj.currentPrice);

                if (sizesChanged && !hasAvailableSizes) {
                    await SneakerModel.deleteOne({ _id: existingSneaker._id });
                    console.log(`No more available sizes. ${sneakerObj.sneakerTitle} removed from database.`);
                    logs.addLog(`No more available sizes. ${sneakerObj.sneakerTitle} removed from database. - ${new Date().toISOString()}`);
                    return;
                }

                if (sizesChanged && hasAvailableSizes) {
                    await SneakerModel.updateOne(
                        { _id: existingSneaker._id },
                        { $set: { availableSizes: sneakerObj.availableSizes } }
                    );
                    console.log(`${sneakerObj.sneakerTitle} available sizes updated.`);
                    logs.addLog(`${sneakerObj.sneakerTitle} available sizes updated. - ${new Date().toISOString()}`);
                    return;
                }

                if (priceChanged) {
                    await SneakerModel.updateOne(
                        { _id: existingSneaker._id },
                        {
                            $set: { currentPrice: sneakerObj.currentPrice },
                            $push: { priceHistory: { price: sneakerObj.currentPrice, date: new Date() } }
                        }
                    );
                    console.log(`${sneakerObj.sneakerTitle} price changed.`);
                    logs.addLog(`${sneakerObj.sneakerTitle} price changed. - ${new Date().toISOString()}`);
                    return;
                }

                console.log(`${sneakerObj.sneakerTitle} has no changes.`);
                logs.addLog(`${sneakerObj.sneakerTitle} has no changes. - ${new Date().toISOString()}`);
                return;
            } else {
                if (sneakerObj.availableSizes.length >= 1) {
                    const invalidCategory = sneakerObj.categories.length > 1 && sneakerObj.categories.some(category => {
                        const lowerCaseCategory = category.toLowerCase();
                        return lowerCaseCategory.includes("roupas") ||
                            lowerCaseCategory.includes("bola") ||
                            lowerCaseCategory.includes("saia") ||
                            lowerCaseCategory.includes("meias") ||
                            lowerCaseCategory.includes("gorros");
                    });


                    if (invalidCategory) {
                        console.log(`${sneakerObj.sneakerTitle} is not a sneaker.`);
                        logs.addLog(`${sneakerObj.sneakerTitle} is not a sneaker. - ${new Date().toISOString()}`);
                        return;
                    } else {
                        await SneakerModel.create(sneakerObj);
                        console.log(`${sneakerObj.sneakerTitle} added to database.`);
                        logs.addLog(`${sneakerObj.sneakerTitle} added to database. - ${new Date().toISOString()}`);
                        return;
                    }
                } else {
                    console.log(`${sneakerObj.sneakerTitle} has no available sizes.`);
                    logs.addLog(`${sneakerObj.sneakerTitle} has no available sizes. - ${new Date().toISOString()}`);
                    return;
                }
            }
        }
    } catch (error) {
        console.error("Unexpected error:", error);
        logs.addLog(`Unexpected error: ${error.message} - ${new Date().toISOString()}`);

        return;
    }
}

module.exports = { updateOrCreateSneaker };