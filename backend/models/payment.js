'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Payment belongs to a Booking
      Payment.belongsTo(models.Booking, { foreignKey: 'booking_id' });
    }
  }
  Payment.init({
    payment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'vnpay'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending'
      // pending, processing, completed, failed, refunded, cancelled
    },
    vnp_txn_ref: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    vnp_transaction_no: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    vnp_response_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    vnp_bank_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    vnp_pay_date: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    vnp_order_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    payment_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payment',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Payment;
};

