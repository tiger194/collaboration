const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    allowNull: false,
  },
  courseId: {
    type: DataTypes.INTEGER,
    references: { model: Course, key: 'id' },
    allowNull: false,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    allowNull: false,
  },
});

// Set up associations
Mark.associate = (models) => {
  Mark.belongsTo(models.User, { as: 'student', foreignKey: 'studentId' });
  Mark.belongsTo(models.User, { as: 'instructor', foreignKey: 'teacherId' });
  Mark.belongsTo(models.Course, { as: 'course', foreignKey: 'courseId' });
};

module.exports = Mark;