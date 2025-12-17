'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Hotel', 'thumbnail', {
      type: Sequelize.TEXT
    });

    await queryInterface.changeColumn('Destination', 'thumbnail', {
      type: Sequelize.TEXT
    });

    await queryInterface.changeColumn('User', 'profile_image', {
      type: Sequelize.TEXT
    });

    await queryInterface.changeColumn('Image', 'image_url', {
      type: Sequelize.TEXT
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Hotel', 'thumbnail', {
      type: Sequelize.STRING
    });

    await queryInterface.changeColumn('Destination', 'thumbnail', {
      type: Sequelize.STRING
    });

    await queryInterface.changeColumn('User', 'profile_image', {
      type: Sequelize.STRING
    });

    await queryInterface.changeColumn('Image', 'image_url', {
      type: Sequelize.STRING
    });
  }
};

