module.exports = (sequelize, DataTypes) => {
    const TClassActivity = sequelize.define('TClassActivity', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        class_users_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true
        },
        attachment: {
            type: DataTypes.STRING,
            allowNull: true
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
        tableName: 't_class_activity',
        timestamp: true
    });

    return TClassActivity;
};