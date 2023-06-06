const mongoose = require('mongoose');
const { Schema } = mongoose;

const gradeSchema = new Schema({
  systemName: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
  },
  grades: [
    {
      from: {
        type: Number,
        required: true,
      },
      to: {
        type: Number,
        required: true,
      },
    },
  ],
});

const GradeModel = mongoose.model('Grade', gradeSchema);

module.exports = GradeModel;
