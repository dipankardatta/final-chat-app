const path = require('path');

exports.getChat = (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','chat.html'));
}