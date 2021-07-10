'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('m_users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM,
        values: ['inactive', 'active'],
        allowNull: false
      },
      confirmation_code: {
        type: Sequelize.STRING,
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

    await queryInterface.addConstraint('m_users', {
      type: 'unique',
      fields: ['confirmation_code'],
      name: 'UNIQUE_USERS_CONFIRMATIONCODE'
    })

    await queryInterface.addConstraint('m_users', {
      type: 'unique',
      fields: ['username'],
      name: 'UNIQUE_USERS_USERNAME'
    })

    await queryInterface.addConstraint('m_users', {
      type: 'unique',
      fields: ['email'],
      name: 'UNIQUE_USERS_EMAIL'
    })

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('m_users');
  }
};
