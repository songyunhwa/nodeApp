const Sequelize = require('sequelize');

module.exports = class ChatRoom extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            data:{
                type: Sequelize.STRING(200),
                allowNull: true,
                unique: false,
            },
            roomId:{
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: false,
            },
            email:{
                type: Sequelize.STRING(40),
                allowNull: false,
                unique: false,
            },
            userId:{
                type: Sequelize.STRING,
                allowNull: false,
                unique: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"), //이렇게 수정!
             },
            
        },
        {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Chat',
            tableName: 'chats',
            paranoid: true,
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }

}