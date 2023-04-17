const sequelize = require('./database');
const Chat = require('../models/chat');
const ArchivedChat = require('../models/archivedChat');

exports.moveChatsToArchivedChats = async() => {
    console.log('----------------------------------');
    const startTime = Date.now();
    console.log('Scheduler started at- ' + new Date().toISOString());

    const t = await sequelize.transaction();
    
    try{
        const chats = await Chat.findAll({
            attributes: ['message', 'userId', 'groupId']
        });
        const stringifiedChats = JSON.stringify(chats);
        
        await ArchivedChat.bulkCreate(JSON.parse(stringifiedChats), { transaction: t });
    
        await Chat.destroy({ truncate: true, transaction: t });

        await t.commit();
        console.log('SUCCESS: Updated Chats and ArchivedChats DB-tables');
    }catch(err){
        console.log('ERROR: Chats and ArchivedChats DB-tables NOT updated');
        console.log(err);
        await t.rollback();
    }

    console.log('Scheduler stopped at- ' + new Date().toISOString());
    console.log(`Time taken = ${Date.now() - startTime} ms`);
    console.log('----------------------------------');
} 