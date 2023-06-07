const User = require('../models/user');
const QuestionModel = require('../models/question');
const TestModel = require('../models/test');
const GradeModel = require('../models/grade');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
  res.json('test działa');
};

//  Register endpoint
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if name was entered
    if (!name) {
      return res.json({
        error: 'Pole nazwa jest wymagane',
      });
    }
    // Check if password is good
    if (!password || password.length < 6) {
      return res.json({
        error:
          'Hasło jest wymagane oraz powinno składać się z conajmniej 6 znaków',
      });
    }
    // Check emial
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        error: 'Podany email już istnieje',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

// Login endpoint

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: 'Podany email nie istnieje',
      });
    }
    // Check password match
    const match = await comparePassword(password, user.password);
    if (match) {
      const token = jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        process.env.JWT_SECRET
      );

      res.json({ token });
    } else {
      res.json({
        error: 'Hasło nie pasuje',
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log('Token: ' + token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    if (!token) {
      return res.status(401).json({ error: 'Brak tokena autoryzacyjnego' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, id, name } = decoded;

    // Tutaj możesz pobrać dodatkowe informacje o użytkowniku z bazy danych, jeśli są potrzebne

    res.json({ email, id, name });
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token autoryzacyjny' });
  }
};

const logoutUser = (req, res) => {
  res.json({ message: 'Pomyślnie wylogowano' });
};

const addQuestionToDatabase = async (req, res) => {
  const { email, question, answers, points } = req.body;
  const newQuestion = new QuestionModel({ email, question, answers, points });
  try {
    await newQuestion.save();
    res.status(201).json({ message: 'Pytanie dodane do bazy danych.' });
  } catch (error) {
    res.status(500).json({
      message: 'Wystąpił błąd podczas dodawania pytania do bazy danych.',
    });
  }
};

const searchQuestions = async (req, res) => {
  const { searchInput, email } = req.params;
  try {
    const questions = await QuestionModel.find({
      $and: [
        {
          $or: [
            { question: { $regex: searchInput, $options: 'i' } },
            { question: { $eq: searchInput } },
          ],
        },
        { email: email },
      ],
    });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getQuestionsForUser = async (req, res) => {
  const { userEmail } = req.params;
  try {
    const questions = await QuestionModel.find({ email: userEmail });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createTest = async (req, res) => {
  const {
    selectedQuestions,
    testName,
    date,
    subjectName,
    group,
    semester,
    pdfName,
    email,
    active,
  } = req.body;

  try {
    const questions = await QuestionModel.find({
      _id: { $in: selectedQuestions },
    });

    const newTest = new TestModel({
      email,
      testName,
      date,
      subjectName,
      group,
      semester,
      questions,
      active,
      pdfName,
    });

    await newTest.save();
    res.status(201).json({ message: 'Test został utworzony pomyślnie.' });
  } catch (error) {
    console.error('Błąd podczas tworzenia testu:', error);
    res.status(500).json({ message: 'Wystąpił błąd podczas tworzenia testu.' });
  }
};

const getTestsForUser = async (req, res) => {
  const { userEmail } = req.params;
  try {
    const tests = await TestModel.find({ email: userEmail });
    res.status(200).json({ tests });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deactivateTest = async (req, res) => {
  const { testId } = req.params;
  const { active } = req.body;

  try {
    const updatedTest = await TestModel.findByIdAndUpdate(
      testId,
      { active },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Nie znaleziono testu' });
    }

    res
      .status(200)
      .json({ message: 'Status testu został zmieniony na dezaktywny' });
  } catch (error) {
    console.error('Błąd podczas deaktywacji testu:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const activateTest = async (req, res) => {
  const { testId } = req.params;
  const { active } = req.body;

  try {
    const updatedTest = await TestModel.findByIdAndUpdate(
      testId,
      { active },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: 'Nie znaleziono testu' });
    }

    res
      .status(200)
      .json({ message: 'Status testu został zmieniony na aktywny' });
  } catch (error) {
    console.error('Błąd podczas aktywacji testu:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const saveGrades = async (req, res) => {
  const { systemName, option, email, active, grades } = req.body;
  try {
    const newGrade = new GradeModel({
      systemName,
      option,
      email,
      active,
      grades,
    });
    await newGrade.save();
    res.status(200).json({ message: 'Dane zostały zapisane w bazie danych.' });
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas zapisywania danych.' });
  }
};

const getGradesForUser = async (req, res) => {
  const { userEmail } = req.params;
  try {
    const grades = await GradeModel.find({ email: userEmail });
    res.status(200).json({ grades });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deactivateGrade = async (req, res) => {
  const { gradeId } = req.params;
  const { active } = req.body;

  try {
    const updatedGrade = await GradeModel.findByIdAndUpdate(
      gradeId,
      { active },
      { new: true }
    );

    if (!updatedGrade) {
      return res.status(404).json({ message: 'Nie znaleziono skali ocen' });
    }

    res
      .status(200)
      .json({ message: 'Status testu został zmieniony na dezaktywny' });
  } catch (error) {
    console.error('Błąd podczas deaktywacji skali:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const activateGrade = async (req, res) => {
  const { gradeId } = req.params;
  const { active } = req.body;

  try {
    const updatedGrade = await GradeModel.findByIdAndUpdate(
      gradeId,
      { active },
      { new: true }
    );

    if (!updatedGrade) {
      return res.status(404).json({ message: 'Nie znaleziono skali ocen' });
    }

    res
      .status(200)
      .json({ message: 'Status testu został zmieniony na aktywny' });
  } catch (error) {
    console.error('Błąd podczas aktywacji skali:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const checkQuestionExists = async (req, res) => {
  const { userEmail, questionName } = req.params;

  try {
    const question = await QuestionModel.findOne({
      email: userEmail,
      question: questionName,
    });

    if (question) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const checkGradeSystemExists = async (req, res) => {
  const { userEmail, name } = req.params;

  try {
    const grade = await GradeModel.findOne({
      email: userEmail,
      systemName: name,
    });

    if (grade) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateGradeSystem = async (req, res) => {
  const { id } = req.params;
  const updatedGradeSystem = req.body;

  try {
    const gradeSystem = await GradeModel.findByIdAndUpdate(
      id,
      updatedGradeSystem,
      { new: true }
    );

    if (gradeSystem) {
      res.status(200).json({ message: 'Dane zostały zaktualizowane.' });
    } else {
      res.status(404).json({ message: 'Nie znaleziono skali ocen.' });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Wystąpił błąd podczas aktualizacji danych.' });
  }
};

const updateTest = async (req, res) => {
  const { id } = req.params;
  const updatedTest = req.body;

  try {
    const test = await TestModel.findByIdAndUpdate(id, updatedTest, {
      new: true,
    });

    if (test) {
      res.status(200).json({ message: 'Dane zostały zaktualizowane.' });
    } else {
      res.status(404).json({ message: 'Nie znaleziono testu.' });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Wystąpił błąd podczas aktualizacji danych.' });
  }
};

module.exports = {
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
};
