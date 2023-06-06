const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionModel = require('./question.js');

const testSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  subjectName: {
    type: String,
  },
  testName: {
    type: String,
  },
  date: {
    type: Date,
  },
  semester: {
    type: String,
  },
  group: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  pdfName: {
    type: String,
    required: true,
  },
  questions: [QuestionModel.schema],
});

const TestModel = mongoose.model('Test', testSchema);

module.exports = TestModel;
