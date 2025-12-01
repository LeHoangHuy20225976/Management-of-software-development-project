'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoomLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RoomLog.belongsTo(models.Room, { foreignKey: 'room_id' });
    }
  }
  RoomLog.init({
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room_id: DataTypes.INTEGER,
    event_type: DataTypes.STRING,
    extra_context: DataTypes.TEXT,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RoomLog',
    tableName: 'room_logs',
    freezeTableName: true
  });
  return RoomLog;
};