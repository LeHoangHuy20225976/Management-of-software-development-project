'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServicePossessing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ServicePossessing.belongsTo(models.RoomService, { foreignKey: 'service_id' });
      ServicePossessing.belongsTo(models.RoomType, { foreignKey: 'type_id' });
    }
  }
  ServicePossessing.init({
    service_id: DataTypes.INTEGER,
    type_id: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ServicePossessing',
    tableName: 'ServicePossessing',
    freezeTableName: true
  });
  return ServicePossessing;
};