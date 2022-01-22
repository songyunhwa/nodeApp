const Sequelize = require('sequelize');

module.exports = class ChatRoom extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            title:{
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true,
            },
            owner:{
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: false,
            },
            password:{
                type: Sequelize.STRING,
                allowNull: false,
                unique: false,
            },
            max:{
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: false,
            },
            
            
        },
        {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ChatRoom',
            tableName: 'chatrooms',
            paranoid: true,
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }

}