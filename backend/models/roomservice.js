'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association 
      // many to many relationship between RoomService and RoomType through ServicePossessing
      RoomService.belongsToMany(models.RoomType, {
        through: models.ServicePossessing,
        foreignKey: 'service_id',
        otherKey: 'type_id'
      });
    }
  }
  RoomService.init({
    service_id: DataTypes.INTEGER,
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RoomService',
    tableName: 'RoomService',
    freezeTableName: true
  });
  return RoomService;
};