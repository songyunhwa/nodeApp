const Sequelize = require('sequelize');

module.exports = class ChatRoom extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            title:{
                type: Sequelize.STRING(15),
                allowNull: true,
                unique: false,
            },
            postId:{
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: false,
            },
            userid:{
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
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"), //이렇게 수정!
             },
             updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn("NOW"),
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