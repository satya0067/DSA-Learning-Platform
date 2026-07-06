// Quiz Logic
let currentQuizData = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizSubmitted = false;
let correctAnswers = [];
let questionExplanations = [];
let questionHints = [];

// Game state variables
let timerInterval = null;
let timeLeft = 30;
let timerEnabledGlobal = true;
let lifelineEnabledGlobal = true;
let lifelineUsedThisQuiz = false;

function shuffleArray(items) {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function prepareQuizForDisplay(quiz, shuffleQuestions = false) {
    if (!quiz || !Array.isArray(quiz.questions)) return quiz;
    return {
        ...quiz,
        questions: shuffleQuestions ? shuffleArray(quiz.questions) : quiz.questions
    };
}

function loadQuizzes() {
    Quiz.getQuizzes()
        .then(quizzes => {
            displayQuizzes(quizzes);
        })
        .catch(error => {
            console.error('Error loading quizzes:', error);
            const quizContainer = document.getElementById('quiz-container');
            if (quizContainer) {
                let errorMsg = '⚠️ Error loading quizzes!';
                
                if (!error.message) {
                    errorMsg += '<br>Could not connect to server.';
                    errorMsg += '<br><strong>Make sure:</strong>';
                    errorMsg += '<br>1. Backend server is running: npm start';
                    errorMsg += '<br>2. MongoDB is running';
                } else if (error.message.includes('HTTP')) {
                    errorMsg += '<br>' + error.message;
                    errorMsg += '<br><strong>Fix:</strong> Make sure backend server is running on port 3000';
                }
                
                quizContainer.innerHTML = `<div class="error-state" style="color: #e74c3c; padding: 1.5rem; background: #fadbd8; border-radius: 8px;">${errorMsg}<br><br><button onclick="location.reload()" class="btn-primary">Retry</button></div>`;
            }
        });
}

function displayQuizzes(quizzes) {
    const quizContainer = document.getElementById('quiz-container');
    if (!quizContainer) return;

    // Filter out generated dynamic quizzes from the static list
    // (Static quizzes won't have custom topic/difficulty markers or will be general)
    const staticQuizzes = quizzes.filter(q => q.expiresAt === undefined || q.expiresAt === null);
    
    quizContainer.innerHTML = '';
    
    if (staticQuizzes.length === 0) {
        return;
    }

    const header = document.createElement('h3');
    header.style.color = '#fff';
    header.style.marginBottom = '1.2rem';
    header.style.marginTop = '2rem';
    header.innerHTML = '<i class="fas fa-scroll"></i> Standard Trials Available';
    quizContainer.appendChild(header);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    grid.style.gap = '1.5rem';

    staticQuizzes.forEach(quiz => {
        const quizElement = document.createElement('div');
        quizElement.className = 'quiz-card';
        quizElement.style.margin = '0';
        quizElement.innerHTML = `
            <h3 style="color:#fff; margin-bottom: 0.5rem;">${quiz.title}</h3>
            <p style="color: var(--muted); margin-bottom: 1.2rem;">📚 ${quiz.questions.length} Questions</p>
            <button onclick="startQuiz('${quiz._id}')" class="btn-primary" style="padding: 0.6rem 1.2rem; font-size:0.9rem;">Start Quiz</button>
        `;
        grid.appendChild(quizElement);
    });

    quizContainer.appendChild(grid);
}

function getDSAQuiz() {
    const topic = document.querySelector('.topic-grid .config-chip.active')?.getAttribute('data-topic') || 'all';
    const difficulty = document.querySelector('[data-diff].active')?.getAttribute('data-diff') || 'all';
    const limit = document.querySelector('[data-len].active')?.getAttribute('data-len') || '10';
    
    timerEnabledGlobal = document.getElementById('timerToggle')?.checked ?? true;
    lifelineEnabledGlobal = document.getElementById('lifelineToggle')?.checked ?? true;
    
    // Reset state
    lifelineUsedThisQuiz = false;
    currentQuizData = null;
    currentQuestionIndex = 0;
    userAnswers = [];
    quizSubmitted = false;
    correctAnswers = [];
    questionExplanations = [];
    questionHints = [];

    // Show loading spinner
    const quizContainer = document.getElementById('quiz-container');
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'none';
    
    const quizProgressEl = document.getElementById('quiz-progress');
    if (quizProgressEl) quizProgressEl.style.display = 'none';

    if (quizContainer) {
        quizContainer.innerHTML = `
            <div class="quiz-card" style="text-align: center; padding: 4rem 2rem;">
                <div class="spinner" style="margin: 0 auto 1.5rem;"></div>
                <h3 style="color: #fff;">Drawing trials from the scroll pool...</h3>
                <p style="color: var(--muted); margin-top: 0.6rem;">Focusing concentration breath forms...</p>
            </div>
        `;
    }

    Quiz.getRandomQuiz({ topic, difficulty, limit })
        .then(quiz => {
            if (quiz && quiz.questions && quiz.questions.length > 0) {
                currentQuizData = quiz; // Backend already shuffled it!
                currentQuestionIndex = 0;
                userAnswers = new Array(currentQuizData.questions.length).fill(-1);
                displayQuestion();
            } else {
                alert('❌ No questions found matching this combination. Try expanding your filters.');
                if (startScreen) startScreen.style.display = 'block';
                if (quizContainer) quizContainer.innerHTML = '';
                loadQuizzes();
            }
        })
        .catch(error => {
            console.error('Error loading DSA quiz:', error);
            alert('❌ Connection failed or database error. Make sure the server is running.');
            if (startScreen) startScreen.style.display = 'block';
            if (quizContainer) quizContainer.innerHTML = '';
            loadQuizzes();
        });
}

function startQuiz(quizOrId) {
    // Reset state
    lifelineUsedThisQuiz = false;
    timerEnabledGlobal = false; // Disable timers for static standard quizzes
    lifelineEnabledGlobal = false; // Disable lifelines for static standard quizzes
    currentQuizData = null;
    currentQuestionIndex = 0;
    userAnswers = [];
    quizSubmitted = false;
    correctAnswers = [];
    questionExplanations = [];
    questionHints = [];

    const loadAction = (typeof quizOrId === 'object' && quizOrId !== null)
        ? Promise.resolve(quizOrId)
        : Quiz.getQuizById(quizOrId);

    const quizContainer = document.getElementById('quiz-container');
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'none';

    loadAction
        .then(quiz => {
            currentQuizData = prepareQuizForDisplay(quiz, true); // Shuffle questions
            currentQuestionIndex = 0;
            userAnswers = new Array(currentQuizData.questions.length).fill(-1);
            displayQuestion();
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
            alert('Error loading quiz. Check console for details.');
            if (startScreen) startScreen.style.display = 'block';
            loadQuizzes();
        });
}

function startQuestionTimer() {
    clearInterval(timerInterval);
    if (!timerEnabledGlobal || quizSubmitted || !currentQuizData) return;

    timeLeft = 30;
    updateTimerUI();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerUI() {
    const timerFill = document.getElementById('timer-fill');
    const timerSecs = document.getElementById('timer-secs');
    if (timerSecs) timerSecs.textContent = timeLeft + 's';
    if (timerFill) {
        const percent = (timeLeft / 30) * 100;
        timerFill.style.width = percent + '%';
        if (timeLeft <= 8) {
            timerFill.style.background = '#ff4d2e'; // Glowing red
            timerFill.style.boxShadow = '0 0 10px rgba(255, 77, 46, 0.8)';
        } else {
            timerFill.style.background = ''; // Follows CSS theme
            timerFill.style.boxShadow = '';
        }
    }
}

function handleTimeOut() {
    if (window.showToast) {
        showToast("⚠️ Breath timing missed! Moving on...");
    }
    
    // Auto advance or submit
    const totalQuestions = currentQuizData.questions.length;
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        submitQuizAnswers();
    }
}

function useLifeline() {
    if (lifelineUsedThisQuiz) return;
    
    const question = currentQuizData.questions[currentQuestionIndex];
    if (question && question.hint) {
        lifelineUsedThisQuiz = true;
        
        // Show in a beautiful visual toast/dialog
        alert(`💡 HASHIRA CONCEPTUAL HINT:\n\n"${question.hint}"`);
        
        // Disable the lifeline button
        const btn = document.getElementById('lifeline-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-lock"></i> Hint Invoked';
        }
        
        if (window.showToast) {
            showToast("🔮 Hashira assistance activated!");
        }
    }
}

function displayQuestion() {
    if (!currentQuizData) return;

    const startScreen = document.getElementById('start-screen');
    const quizProgress = document.getElementById('quiz-progress');
    const quizContainer = document.getElementById('quiz-container');

    if (startScreen) startScreen.style.display = 'none';
    if (quizProgress) quizProgress.style.display = 'flex';

    const question = currentQuizData.questions[currentQuestionIndex];
    const totalQuestions = currentQuizData.questions.length;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

    // Update progress bar
    document.getElementById('current-q').textContent = currentQuestionIndex + 1;
    document.getElementById('total-q').textContent = totalQuestions;
    document.getElementById('remaining').textContent = progressPercent + '% Done';
    document.getElementById('progress-fill').style.width = progressPercent + '%';

    // Clear container
    quizContainer.innerHTML = '';

    // Create question container
    const questionContainer = document.createElement('div');
    questionContainer.className = 'quiz-card';

    // Question header
    const questionHeader = document.createElement('div');
    questionHeader.className = 'question-header';
    questionHeader.style.display = 'flex';
    questionHeader.style.justifyContent = 'space-between';
    questionHeader.style.alignItems = 'center';
    questionHeader.style.flexWrap = 'wrap';
    questionHeader.style.gap = '1rem';

    // Timer and lifeline html
    let timerHTML = '';
    if (timerEnabledGlobal) {
        timerHTML = `
            <div class="timer-container">
                <i class="fas fa-hourglass-half" style="color: var(--accent);"></i>
                <span id="timer-secs">30s</span>
                <div class="timer-bar-bg">
                    <div id="timer-fill" class="timer-bar-fill" style="width: 100%"></div>
                </div>
            </div>
        `;
    }

    let lifelineHTML = '';
    if (lifelineEnabledGlobal) {
        lifelineHTML = `
            <button class="btn-lifeline" id="lifeline-btn" ${lifelineUsedThisQuiz ? 'disabled' : ''} onclick="useLifeline()">
                <i class="fas fa-lightbulb"></i> ${lifelineUsedThisQuiz ? 'Used' : 'Hashira Hint'}
            </button>
        `;
    }

    questionHeader.innerHTML = `
        <div style="display:flex; align-items:center; gap: 0.8rem;">
            <span class="question-number">Question ${currentQuestionIndex + 1}</span>
            <span class="question-difficulty">${currentQuizData.difficulty ? currentQuizData.difficulty.toUpperCase() : 'DSA'}</span>
        </div>
        <div style="display:flex; align-items:center; gap: 0.8rem;">
            ${lifelineHTML}
            ${timerHTML}
        </div>
    `;
    questionContainer.appendChild(questionHeader);

    // Question text
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.question;
    questionContainer.appendChild(questionText);

    // Options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    question.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'quiz-option';
        if (userAnswers[currentQuestionIndex] === index) {
            label.classList.add('selected');
        }

        label.innerHTML = `
            <input type="radio" name="answer" value="${index}" ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
            <span class="option-text">${option}</span>
        `;

        label.addEventListener('change', (e) => {
            userAnswers[currentQuestionIndex] = parseInt(e.target.value);
            document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            label.classList.add('selected');
        });

        optionsContainer.appendChild(label);
    });

    questionContainer.appendChild(optionsContainer);

    // Navigation buttons
    const navigation = document.createElement('div');
    navigation.className = 'quiz-navigation';

    const prevButton = document.createElement('button');
    prevButton.className = 'btn-secondary';
    prevButton.textContent = '← Previous';
    prevButton.disabled = currentQuestionIndex === 0;
    prevButton.onclick = () => {
        if (currentQuestionIndex > 0) {
            clearInterval(timerInterval);
            currentQuestionIndex--;
            displayQuestion();
        }
    };

    const nextButton = document.createElement('button');
    nextButton.className = 'btn-secondary';
    if (currentQuestionIndex === totalQuestions - 1) {
        nextButton.textContent = 'Submit Quiz ✓';
        nextButton.classList.remove('btn-secondary');
        nextButton.classList.add('btn-primary');
    } else {
        nextButton.textContent = 'Next →';
    }
    nextButton.onclick = () => {
        clearInterval(timerInterval);
        if (currentQuestionIndex < totalQuestions - 1) {
            currentQuestionIndex++;
            displayQuestion();
        } else {
            submitQuizAnswers();
        }
    };

    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);
    questionContainer.appendChild(navigation);

    quizContainer.innerHTML = '';
    quizContainer.appendChild(questionContainer);

    // Apply active theme colors
    if (typeof currentHashira !== 'undefined' && window.updatePageTheme) {
        window.updatePageTheme(currentHashira);
    }

    // Start timer for this question
    startQuestionTimer();
}

function submitQuizAnswers() {
    if (!currentQuizData) return;
    
    clearInterval(timerInterval);

    // Prompt warning if any unanswered questions exist
    if (userAnswers.some(a => a === -1)) {
        const confirmSubmit = confirm('⚠️ You have unanswered questions! Do you want to submit anyway?');
        if (!confirmSubmit) {
            displayQuestion(); // restore view
            return;
        }
    }

    const answersToSubmit = currentQuizData.questions.map((question, index) => ({
        questionId: question._id,
        answer: userAnswers[index]
    }));

    // Show evaluating spinner
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
        quizContainer.innerHTML = `
            <div class="quiz-card" style="text-align: center; padding: 4rem 2rem;">
                <div class="spinner" style="margin: 0 auto 1.5rem; width: 45px; height: 45px; border: 4px solid rgba(255,255,255,0.08); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <h3 style="color:#fff;">Evaluating your breath form precision...</h3>
                <p style="color: var(--muted); margin-top: 0.6rem;">Total Concentration: analyzing answers...</p>
            </div>
        `;
    }

    Quiz.submitQuiz(currentQuizData._id, answersToSubmit)
        .then(result => {
            correctAnswers = result.correctAnswers || [];
            questionExplanations = result.explanations || [];
            questionHints = result.hints || [];
            
            return Progress.updateProgress({
                topic: currentQuizData.title || 'DSA Quiz',
                completed: true,
                score: result.percentage
            })
            .catch(error => {
                console.warn('Progress API update skipped or failed:', error);
            })
            .then(() => result);
        })
        .then(result => {
            quizSubmitted = true;
            if (result.userUpdates && result.userUpdates.levelUp) {
                if (window.triggerRankup) {
                    window.triggerRankup(result.userUpdates.rank);
                }
            }
            showQuizResults(result);
        })
        .catch(error => {
            console.error('Submit failed:', error);
            alert('❌ Error submitting quiz: ' + (error.message || 'Check console.'));
            displayQuestion(); // Restore
        });
}

function showQuizResults(result) {
    const startScreen = document.getElementById('start-screen');
    const quizProgress = document.getElementById('quiz-progress');
    const quizContainer = document.getElementById('quiz-container');

    if (startScreen) startScreen.style.display = 'block';
    if (quizProgress) quizProgress.style.display = 'none';

    const scorePercentage = result.percentage;
    let performanceMessage = '';
    let performanceEmoji = '🌱';

    if (scorePercentage >= 90) {
        performanceMessage = 'Total Concentration Mastery! You are a true Pillar of algorithms! 🌟';
        performanceEmoji = '⚔️';
    } else if (scorePercentage >= 75) {
        performanceMessage = 'Outstanding technique! Your algorithmic breath forms are precise and powerful. 🎯';
        performanceEmoji = '🔥';
    } else if (scorePercentage >= 60) {
        performanceMessage = 'Passed the trial! Keep refining your forms to conquer harder data structures. 💪';
        performanceEmoji = '💧';
    } else {
        performanceMessage = 'Your blade chipped this time. Return to the dojo, practice your basics, and strike again! 🚀';
        performanceEmoji = '🍃';
    }

    let statsHTML = '';
    if (result.userUpdates) {
        statsHTML = `
            <div class="result-stats">
                <div style="font-size:1.1rem; font-weight:800; color:var(--accent); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.5rem; margin-bottom:0.5rem;"><i class="fas fa-scroll"></i> Slayer Progression Updates</div>
                <div class="result-stat-line"><span class="label">Slayer Rank:</span><span class="value">${result.userUpdates.rank}</span></div>
                <div class="result-stat-line"><span class="label">Breathing Level:</span><span class="value">Level ${result.userUpdates.level}</span></div>
                <div class="result-stat-line"><span class="label">XP Gained:</span><span class="value">+${result.percentage} XP</span></div>
                <div class="result-stat-line"><span class="label">Training Streak:</span><span class="value">${result.userUpdates.streak} days 🔥</span></div>
                <div class="result-stat-line"><span class="label">Overall Dojo Score:</span><span class="value">${result.userUpdates.practiceScore}%</span></div>
            </div>
        `;
    } else {
        statsHTML = `
            <div class="result-stats" style="border: 1px solid rgba(255,160,50,0.3); background: rgba(255,160,50,0.05); text-align: center;">
                <p style="color:#ffd966; font-weight:700;"><i class="fas fa-exclamation-triangle"></i> Session Guest Status</p>
                <p style="font-size:0.9rem; color:var(--muted); margin-top:0.4rem;">Sign in or register an account to save your progress, gain experience points (XP), level up, and achieve honors in the Demon Slayer Corps!</p>
            </div>
        `;
    }

    // Build review section showing correct/incorrect answers + details + explanations
    let reviewHTML = '';
    if (correctAnswers && correctAnswers.length > 0 && currentQuizData && currentQuizData.questions) {
        reviewHTML = '<div style="margin-top: 2.5rem; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 2rem; text-align: left;">';
        reviewHTML += '<h3 style="font-size: 1.4rem; margin-bottom: 1.5rem; color: var(--accent); text-align: center;"><i class="fas fa-magnifying-glass"></i> Trial Analysis & Review</h3>';
        
        currentQuizData.questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const correctAnswer = correctAnswers[index];
            const isCorrect = userAnswer === correctAnswer;
            
            const borderColor = isCorrect ? '#10b981' : '#e74c3c';
            const bgColor = isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(231, 76, 60, 0.08)';
            const icon = isCorrect ? '✓' : '✗';
            const explanationText = questionExplanations[index] || 'No explanation available.';
            
            reviewHTML += `
                <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 1.5rem; border-radius: 18px; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: flex-start; gap: 0.8rem; margin-bottom: 0.8rem;">
                        <span style="font-weight: 800; color: ${borderColor}; font-size: 1.2rem;">${icon}</span>
                        <span style="color: #fff; font-weight: 700;">Q${index + 1}: ${question.question}</span>
                    </div>
                    <div style="margin-left: 2.2rem; color: var(--muted); font-size: 0.95rem; display: flex; flex-direction: column; gap: 0.4rem;">
                        <div><strong>Your Selection:</strong> <span style="${isCorrect ? 'color:#10b981; font-weight:600;' : 'color:#e74c3c; font-weight:600;'}">${question.options[userAnswer] || 'Not answered'}</span></div>
                        ${!isCorrect ? `<div><strong style="color:#10b981;">Correct Form:</strong> <span style="color:#10b981; font-weight:600;">${question.options[correctAnswer]}</span></div>` : ''}
                        
                        <div style="margin-top: 0.8rem; padding: 0.8rem 1.2rem; background: rgba(0, 0, 0, 0.25); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.04);">
                            <strong style="color: var(--accent); display: block; margin-bottom: 0.25rem;"><i class="fas fa-book-open"></i> Form Explanation:</strong>
                            <span style="color:#e0d7cd; line-height: 1.5;">${explanationText}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        reviewHTML += '</div>';
    }

    const resultsHTML = `
        <div class="quiz-results">
            <h2>${performanceEmoji} Trial Complete!</h2>
            <div class="score-display">
                <h3>Your Training Score</h3>
                <div class="score-box">
                    <span class="score">${result.score}/${result.total}</span>
                    <span class="percentage">${result.percentage}%</span>
                </div>
            </div>
            <p class="result-msg">${performanceMessage}</p>
            ${statsHTML}
            ${reviewHTML}
            <div class="result-actions" style="margin-top: 2rem;">
                <button onclick="window.location.href='../dashboard/dashboard.html'" class="btn-secondary"><i class="fas fa-home"></i> Back to Dojo</button>
                <button onclick="location.reload()" class="btn-primary"><i class="fas fa-undo-alt"></i> Retake Trial</button>
            </div>
        </div>
    `;

    quizContainer.innerHTML = resultsHTML;

    // Apply active theme colors
    if (typeof currentHashira !== 'undefined' && window.updatePageTheme) {
        window.updatePageTheme(currentHashira);
    }
}

function initConfigUI() {
    // Topic grid selection
    const topicChips = document.querySelectorAll('.topic-grid .config-chip');
    topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
            topicChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            // Switch Hashira theme based on the topic for a nice flavor
            const topic = chip.getAttribute('data-topic');
            let theme = 'flame';
            if (topic === 'arrays') theme = 'wind';
            else if (topic === 'linked-lists') theme = 'water';
            else if (topic === 'stacks-queues') theme = 'thunder';
            else if (topic === 'trees') theme = 'mist';
            else if (topic === 'graphs') theme = 'flame';
            else if (topic === 'sorting') theme = 'sun';
            
            if (window.updatePageTheme) {
                window.updatePageTheme(theme);
                showToast(`⚔️ Dojo aligned to ${topic.toUpperCase().replace('-', ' ')} forms!`);
            }
        });
    });

    // Difficulty selection buttons
    const diffBtns = document.querySelectorAll('[data-diff]');
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Length selection buttons
    const lenBtns = document.querySelectorAll('[data-len]');
    lenBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            lenBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Bind DOMContentLoaded to setup configuration UI
document.addEventListener('DOMContentLoaded', () => {
    initConfigUI();
});
