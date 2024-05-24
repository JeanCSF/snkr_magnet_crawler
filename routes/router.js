const express = require("express");
const router = express.Router();

const scrapingRouter = require("./scraping");

router.use("/", scrapingRouter);
module.exports = router;