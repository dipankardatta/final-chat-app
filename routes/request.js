const express = require('express');

const userAuthentication = require('../middleware/auth');
const requestController = require('../controllers/request');

const router = express.Router();

router.post('/generate-request/:groupId', userAuthentication.authenticateUserGroup, requestController.postGenerateRequest);

router.get('/pending-requests', userAuthentication.authenticateUser, requestController.getPendingRequests);

router.post('/confirm-request/:groupId', userAuthentication.authenticateUser, requestController.postConfirmRequest);

module.exports = router;