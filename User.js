const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    defaultValue: 'student',
    allowNull: false,
  },
});

// Define associations after model definition
User.associate = (models) => {
  User.hasMany(models.Course, { as: 'courses', foreignKey: 'teacherId' });
  User.hasMany(models.Mark, { as: 'studentMarks', foreignKey: 'studentId' });
  User.hasMany(models.Mark, { as: 'teacherMarks', foreignKey: 'teacherId' });
  User.hasMany(models.CourseStudent, { as: 'enrollments', foreignKey: 'studentId' });
};

module.exports = User;