// nodejs core modules
const path = require('path');

// nodejs npm installed modules
require('dotenv').config();
const express = require('express');
const fileUpload = require("express-fileupload");
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');

//util
const sequelize = require('./util/database');
const scheduler =require('./util/scheduler');
//models
const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const Request = require('./models/request');
const Admin = require('./models/admin');
const ArchivedChat = require('./models/archivedChat');
//routes
const homepageRoutes = require('./routes/homepage');
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group');
const adminroutes = require('./routes/admin');
//controllers
const errorController = require('./controllers/error');

const app = express();

// middlewares
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // file size limit = 5 MB
    abortOnLimit: true
}));

// routes
app.use(homepageRoutes);
app.use('/user', userRoutes);
app.use('/group/admin', adminroutes);
app.use('/group', groupRoutes);
app.use(errorController.get404Page);

/* ---------- Database relations start ---------- */

// User -> Chat : one to many
User.hasMany(Chat);
Chat.belongsTo(User);

// Group -> Chat : one to many
Group.hasMany(Chat);
Chat.belongsTo(Group);

// User -> Group : many to many
User.belongsToMany(Group, { through: 'User_Group' });
Group.belongsToMany(User, { through: 'User_Group' });

// User -> Request : one to many
User.hasMany(Request);
Request.belongsTo(User);

// Group -> Request : one to many
Group.hasMany(Request);
Request.belongsTo(Group);

// User -> Admin : one to Many
User.hasMany(Admin);
Admin.belongsTo(User);

// Group -> Admin : one to many
Group.hasMany(Admin);
Admin.belongsTo(Group);

// User -> ArchivedChat : one to many
User.hasMany(ArchivedChat);
ArchivedChat.belongsTo(User);

// Group -> ArchivedChat : one to many
Group.hasMany(ArchivedChat);
ArchivedChat.belongsTo(Group);

/* ---------- Database relations end ---------- */

// Start the server
sequelize.sync()
.then((result) => {
    app.listen(process.env.PORT || 3000, () => console.log('SERVER STARTED'));
})
.catch((err) => console.log(err));

// Move all the chats from 'Chats' to 'ArchivedChats' DB-table at 23:59:59
cron.schedule('59 59 23 * * *', scheduler.moveChatsToArchivedChats);