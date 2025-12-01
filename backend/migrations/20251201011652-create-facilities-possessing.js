'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FacilitiesPossessing', {
      facility_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'HotelFacilities',
          key: 'facility_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      hotel_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Hotel',
          key: 'hotel_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      description: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FacilitiesPossessing');
  }
};