const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' },
    allowNull: false,
  },
});

// Set up associations
Course.associate = (models) => {
  Course.belongsTo(models.User, { as: 'teacher', foreignKey: 'teacherId' });
  Course.hasMany(models.CourseStudent, { as: 'students', foreignKey: 'courseId' });
  Course.hasMany(models.Mark, { as: 'marks', foreignKey: 'courseId' });
};

module.exports = Course;
