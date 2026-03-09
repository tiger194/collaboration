const Course = require('../models/Course');
const User = require('../models/User');
const Mark = require('../models/Mark');
const CourseStudent = require('../models/CourseStudent');

// Teacher: Create a course
exports.createCourse = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const teacherId = req.user.id;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }

    const course = await Course.create({
      name,
      code,
      description,
      teacherId,
    });

    res.json({ message: 'Course created successfully', course });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
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

// Get courses taught by a teacher
exports.getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const courses = await Course.findAll({
      where: { teacherId },
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

// Enroll students in a course (by teacher)
exports.enrollStudents = async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;
    const teacherId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacherId !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    for (const studentId of studentIds) {
      await CourseStudent.findOrCreate({
        where: { studentId, courseId },
      });
    }

    res.json({ message: 'Students enrolled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add marks
exports.addMarks = async (req, res) => {
  try {
    const { studentId, courseId, score } = req.body;
    const teacherId = req.user.id;

    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers can add marks' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacherId !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only add marks for your courses' });
    }

    const mark = await Mark.create({
      studentId,
      courseId,
      score,
      teacherId,
    });

    res.json({ message: 'Mark added successfully', mark });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get marks for a course (teacher view)
exports.getCourseMarks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.teacherId !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const marks = await Mark.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json(marks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student's marks
exports.getStudentMarks = async (req, res) => {
  try {
    const studentId = req.user.id;

    const marks = await Mark.findAll({
      where: { studentId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'name', 'code'],
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    res.json(marks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
