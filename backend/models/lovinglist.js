'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LovingList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LovingList.belongsTo(models.User, { foreignKey: 'user_id' });
      LovingList.belongsTo(models.Destination, { foreignKey: 'destination_id' }); // may be NULL
      LovingList.belongsTo(models.Hotel, { foreignKey: 'hotel_id' }); // may be NULL
    }
  }
  LovingList.init({
    id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    destination_id: DataTypes.INTEGER,
    hotel_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LovingList',
    tableName: 'LovingList',
    freezeTableName: true
  });
  return LovingList;
};