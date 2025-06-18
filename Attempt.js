const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // should match your User model name
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [String],
  score: Number,
  total: Number,
  attemptedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attempt', AttemptSchema);
