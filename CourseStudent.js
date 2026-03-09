const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');

const CourseStudent = sequelize.define('CourseStudent', {
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
});

// Set up associations
CourseStudent.associate = (models) => {
  CourseStudent.belongsTo(models.User, { as: 'student', foreignKey: 'studentId' });
  CourseStudent.belongsTo(models.Course, { as: 'course', foreignKey: 'courseId' });
};

module.exports = CourseStudent;
