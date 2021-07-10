module.exports = (sequelize, DataTypes) => {
    const TClassUsers = sequelize.define('TClassUsers', {
        id: {
            type: DataTypes.UUID,        
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        class_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            field: 'created_at',
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            field: 'updated_at',
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 't_class_users',
        timestamp: true
    });

    return TClassUsers;
};