'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('t_class_activity', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      class_users_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      message: {
        type: Sequelize.STRING,
        allowNull: true
      },
      attachment: {
        type: Sequelize.STRING,
        allowNull: true
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

    await queryInterface.addConstraint('t_class_activity', {
      type: 'foreign key',
      fields: ['class_users_id'],
      name: 'T_CLASS_ACTIVITY_CLASS_USER_ID',
      references: {
        table: 't_class_users',
        field: 'id'
      }
    })

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('t_class_activity');
  }
};
