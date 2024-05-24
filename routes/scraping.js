const scrapingController = require("../controllers/scrapingController");
const router = require("express").Router();
const express = require("express");
const path = require("path");


router.use(express.static(path.join(__dirname, "../public")));

router.route('/')
    .get((req, res) => { res.sendFile(path.join(__dirname, '../public/index.html')); });

router.route('/start')
    .post((req, res) => scrapingController.start(req, res));

router.route('/logs')
    .get((req, res) => scrapingController.logs(req, res));
module.exports = router;