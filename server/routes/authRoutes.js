const express = require('express');
const router = express.Router();
const cors = require('cors');
const {
  test,
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  addQuestionToDatabase,
  searchQuestions,
  getQuestionsForUser,
  createTest,
  getTestsForUser,
  deactivateTest,
  activateTest,
  saveGrades,
  getGradesForUser,
  deactivateGrade,
  activateGrade,
  checkQuestionExists,
  checkGradeSystemExists,
  updateGradeSystem,
  updateTest,
} = require('../controllers/authControllers');

// middleware
router.use(
  cors({
    credentials: true,
    origin: 'https://test-maker.netlify.app/',
  })
);

router.get('/', test);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.get('/logout', logoutUser);
router.post('/addQuestion', addQuestionToDatabase);
router.get('/searchQuestion/:searchInput/:email', searchQuestions);
router.get('/searchQuestions/:userEmail', getQuestionsForUser);
router.post('/createTest', createTest);
router.get('/tests/:userEmail', getTestsForUser);
router.put('/tests/:testId/deactivate', deactivateTest);
router.put('/tests/:testId/activate', activateTest);
router.post('/grades', saveGrades);
router.get('/grades/:userEmail', getGradesForUser);
router.put('/grades/:gradeId/deactivate', deactivateGrade);
router.put('/grades/:gradeId/activate', activateGrade);
router.get('/questionExists/:userEmail/:questionName', checkQuestionExists);
router.get('/gradeExists/:userEmail/:name', checkGradeSystemExists);
router.put(`/grades/:id`, updateGradeSystem);
router.put(`/tests/:id`, updateTest);

module.exports = router;
