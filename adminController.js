const User = require('../models/User');
const Course = require('../models/Course');
const Mark = require('../models/Mark');
const bcrypt = require('bcryptjs');

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all users' });
    }

    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Create a user (student or teacher)
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create users' });
    }

    const { name, email, password, role } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'student',
    });

    res.json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update user roles' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all courses
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all courses' });
    }

    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Delete course
exports.deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete courses' });
    }

    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await course.destroy();

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view dashboard' });
    }

    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalTeachers = await User.count({ where: { role: 'teacher' } });
    const totalCourses = await Course.count();

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalCourses,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get marks for a specific course
exports.getMarksByCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view marks' });
    }

    const { courseId } = req.params;

    const marks = await Mark.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['name', 'code']
        }
      ]
    });

    // Format the response to match what the frontend expects
    const formattedMarks = marks.map(mark => ({
      studentName: mark.student.name,
      studentEmail: mark.student.email,
      mark: mark.score,
      grade: calculateGrade(mark.score),
      createdAt: mark.createdAt
    }));

    res.json(formattedMarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate grade
function calculateGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
