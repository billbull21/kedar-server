'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM,
        values: ['admin', 'client'],
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
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

    await queryInterface.addConstraint('users', {
      type: 'unique',
      fields: ['username'],
      name: 'UNIQUE_USERS_USERNAME'
    })

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
