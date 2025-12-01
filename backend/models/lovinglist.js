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
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    destination_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'LovingList',
    tableName: 'LovingList',
    freezeTableName: true
  });
  return LovingList;
};