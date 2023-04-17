const express = require('express');

const authentication = require('../middleware/auth');
const adminController = require('../controllers/admin');

const router = express.Router();

router.delete('/removeGroupMember', authentication.authenticateGroupAdmin, adminController.deleteGroupMember);

router.post('/promoteGroupMemberToAdmin', authentication.authenticateGroupAdmin, adminController.postPromoteGroupMemberToAdmin);

module.exports = router;