'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // 1-1 relationship between RoomPrice and RoomType
      RoomPrice.belongsTo(models.RoomType, { foreignKey: 'type_id' });
    }
  }
  RoomPrice.init({
    price_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    special_price: DataTypes.BIGINT,
    event: DataTypes.STRING,
    basic_price: DataTypes.BIGINT,
    discount: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'RoomPrice',
    tableName: 'RoomPrice',
    freezeTableName: true,
    timestamps: true
  });
  return RoomPrice;
};