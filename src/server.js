const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const db = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@school.com', password: 'admin123', role: 'admin' },
    { id: 2, name: 'Teacher One', email: 'teacher@school.com', password: 'teacher123', role: 'teacher' },
    { id: 3, name: 'Student One', email: 'student@school.com', password: 'student123', role: 'student' }
  ],
  courses: [
    { id: 1, name: 'Mathematics', teacherId: 2 },
    { id: 2, name: 'Science', teacherId: 2 }
  ],
  registrations: [
    { studentId: 3, courseId: 1 }
  ],
  marks: [
    { studentId: 3, courseId: 1, score: 88 }
  ],
  sessions: {}
};

function createToken() {
  return crypto.randomBytes(16).toString('hex');
}

function auth(req, res, next) {
  const token = req.header('x-auth-token');

  if (!token || !db.sessions[token]) {
    return res.status(401).json({ message: 'Unauthorized. Please login first.' });
  }

  req.user = db.sessions[token];
  return next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: you do not have access.' });
    }

    return next();
  };
}

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the School System API',
    demoUsers: {
      admin: { email: 'admin@school.com', password: 'admin123' },
      teacher: { email: 'teacher@school.com', password: 'teacher123' },
      student: { email: 'student@school.com', password: 'student123' }
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((item) => item.email === email && item.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = createToken();
  db.sessions[token] = { id: user.id, role: user.role, name: user.name };

  return res.json({
    message: 'Login successful',
    token,
    role: user.role,
    name: user.name
  });
});

app.get('/admin/users', auth, allowRoles('admin'), (req, res) => {
  const usersWithoutPasswords = db.users.map(({ password, ...user }) => user);
  return res.json(usersWithoutPasswords);
});

app.post('/admin/courses', auth, allowRoles('admin'), (req, res) => {
  const { name, teacherId } = req.body;

  if (!name || !teacherId) {
    return res.status(400).json({ message: 'name and teacherId are required.' });
  }

  const teacher = db.users.find((u) => u.id === teacherId && u.role === 'teacher');
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found.' });
  }

  const newCourse = {
    id: db.courses.length + 1,
    name,
    teacherId
  };

  db.courses.push(newCourse);
  return res.status(201).json(newCourse);
});

app.post('/admin/registrations', auth, allowRoles('admin'), (req, res) => {
  const { studentId, courseId } = req.body;

  const student = db.users.find((u) => u.id === studentId && u.role === 'student');
  const course = db.courses.find((c) => c.id === courseId);

  if (!student || !course) {
    return res.status(404).json({ message: 'Student or course not found.' });
  }

  const alreadyRegistered = db.registrations.find(
    (r) => r.studentId === studentId && r.courseId === courseId
  );

  if (alreadyRegistered) {
    return res.status(409).json({ message: 'Student is already registered in this course.' });
  }

  const registration = { studentId, courseId };
  db.registrations.push(registration);

  return res.status(201).json(registration);
});

app.get('/teacher/courses', auth, allowRoles('teacher'), (req, res) => {
  const teacherCourses = db.courses.filter((course) => course.teacherId === req.user.id);
  return res.json(teacherCourses);
});

app.post('/teacher/marks', auth, allowRoles('teacher'), (req, res) => {
  const { studentId, courseId, score } = req.body;

  const teachesCourse = db.courses.find((c) => c.id === courseId && c.teacherId === req.user.id);
  if (!teachesCourse) {
    return res.status(403).json({ message: 'You can only add marks for your own courses.' });
  }

  const studentRegistered = db.registrations.find(
    (r) => r.studentId === studentId && r.courseId === courseId
  );

  if (!studentRegistered) {
    return res.status(400).json({ message: 'Student is not registered in this course.' });
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ message: 'score must be a number between 0 and 100.' });
  }

  const existingMark = db.marks.find((m) => m.studentId === studentId && m.courseId === courseId);

  if (existingMark) {
    existingMark.score = score;
    return res.json({ message: 'Mark updated.', mark: existingMark });
  }

  const newMark = { studentId, courseId, score };
  db.marks.push(newMark);

  return res.status(201).json({ message: 'Mark added.', mark: newMark });
});

app.get('/student/registrations', auth, allowRoles('student'), (req, res) => {
  const myRegistrations = db.registrations
    .filter((r) => r.studentId === req.user.id)
    .map((r) => {
      const course = db.courses.find((c) => c.id === r.courseId);
      return {
        courseId: r.courseId,
        courseName: course ? course.name : 'Unknown'
      };
    });

  return res.json(myRegistrations);
});

app.get('/student/marks', auth, allowRoles('student'), (req, res) => {
  const myMarks = db.marks
    .filter((m) => m.studentId === req.user.id)
    .map((m) => {
      const course = db.courses.find((c) => c.id === m.courseId);
      return {
        courseId: m.courseId,
        courseName: course ? course.name : 'Unknown',
        score: m.score
      };
    });

  return res.json(myMarks);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`School system API running on http://localhost:${PORT}`);
});
