'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('t_class_users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addConstraint('t_class_users', {
      type: 'foreign key',
      fields: ['class_id'],
      name: 'T_CLASS_USERS_CLASS_ID',
      references: {
        table: 'm_class',
        field: 'id'
      }
    })

    await queryInterface.addConstraint('t_class_users', {
      type: 'foreign key',
      fields: ['user_id'],
      name: 'T_CLASS_USERS_USER_ID',
      references: {
        table: 'm_users',
        field: 'id'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('t_class_users');
  }
};
