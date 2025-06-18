
const User = require('../models/User');

const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// @route   POST /api/quiz/create
// @desc    Create a new quiz
router.post('/create', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json({ msg: 'Quiz created successfully', quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/quiz/all
// @desc    Get all quizzes
router.get('/all', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/quiz/attempt/:quizId
// @desc    Attempt a quiz and get score
router.post('/attempt/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    const userAnswers = req.body.answers;

    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    let score = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      const isCorrect = question.correctAnswer === userAnswers[index];
      if (isCorrect) score++;
      results.push({
        question: question.questionText,
        yourAnswer: userAnswers[index],
        correctAnswer: question.correctAnswer,
        isCorrect
      });
    });

    const userId = req.userId || "64f12345678abcde12345678"; // Replace with actual user id

    const attempt = new Attempt({
      userId,
      quizId: req.params.quizId,
      answers: userAnswers,
      score,
      total: quiz.questions.length
    });

    await attempt.save();

    res.json({
      msg: "Attempt saved",
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      score,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/quiz/attempts
// @desc    Get all attempts by a user
router.get('/attempts', async (req, res) => {
  const userId = req.user?.id || "685242b0ed963d5fb0b119b2"; // Replace with actual user id if auth is implemented

  try {
    const attempts = await Attempt.find({ userId }).populate('quizId', 'title');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
// @route   GET /api/quiz/leaderboard/:quizId
// @desc    Get top scorers for a specific quiz
router.get('/leaderboard/:quizId', async (req, res) => {
  try {
    const topAttempts = await Attempt.find({ quizId: req.params.quizId })
      .sort({ score: -1 })
      .limit(5)
      .populate('userId', 'username');  // assumes username field exists in User

    res.status(200).json(topAttempts);
  } catch (err) {
    console.error('Leaderboard Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
