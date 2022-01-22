
const Sequelize = require('sequelize');
const config=require('../config/config.json')['development'];
const User=require('./user');
const ChatRoom = require('./chatRoom');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.ChatRoom = ChatRoom;

User.init(sequelize);
ChatRoom.init(sequelize);

//User.associate(db);
//ChatRoom.associate(db);

module.exports = db;