const Mark = require('../models/Mark');
const User = require('../models/User');
const Course = require('../models/Course');

exports.addMark = async (req, res) => {
  const { studentId, courseId, score } = req.body;
  
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only teachers can add marks' });
  }
  
  try {
    const student = await User.findByPk(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(400).json({ message: 'Invalid course' });
    }

    // Check if teacher owns this course (unless admin)
    if (req.user.role === 'teacher' && course.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only add marks for your courses' });
    }

    const mark = await Mark.create({ 
      studentId, 
      courseId,
      score, 
      teacherId: req.user.id 
    });
    
    res.json({ message: 'Mark added successfully', mark });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMyMarks = async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can view their marks' });
  }

  try {
    const marks = await Mark.findAll({
      where: { studentId: req.user.id },
      include: [
        { 
          association: 'instructor', 
          attributes: ['id', 'name', 'email'] 
        },
        { 
          association: 'course', 
          attributes: ['id', 'name', 'code'] 
        }
      ],
    });
    res.json(marks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};