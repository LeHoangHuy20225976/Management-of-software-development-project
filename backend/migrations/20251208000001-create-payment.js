'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payment', {
      payment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Booking',
          key: 'booking_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'vnpay'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending'
        // pending, processing, completed, failed, refunded, cancelled
      },
      vnp_txn_ref: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      vnp_transaction_no: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      vnp_response_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      vnp_bank_code: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      vnp_pay_date: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      vnp_order_info: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payment_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index for faster lookups
    await queryInterface.addIndex('Payment', ['booking_id']);
    await queryInterface.addIndex('Payment', ['vnp_txn_ref']);
    await queryInterface.addIndex('Payment', ['status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Payment');
  }
};

