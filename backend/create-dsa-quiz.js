const fetch = require('node-fetch');

async function createDSAQuiz() {
  const dsaQuiz = {
    title: 'DSA Fundamentals Quiz',
    questions: [
      {
        question: "What is the time complexity of accessing an element by index in an array?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctAnswer: 0
      },
      {
        question: "Which data structure follows the LIFO (Last In, First Out) principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: 1
      },
      {
        question: "What is the time complexity of inserting at the head of a singly linked list?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctAnswer: 0
      },
      {
        question: "Which sorting algorithm has the best average-case time complexity of O(n log n)?",
        options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"],
        correctAnswer: 2
      },
      {
        question: "In a binary search tree, where do you insert a new node?",
        options: ["Root always", "Left or right based on value", "End of level order", "Random position"],
        correctAnswer: 1
      },
      {
        question: "What is the space complexity of a recursive Fibonacci function without memoization?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctAnswer: 1
      },
      {
        question: "Which traversal visits root first, then left, then right?",
        options: ["In-order", "Pre-order", "Post-order", "Level-order"],
        correctAnswer: 1
      },
      {
        question: "Hash tables handle collisions using?",
        options: ["Only resizing", "Chaining or Open Addressing", "Binary search", "Sorting keys"],
        correctAnswer: 1
      },
      {
        question: "Breadth-First Search uses which data structure?",
        options: ["Stack", "Queue", "Priority Queue", "Heap"],
        correctAnswer: 1
      },
      {
        question: "Dijkstra's algorithm finds?",
        options: ["Shortest path", "Longest path", "Minimum spanning tree", "Topological sort"],
        correctAnswer: 0
      }
    ]
  };

  try {
    const response = await fetch('http://localhost:3000/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dsaQuiz)
    });
    const quiz = await response.json();
    console.log('DSA Quiz created successfully:', quiz._id);
  } catch (error) {
    console.error('Error creating DSA quiz:', error);
  }
}

createDSAQuiz();

