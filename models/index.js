const Sequelize = require('sequelize');
const config=require('../config/config.json')['development'];
const User=require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');

const db = {};
const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);
User.associate(db);
Post.associate(db);
Hashtag.associate(db);

module.exports = db;