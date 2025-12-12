const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/batch', controller.processBatch);

module.exports = router;
