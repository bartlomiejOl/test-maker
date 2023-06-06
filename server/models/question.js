const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answers: {
    type: [String],
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

const QuestionModel = mongoose.model('Question', questionSchema);

module.exports = QuestionModel;
