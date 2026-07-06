const http = require('http');

function request(url, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== Testing Backend Server endpoints on port 3000 ===");
  try {
    const pingRes = await request('http://localhost:3000/api/ping');
    console.log("PING status:", pingRes.statusCode, "body:", pingRes.body);

    const quizRes = await request('http://localhost:3000/api/quiz');
    console.log("GET /api/quiz status:", quizRes.statusCode);
    let staticQuizId = null;
    if (quizRes.statusCode === 200) {
      console.log("Quizzes found:", quizRes.body.length);
      if (quizRes.body.length > 0) {
        staticQuizId = quizRes.body[0]._id;
        console.log("First quiz ID:", staticQuizId);
        console.log("First quiz title:", quizRes.body[0].title);
        console.log("First quiz questions length:", quizRes.body[0].questions?.length);
      }
    }

    const randomQuizRes = await request('http://localhost:3000/api/quiz/random?topic=arrays&difficulty=easy&limit=5');
    console.log("GET /api/quiz/random status:", randomQuizRes.statusCode);
    const randomQuiz = randomQuizRes.body;
    console.log("Random quiz ID:", randomQuiz._id);
    console.log("Random quiz questions length:", randomQuiz.questions?.length);

    if (randomQuiz && randomQuiz._id && randomQuiz.questions) {
      // Let's submit answers
      const answers = randomQuiz.questions.map((q, idx) => {
        return {
          questionId: q._id,
          answer: 0 // Select first option for all
        };
      });

      console.log("Submitting answers for random quiz...");
      const submitRes = await request(
        `http://localhost:3000/api/quiz/submit/${randomQuiz._id}`,
        'POST',
        { answers }
      );
      console.log("Submit status:", submitRes.statusCode);
      console.log("Submit response:", JSON.stringify(submitRes.body, null, 2));
    }

  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

runTests();
