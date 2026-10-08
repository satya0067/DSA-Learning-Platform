const { quizQuestionsPool } = require('./quizQuestionsPool');

const standardQuizzes = [
  {
    title: 'DSA Fundamentals Trial',
    topic: 'general',
    difficulty: 'medium',
    questions: [
      ...quizQuestionsPool.filter(q => q.topic === 'general'),
      quizQuestionsPool.find(q => q.topic === 'arrays'),
      quizQuestionsPool.find(q => q.topic === 'linked-lists'),
      quizQuestionsPool.find(q => q.topic === 'stacks-queues'),
      quizQuestionsPool.find(q => q.topic === 'trees'),
      quizQuestionsPool.find(q => q.topic === 'graphs'),
      quizQuestionsPool.find(q => q.topic === 'sorting')
    ].filter(Boolean)
  },
  {
    title: 'Arrays Mastery Trial',
    topic: 'arrays',
    difficulty: 'medium',
    questions: quizQuestionsPool.filter(q => q.topic === 'arrays')
  },
  {
    title: 'Linked Lists Mastery Trial',
    topic: 'linked-lists',
    difficulty: 'medium',
    questions: quizQuestionsPool.filter(q => q.topic === 'linked-lists')
  },
  {
    title: 'Stacks & Queues Mastery Trial',
    topic: 'stacks-queues',
    difficulty: 'medium',
    questions: quizQuestionsPool.filter(q => q.topic === 'stacks-queues')
  },
  {
    title: 'Trees & BST Mastery Trial',
    topic: 'trees',
    difficulty: 'medium',
    questions: quizQuestionsPool.filter(q => q.topic === 'trees')
  },
  {
    title: 'Graphs & Traversals Mastery Trial',
    topic: 'graphs',
    difficulty: 'medium',
    questions: quizQuestionsPool.filter(q => q.topic === 'graphs')
  },
  {
    title: 'Sorting Algorithms Mastery Trial',
    topic: 'sorting',
    difficulty: 'medium',
    questions: quizQuestionsPool.filter(q => q.topic === 'sorting')
  }
];

module.exports = { standardQuizzes };
