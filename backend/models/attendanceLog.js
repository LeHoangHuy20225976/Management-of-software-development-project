"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AttendanceLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AttendanceLog.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }

  AttendanceLog.init(
    {
      log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'User',
          key: 'user_id'
        }
      },
      matched_face_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      recognition_confidence: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      recognition_threshold: {
        type: DataTypes.DOUBLE,
        defaultValue: 0.7
      },
      event_type: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          isIn: [['CHECK_IN', 'CHECK_OUT', 'RECOGNITION_SUCCESS', 'RECOGNITION_FAILED', 'MANUAL_ENTRY', 'MANUAL_CORRECTION']]
        }
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      device_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      device_type: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      captured_image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      captured_face_embedding: {
        type: DataTypes.STRING,
        allowNull: true
      },
      liveness_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      liveness_score: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'User',
          key: 'user_id'
        }
      },
      verification_notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      event_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "AttendanceLog",
      tableName: "attendance_logs",
      freezeTableName: true,
      timestamps: false
    }
  );

  return AttendanceLog;
};
