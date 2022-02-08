const {Sequelize, DataTypes} = require('sequelize');
// 관계형 데이터베이스(RDB)의 데이터를 조작하게 하는 기술
module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING(100),
                allowNull : true,
                unique: true,
            },
            content: {
                type: Sequelize.STRING(500),
                allowNull: false.valueOf,
            },
            writerId: {
                type: Sequelize.STRING(100),
                allowNull: false.valueOf,
            },
            writer: {
                type: Sequelize.STRING(100),
                allowNull: false.valueOf,
            },
            image: {
                type: DataTypes.BLOB("long"), 
                allowNull: true,
            },

        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: true,
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
}