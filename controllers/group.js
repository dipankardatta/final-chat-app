const path = require('path');

const {Op} = require('sequelize');

const User = require('../models/user'); 
const Group = require('../models/group');
const Chat = require('../models/chat');
const Admin = require('../models/admin');
const S3Services = require('../services/AwsS3');

exports.getGroupChats = async (req, res) => {
    try{
        const lastmessageid = req.query.lastmsgid;
        const groupId = req.group.id;
        
        const groupChats = await Chat.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.gt]: lastmessageid } }, // id > lastmessageid
                    { groupId: groupId }
                ]
            },
            attributes: ['id', 'message', 'createdAt'],
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        res.status(200).json(groupChats);
    }catch(err){
        console.log('GET GROUP CHATS ERROR');
        res.status(500).json({ error: err, msg: 'Could not fetch group chats' });
    }
}

exports.postaddChat = async (req, res) => {
    try{
        const userId = req.user.id;
        const groupId = req.group.id;
        const message = req.body.message;

        if(!message){
            res.status(400).json({ msg: 'All fields are required' });
            return;
        }

        const chat = await Chat.create({
            message,
            userId,
            groupId,
        });

        res.status(201).json(chat);
    }catch(err){
        console.log('POST ADD CHAT IN GROUP ERROR');
        res.status(500).json({ error: err, msg: 'Could not add chat in group' });
    }
}

exports.getGroupMembers = async (req, res) => {
    try{
        const groupId = req.group.id;

        const members = await User.findAll({
            attributes: ['username', 'email'],
            include: [{
                model: Group,
                where: { id: groupId },
                attributes: []
            }]
        });

        const admin = await Admin.findOne({
            where: { groupId },
            attributes: [],
            include: [{
                model: User,
                attributes: ['username', 'email']
            }]
        });

        res.status(200).json({ members, admin });
    }catch(err){
        console.log('GET GROUP MEMBERS ERROR');
        res.status(500).json({ error: err, msg: 'Could not fetch group members' });
    }
}

exports.deleteLeaveGroup = async (req, res) => {
    try{
        const user = req.user;
        const group = req.group;

        const adminCheck = await Admin.findOne({
            where: {
                [Op.and]: [
                    { userId: user.id },
                    { groupId: group.id }
                ]
            }
        });
        
        if(adminCheck){
            res.status(400).json({ msg: `Admin cannot leave the group` });
            return;
        }

        await group.removeUser(user); // update user_group junction table

        res.status(200).json({ msg: `You left the group <${group.groupName}>` });
    }catch(err){
        console.log('GET LEAVE GROUP ERROR');
        res.status(500).json({ error: err, msg: 'Could not leave group' });
    }
}

exports.postUploadFile = async (req, res) => {
    try{
        const userId = req.user.id;
        const groupId = req.group.id;

        if(!req.files) {
            res.status(400).json({ msg: 'No files were uploaded' });
            return;
        }

        const file = req.files.myFile; // get the file; name='myFile' is in the <input>
        
        const extensionName = path.extname(file.name); // fetch the file extension
        const allowedExtension = ['.png','.jpg','.jpeg'];
        if(!allowedExtension.includes(extensionName)){
            res.status(422).json({ msg: 'Invalid file extension' });
            return;
        }

        const date = new Date();
        const fileName = `Photo_${date}_${userId}_${groupId}_${file.name}`;
        
        const fileURL = await S3Services.uploadToS3(file.data, fileName);
        
        const chat = await Chat.create({
            message: fileURL,
            userId,
            groupId,
        });

        res.status(201).json(chat);
    }catch(err){
        console.log('POST UPLOAD FILE ERROR');
        res.status(500).json({ error: err, msg: 'Could not upload file' });
    }
}