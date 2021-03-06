const Sequelize = require('sequelize');
// 관계형 데이터베이스(RDB)의 데이터를 조작하게 하는 기술
module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull : true,
                unique: true,
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false.valueOf,
            },
            password: {
                type: Sequelize.STRING(10),
                allowNull: true,
            },
            provider: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local',
            },
            snsId: {
                type: Sequelize.STRING(100),
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
}