const Question = require('./models/Question');
const Quiz = require('./models/Quiz');
const connectDB = require('./config/db');

const questionsPool = [
  // ===== ARRAYS (8 questions) =====
  {
    question: "What is the time complexity of accessing an element by index in a standard array?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctAnswer: 0,
    topic: "arrays",
    difficulty: "easy",
    hint: "Think about direct memory offsets. Arrays are stored in contiguous blocks.",
    explanation: "Because arrays are stored contiguously in memory, the address of any element can be computed directly using the formula: Base_Address + Index * Element_Size. This takes constant time, O(1)."
  },
  {
    question: "How are elements stored in a standard static array?",
    options: ["Scattered randomly across memory", "Contiguously in memory", "Linked via next pointers", "In a tree-like hierarchy"],
    correctAnswer: 1,
    topic: "arrays",
    difficulty: "easy",
    hint: "Consider how indexing works so quickly.",
    explanation: "Static arrays allocate a single contiguous block of memory to store elements back-to-back, allowing O(1) random access."
  },
  {
    question: "What is the time complexity of reversing an array of size n in place?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    topic: "arrays",
    difficulty: "easy",
    hint: "You need to swap elements from both ends moving towards the center.",
    explanation: "Reversing an array in place requires iterating through the first half of the array and swapping elements with the corresponding element in the second half. This requires n/2 operations, which is O(n)."
  },
  {
    question: "Which of the following describes the two-pointer technique in arrays?",
    options: ["Having two variables pointing to the array's memory address", "Using two indexes to scan an array, often from opposite ends or at different speeds", "Using nested loops to compare every pair of elements", "Creating a copy of the array and searching in both"],
    correctAnswer: 1,
    topic: "arrays",
    difficulty: "medium",
    hint: "Think about solving problems like checking a palindrome or finding a target sum.",
    explanation: "The two-pointer technique uses two pointer variables (frequently starting at the beginning and end, or fast and slow pointers) to traverse the array, optimizing the search space and avoiding O(n^2) loops."
  },
  {
    question: "In a dynamic array (like JavaScript Array or Java ArrayList), what is the amortized time complexity of an append (push) operation?",
    options: ["O(1)", "O(n)", "O(log n)", "O(1) average, but O(n) worst-case when resizing occurs"],
    correctAnswer: 3,
    topic: "arrays",
    difficulty: "medium",
    hint: "Most appends are fast, but occasionally the array must copy all elements to a new, larger location.",
    explanation: "Dynamic arrays double their capacity when full. While copying elements takes O(n) time, it happens infrequently (every n appends). Thus, the average (amortized) cost per append is constant, O(1)."
  },
  {
    question: "What is the time complexity of finding the maximum subarray sum using Kadane's algorithm?",
    options: ["O(1)", "O(n)", "O(n log n)", "O(n^2)"],
    correctAnswer: 1,
    topic: "arrays",
    difficulty: "hard",
    hint: "Kadane's algorithm keeps track of the maximum sum ending at each position.",
    explanation: "Kadane's algorithm scans the array exactly once, keeping track of the local maximum subarray ending at the current element. It takes linear time O(n) and O(1) auxiliary space."
  },
  {
    question: "Which algorithm can find the single non-duplicate element in a sorted array where every other element appears twice in O(log n) time?",
    options: ["Linear Search", "Binary Search", "Two-pointer Search", "Hash Map lookup"],
    correctAnswer: 1,
    topic: "arrays",
    difficulty: "hard",
    hint: "Since the array is sorted, look for patterns in the even-odd index alignments.",
    explanation: "Using binary search, we can inspect middle elements and determine which side contains the single element by checking if duplicates align on even/odd indexes. This runs in O(log n) time."
  },
  {
    question: "What is the worst-case space complexity of finding duplicates in an array of size n using a hash set?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    correctAnswer: 2,
    topic: "arrays",
    difficulty: "medium",
    hint: "What if all elements in the array are unique?",
    explanation: "In the worst case, all elements are unique, meaning we store all n elements in the hash set, yielding a space complexity of O(n)."
  },

  // ===== LINKED LISTS (9 questions) =====
  {
    question: "What is the time complexity of inserting a new node at the head of a singly linked list?",
    options: ["O(1)", "O(n)", "O(log n)", "O(1) only if list is empty, otherwise O(n)"],
    correctAnswer: 0,
    topic: "linked-lists",
    difficulty: "easy",
    hint: "No traversal is needed. You only adjust pointer references.",
    explanation: "Inserting at the head requires creating a node, pointing its next pointer to the current head, and updating the head pointer. This takes constant time, O(1)."
  },
  {
    question: "What does each node in a singly linked list store?",
    options: ["Data and array index", "Data and pointer/reference to the next node", "Pointers to left and right child nodes", "Only the data value"],
    correctAnswer: 1,
    topic: "linked-lists",
    difficulty: "easy",
    hint: "Singly linked lists flow in one direction.",
    explanation: "A singly linked list node contains a data payload and a pointer/reference field containing the memory address of the next node in the list."
  },
  {
    question: "What is the space complexity of reversing a singly linked list iteratively in place?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctAnswer: 0,
    topic: "linked-lists",
    difficulty: "medium",
    hint: "Do you need to allocate new nodes or just change pointer directions?",
    explanation: "Iterative in-place reversal only requires a few temp pointer variables (prev, curr, next) to adjust links, resulting in constant auxiliary space, O(1)."
  },
  {
    question: "Which algorithm is commonly used to detect a cycle in a linked list?",
    options: ["Dijkstra's Algorithm", "Binary Search", "Floyd's Cycle-Finding (Tortoise and Hare)", "Kruskal's Algorithm"],
    correctAnswer: 2,
    topic: "linked-lists",
    difficulty: "medium",
    hint: "Think about two runners on a circular track at different speeds.",
    explanation: "Floyd's cycle detection algorithm uses two pointers moving at different speeds (slow moves 1 step, fast moves 2 steps). If there is a cycle, they will eventually meet."
  },
  {
    question: "In a doubly linked list, what is the time complexity of deleting a node if a pointer directly referencing that node is provided?",
    options: ["O(1)", "O(n)", "O(log n)", "O(1) if head, otherwise O(n)"],
    correctAnswer: 0,
    topic: "linked-lists",
    difficulty: "hard",
    hint: "A doubly linked list node has pointers to both the previous and next nodes.",
    explanation: "Since the node has references to both its prev and next nodes, we can link prev.next to next and next.prev to prev directly. No list traversal is needed, so it is O(1)."
  },
  {
    question: "What is the worst-case time complexity of retrieving the kth element from the end of a singly linked list of length n in a single pass?",
    options: ["O(1)", "O(k)", "O(n)", "O(n^2)"],
    correctAnswer: 2,
    topic: "linked-lists",
    difficulty: "hard",
    hint: "You can use two pointers separated by k steps.",
    explanation: "Using two pointers (one k steps ahead of the other), you traverse the list. When the fast pointer hits the end, the slow pointer points to the target. This scans the list once, taking O(n) time."
  },
  {
    question: "What is the main disadvantage of a linked list compared to an array?",
    options: ["Dynamic size adjustment is slow", "Insertion/Deletion at the head is slow", "No random access (accessing index i requires O(n) traversal)", "Requires contiguous memory allocation"],
    correctAnswer: 2,
    topic: "linked-lists",
    difficulty: "easy",
    hint: "How do you access the 50th element in each?",
    explanation: "Unlike arrays which support O(1) direct offset index access, linked lists must be traversed node by node starting from the head, taking O(n) time to access arbitrary indexes."
  },
  {
    question: "What is the time complexity of merging two sorted linked lists of sizes m and n into a single sorted list?",
    options: ["O(1)", "O(log(m+n))", "O(m + n)", "O(m * n)"],
    correctAnswer: 2,
    topic: "linked-lists",
    difficulty: "medium",
    hint: "You compare the heads of both lists and advance the pointer of the smaller element.",
    explanation: "We traverse both lists simultaneously, linking nodes in order. We visit each node exactly once, yielding a time complexity of O(m + n)."
  },
  {
    question: "Which of the following statements about skip lists is true?",
    options: ["They are identical to singly linked lists in performance", "They use multiple layers of linked lists to achieve O(log n) average search time", "They do not support sorting", "They use trees instead of nodes"],
    correctAnswer: 1,
    topic: "linked-lists",
    difficulty: "hard",
    hint: "Think about fast-forward lanes on a highway.",
    explanation: "Skip lists build multiple levels of lists where higher levels act as 'express lanes' skipping many nodes, enabling average search, insertion, and deletion in O(log n) time."
  },

  // ===== STACKS & QUEUES (9 questions) =====
  {
    question: "Which principle does a Stack data structure follow?",
    options: ["LIFO (Last In, First Out)", "FIFO (First In, First Out)", "LILO (Last In, Last Out)", "Random Access"],
    correctAnswer: 0,
    topic: "stacks-queues",
    difficulty: "easy",
    hint: "Think of a stack of dinner plates.",
    explanation: "A stack is a Last-In-First-Out (LIFO) structure; the item pushed most recently is the first one to be popped."
  },
  {
    question: "Which principle does a standard Queue data structure follow?",
    options: ["LIFO (Last In, First Out)", "FIFO (First In, First Out)", "LILO (Last In, Last Out)", "Priority Access"],
    correctAnswer: 1,
    topic: "stacks-queues",
    difficulty: "easy",
    hint: "Think of a queue (line) of people waiting at a ticketing counter.",
    explanation: "A standard queue operates on a First-In-First-Out (FIFO) basis; the first element added is the first one removed."
  },
  {
    question: "What is the time complexity of checking if a stack is empty?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctAnswer: 0,
    topic: "stacks-queues",
    difficulty: "easy",
    hint: "Does it require checking every element or just checking a size counter / top pointer?",
    explanation: "Checking if a stack is empty only requires verifying if the size is 0 or if the top pointer is null, which takes constant O(1) time."
  },
  {
    question: "How can a queue be implemented using Stacks?",
    options: ["By using a single stack and recursive calls only", "By using two stacks: one for enqueueing and one for dequeueing", "It is mathematically impossible to implement a queue with stacks", "By using a stack and a linked list in combination"],
    correctAnswer: 1,
    topic: "stacks-queues",
    difficulty: "medium",
    hint: "Think about reversing the order of elements by shifting them from one stack to another.",
    explanation: "To implement a queue, you can push elements onto Stack 1 (for enqueue). For dequeue, if Stack 2 is empty, pop all elements from Stack 1 and push them onto Stack 2, then pop from Stack 2."
  },
  {
    question: "What is the time complexity of pushing an element onto a stack implemented with a singly linked list (with head as top)?",
    options: ["O(1)", "O(n)", "O(log n)", "O(1) average, but O(n) worst-case"],
    correctAnswer: 0,
    topic: "stacks-queues",
    difficulty: "medium",
    hint: "Inserting at the head of a linked list requires no traversal.",
    explanation: "Pushing onto a linked-list stack is equivalent to inserting a node at the head of the list, which requires pointer updates in constant time, O(1)."
  },
  {
    question: "Which of the following applications is best suited for a Queue data structure?",
    options: ["Undo/Redo operations in a text editor", "Depth-First Search recursion tracking", "Breadth-First Search vertex scheduling", "Parsing arithmetic expressions"],
    correctAnswer: 2,
    topic: "stacks-queues",
    explanation: "BFS explores nodes level by level, requiring vertices to be processed in the exact order they were discovered (FIFO). A Queue is ideal here. Stacks are used for DFS, undo operations, and expression parsing.",
    difficulty: "medium",
    hint: "Think of FIFO vs LIFO applications."
  },
  {
    question: "What is a monotonic stack?",
    options: ["A stack that only allows unique values", "A stack whose elements are always sorted in increasing or decreasing order", "A stack that does not allow pop operations", "A stack that uses random access arrays internally"],
    correctAnswer: 1,
    topic: "stacks-queues",
    difficulty: "hard",
    hint: "It helps solve problems like 'Next Greater Element'.",
    explanation: "A monotonic stack maintains its elements in sorted order (either strictly increasing or decreasing) by popping elements that break the order before pushing a new one."
  },
  {
    question: "In a circular queue implemented using an array of size C, how is the queue full condition defined (using front and rear indexes)?",
    options: ["rear == front", "(rear + 1) % C == front", "rear == C - 1", "front == 0"],
    correctAnswer: 1,
    topic: "stacks-queues",
    difficulty: "hard",
    hint: "The next slot of rear points back to front.",
    explanation: "In a circular queue, the next index after rear wraps around. If `(rear + 1) % Capacity == front`, the queue is full (leaving one empty slot to distinguish it from the empty state)."
  },
  {
    question: "Which data structure is ideal for implementing a cache with Least Recently Used (LRU) eviction policy?",
    options: ["Array and Stack", "Hash Map and Doubly Linked List", "Queue and Binary Heap", "Binary Search Tree and Queue"],
    correctAnswer: 1,
    topic: "stacks-queues",
    difficulty: "hard",
    hint: "You need O(1) lookup and O(1) removal/re-ordering.",
    explanation: "An LRU cache uses a Hash Map for O(1) lookup of cache keys, and a Doubly Linked List to maintain the usage order, allowing nodes to be moved to the head or evicted from the tail in O(1) time."
  },

  // ===== TREES (8 questions) =====
  {
    question: "How many children can a node in a binary tree have at most?",
    options: ["1", "2", "Unlimited", "Based on tree depth"],
    correctAnswer: 1,
    topic: "trees",
    difficulty: "easy",
    hint: "'Bi' stands for two.",
    explanation: "By definition, a binary tree node can have at most two child nodes, typically called the left child and the right child."
  },
  {
    question: "Which binary tree traversal visits the left subtree, then the root node, and finally the right subtree?",
    options: ["Pre-order traversal", "In-order traversal", "Post-order traversal", "Level-order traversal"],
    correctAnswer: 1,
    topic: "trees",
    difficulty: "easy",
    hint: "The root node is visited 'in' between the subtrees.",
    explanation: "In-order traversal visits the left child, then the current node, then the right child. For a Binary Search Tree (BST), this visits elements in sorted ascending order."
  },
  {
    question: "What is the maximum number of nodes in a binary tree of height h (where height of root is 1)?",
    options: ["2^h", "2^h - 1", "2^(h-1)", "h^2"],
    correctAnswer: 1,
    topic: "trees",
    difficulty: "medium",
    hint: "Think of a perfect binary tree of height 1 (1 node), height 2 (3 nodes), height 3 (7 nodes).",
    explanation: "A perfect binary tree of height h contains 2^0 + 2^1 + ... + 2^(h-1) nodes. Summing this geometric series gives 2^h - 1 nodes."
  },
  {
    question: "In a Binary Search Tree (BST), which of the following is true?",
    options: ["A node's left child must be greater than the node", "A node's left child must be smaller than the node, and the right child must be greater", "All leaf nodes must be at the same depth", "Every node must have exactly two children"],
    correctAnswer: 1,
    topic: "trees",
    difficulty: "easy",
    hint: "Think about the search property that makes trees fast.",
    explanation: "The BST property dictates that for any node, all keys in its left subtree are less than the node's key, and all keys in its right subtree are greater."
  },
  {
    question: "What is the worst-case time complexity of searching for a value in an unbalanced Binary Search Tree of n nodes?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    topic: "trees",
    difficulty: "medium",
    hint: "Consider a skewed tree resembling a linked list.",
    explanation: "If a BST is unbalanced (e.g., elements inserted in sorted order), the tree degenerates into a single long chain (skewed tree). Searching then becomes linear O(n)."
  },
  {
    question: "Which of the following self-balancing binary search trees maintains a balance factor of at most 1 between left and right subtree heights?",
    options: ["Red-Black Tree", "AVL Tree", "B-Tree", "Splay Tree"],
    correctAnswer: 1,
    topic: "trees",
    difficulty: "hard",
    hint: "Named after Adelson-Velsky and Landis.",
    explanation: "An AVL tree is a self-balancing binary search tree where the height difference between the left and right subtrees (balance factor) of any node is at most 1."
  },
  {
    question: "In a binary heap (implemented as a max-heap), where is the largest element always located?",
    options: ["At a leaf node", "At the root node", "At the bottom-rightmost node", "It depends on insert order"],
    correctAnswer: 1,
    topic: "trees",
    difficulty: "medium",
    hint: "The max-heap property requires parents to be larger than children.",
    explanation: "In a max-heap, the key of a node is always greater than or equal to the keys of its children. Therefore, the absolute largest element is always at the root node."
  },
  {
    question: "Which tree traversal corresponds to a Breadth-First Search (BFS) on a tree?",
    options: ["Pre-order", "Post-order", "Level-order", "In-order"],
    correctAnswer: 2,
    topic: "trees",
    difficulty: "easy",
    hint: "Visiting nodes level by level.",
    explanation: "Level-order traversal visits nodes level by level, starting from the root (level 1), then all nodes at level 2, etc. This is identical to BFS."
  },

  // ===== GRAPHS (8 questions) =====
  {
    question: "What does BFS stand for in graph theory?",
    options: ["Best-First Search", "Binary-First Search", "Breadth-First Search", "Boundary-Free Search"],
    correctAnswer: 2,
    topic: "graphs",
    difficulty: "easy",
    hint: "Searching wide before going deep.",
    explanation: "BFS stands for Breadth-First Search, which explores nodes layer-by-layer starting from a selected source vertex."
  },
  {
    question: "Which representation of a graph uses a 2D array of size V x V (where V is the number of vertices)?",
    options: ["Adjacency List", "Adjacency Matrix", "Edge List", "Incidence List"],
    correctAnswer: 1,
    topic: "graphs",
    difficulty: "easy",
    hint: "Matrix means grid.",
    explanation: "An Adjacency Matrix uses a V x V grid of booleans or integers to denote whether an edge exists between vertex i and vertex j."
  },
  {
    question: "What is the time complexity of Breadth-First Search (BFS) using an adjacency list on a graph with V vertices and E edges?",
    options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
    correctAnswer: 2,
    topic: "graphs",
    difficulty: "medium",
    hint: "Every node and edge is examined.",
    explanation: "BFS visits each vertex once and traverses the adjacency list of each vertex. In total, all V vertices are enqueued/dequeued and all E edges are checked, giving O(V + E) time."
  },
  {
    question: "Which of these algorithms finds the shortest path in a graph with negative edge weights (provided there are no negative weight cycles)?",
    options: ["Dijkstra's Algorithm", "Prim's Algorithm", "Bellman-Ford Algorithm", "Kruskal's Algorithm"],
    correctAnswer: 2,
    topic: "graphs",
    difficulty: "hard",
    hint: "This algorithm relaxes all edges V-1 times.",
    explanation: "The Bellman-Ford algorithm can calculate single-source shortest paths in a graph containing negative edge weights. Dijkstra's algorithm fails in such cases because it is greedy."
  },
  {
    question: "What is the maximum number of edges in a simple undirected graph with V vertices?",
    options: ["V", "V(V - 1)", "V(V - 1) / 2", "2^V"],
    correctAnswer: 2,
    topic: "graphs",
    difficulty: "hard",
    hint: "Each vertex can connect to all other vertices. Handshaking lemma.",
    explanation: "In a simple undirected graph, each of the V vertices can connect to V-1 other vertices. Since edges are undirected, we divide by 2: V(V-1)/2 edges."
  },
  {
    question: "Which data structure is typically used to implement topological sort on a Directed Acyclic Graph (DAG) using Kahn's algorithm?",
    options: ["Stack", "Queue (managing vertices with in-degree 0)", "Binary Heap", "Hash Set"],
    correctAnswer: 1,
    topic: "graphs",
    difficulty: "hard",
    hint: "You keep track of vertices that have no dependencies.",
    explanation: "Kahn's algorithm calculates in-degrees for all vertices, puts vertices with in-degree 0 into a Queue, and repeatedly pops from the queue, decrements neighbors, and pushes new in-degree 0 vertices."
  },
  {
    question: "What is the main advantage of an Adjacency List over an Adjacency Matrix representation?",
    options: ["O(1) time to check if an edge exists between two vertices", "More space-efficient for sparse graphs", "Easier to implement in C++", "Faster for dense graphs"],
    correctAnswer: 1,
    topic: "graphs",
    difficulty: "medium",
    hint: "Think about storing V^2 entries vs only storing existing links.",
    explanation: "Adjacency lists take O(V + E) space, whereas adjacency matrices require O(V^2) space. For sparse graphs (where E << V^2), lists are far more space-efficient."
  },
  {
    question: "Which algorithm finds the Minimum Spanning Tree (MST) by sorting edges and greedily adding them without creating cycles?",
    options: ["Prim's Algorithm", "Kruskal's Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm"],
    correctAnswer: 1,
    topic: "graphs",
    difficulty: "medium",
    hint: "It uses a Union-Find (Disjoint Set) data structure.",
    explanation: "Kruskal's algorithm sorts all graph edges by weight and adds them one-by-one, using Union-Find to verify that adding the edge doesn't create a cycle."
  },

  // ===== SORTING (8 questions) =====
  {
    question: "What is the worst-case time complexity of Bubble Sort?",
    options: ["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"],
    correctAnswer: 2,
    topic: "sorting",
    difficulty: "easy",
    hint: "Think of nested loops comparing adjacent elements.",
    explanation: "Bubble Sort uses nested loops to repeatedly swap adjacent out-of-order elements. In the worst case (reverse sorted list), it makes n*(n-1)/2 comparisons, resulting in O(n^2) time."
  },
  {
    question: "Which of the following sorting algorithms is stable and guarantees O(n log n) time complexity in all cases (best, average, and worst)?",
    options: ["Quicksort", "Merge Sort", "Heap Sort", "Selection Sort"],
    correctAnswer: 1,
    topic: "sorting",
    difficulty: "easy",
    hint: "It uses divide-and-conquer and allocates auxiliary arrays during merge.",
    explanation: "Merge Sort guarantees O(n log n) time in all cases and preserves the relative order of equal elements (stable). Heap Sort is unstable, and Quicksort has a worst-case of O(n^2)."
  },
  {
    question: "What is the average-case time complexity of Quicksort?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(n^2)"],
    correctAnswer: 2,
    topic: "sorting",
    difficulty: "medium",
    hint: "Think about dividing the array in half on average at each pivot step.",
    explanation: "On average, Quicksort's partitioning divides the array roughly in half, leading to a recursion tree depth of log n, with O(n) work per level. This yields O(n log n) time."
  },
  {
    question: "What is the auxiliary space complexity of Merge Sort when sorting an array of size n?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
    correctAnswer: 2,
    topic: "sorting",
    difficulty: "medium",
    hint: "Merging requires copying elements to a temporary array.",
    explanation: "Merge Sort copies elements into a temporary workspace array during the merge step, leading to an auxiliary space complexity of O(n)."
  },
  {
    question: "In which scenario does Quicksort exhibit its worst-case time complexity of O(n^2) (assuming a naive pivot selection like the first or last element)?",
    options: ["When the array is already sorted or reverse sorted", "When all elements in the array are unique", "When the array size is a power of 2", "When the array contains random values"],
    correctAnswer: 0,
    topic: "sorting",
    difficulty: "hard",
    hint: "Consider how unbalanced the partitions become when selecting the edge element as pivot in a sorted list.",
    explanation: "If the array is already sorted and we naive-pivot on the first/last element, one partition gets 0 elements and the other gets n-1 elements. The recursion tree depth becomes n, causing O(n^2) total comparisons."
  },
  {
    question: "Which of the following sorting algorithms is non-comparison based?",
    options: ["Heap Sort", "Merge Sort", "Radix Sort", "Shell Sort"],
    correctAnswer: 2,
    topic: "sorting",
    difficulty: "hard",
    hint: "It sorts integers or strings using buckets based on digit positions.",
    explanation: "Radix Sort sorts elements digit-by-digit (or character-by-character) using bucket sorting (like Counting Sort) as a subroutine. It avoids comparing element values directly."
  },
  {
    question: "Which sorting algorithm performs the absolute minimum number of memory writes, making it ideal if writing to memory is extremely expensive?",
    options: ["Insertion Sort", "Selection Sort", "Merge Sort", "Bubble Sort"],
    correctAnswer: 1,
    topic: "sorting",
    difficulty: "hard",
    hint: "It only does at most O(n) swaps to put elements into their final positions.",
    explanation: "Selection Sort finds the minimum element and swaps it into its correct position. It performs at most O(n) swaps, which is the minimum among comparison sorts."
  },
  {
    question: "What is the best-case time complexity of Insertion Sort (e.g. when the input array is already sorted)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 2,
    topic: "sorting",
    difficulty: "easy",
    hint: "Each element only needs to be checked against its predecessor.",
    explanation: "For an already sorted array, Insertion Sort only compares each element with the one before it once and makes no swaps, running in linear O(n) time."
  }
];

const seed = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing question pool and quizzes...");
    await Question.deleteMany();
    await Quiz.deleteMany();

    console.log(`📥 Seeding ${questionsPool.length} questions into pool...`);
    const insertedQuestions = await Question.insertMany(questionsPool);
    console.log("✅ Question pool seeded successfully!");

    // Create a default fallback quiz with 10 questions
    const defaultQuestions = insertedQuestions.slice(0, 10).map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      hint: q.hint,
      explanation: q.explanation
    }));

    const defaultQuiz = new Quiz({
      title: "DSA Fundamentals Quiz",
      topic: "general",
      difficulty: "medium",
      questions: defaultQuestions,
      // For default static quiz, remove the expiresAt field so it is persistent!
      expiresAt: undefined
    });

    // Save with expiresAt undefined so MongoDB doesn't delete it
    // (expiresAt must be omitted or null for the TTL index to skip it)
    defaultQuiz.expiresAt = null;
    await defaultQuiz.save();
    console.log("✅ Default static quiz created!");

    console.log("🎉 Seeding process complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();