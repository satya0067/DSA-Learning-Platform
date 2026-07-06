// Progress Tracking Logic

function loadUserProgress() {
    Progress.getProgress()
        .then(progressData => {
            displayProgress(progressData);
        })
        .catch(error => {
            console.error('Error loading progress:', error);
        });
}

function displayProgress(progressData) {
    const progressContainer = document.getElementById('progress-container');
    const statusTopics = document.getElementById('status-topics');
    const statusStreak = document.getElementById('status-streak');
    const summaryText = document.getElementById('summary-text');

    if (!progressContainer || !statusTopics || !statusStreak || !summaryText) return;

    progressContainer.innerHTML = '';

    const totalTopics = progressData.length;
    const completedTopics = progressData.filter(item => item.completed).length;
    const averageScore = totalTopics ? Math.round(progressData.reduce((sum, item) => sum + item.score, 0) / totalTopics) : 0;
    const bestTopic = progressData.reduce((best, item) => {
        if (!best || item.score > best.score) return item;
        return best;
    }, null);

    statusTopics.textContent = `${completedTopics} / ${totalTopics}`;

    const recentDates = progressData
        .map(item => new Date(item.updatedAt))
        .filter(date => !Number.isNaN(date.getTime()))
        .sort((a, b) => b - a);

    const today = new Date();
    let streak = 0;
    for (const date of recentDates) {
        const dayDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (dayDiff <= streak) {
            streak += 1;
        } else {
            break;
        }
    }

    statusStreak.textContent = `${streak} ${streak === 1 ? 'day' : 'days'}`;

    if (!totalTopics) {
        summaryText.textContent = 'No progress data found yet. Start a topic to unlock your report and earn streaks.';
    } else {
        const bestTopicLabel = bestTopic ? `${bestTopic.topic} (${bestTopic.score}%)` : '—';
        summaryText.innerHTML = `You have completed <strong>${completedTopics}</strong> of <strong>${totalTopics}</strong> topics, with an average score of <strong>${averageScore}%</strong>. Your strongest topic is <strong>${bestTopicLabel}</strong>. Keep your streak going and conquer one topic each day!`;
    }

    progressData.forEach(item => {
        const progressElement = document.createElement('div');
        progressElement.className = 'progress-item';
        const statusLabel = item.completed ? 'Completed' : 'In Progress';
        const statusClass = item.completed ? 'completed' : 'in-progress';
        const updatedAt = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Unknown';

        progressElement.innerHTML = `
            <div class="progress-meta">
                <h3>${item.topic}</h3>
                <span class="progress-pill ${statusClass}">${statusLabel}</span>
            </div>
            <div class="progress-meta">
                <span>Score: <strong>${item.score}%</strong></span>
                <span>Updated: <strong>${updatedAt}</strong></span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${item.score}%"></div>
            </div>
            <div class="progress-actions">
                <button class="progress-btn primary" data-action="complete">${item.completed ? 'Refresh Score' : 'Mark Completed'}</button>
                <button class="progress-btn secondary" data-action="boost">Boost Score</button>
            </div>
        `;

        const completeButton = progressElement.querySelector('[data-action="complete"]');
        const boostButton = progressElement.querySelector('[data-action="boost"]');

        if (completeButton) {
            completeButton.addEventListener('click', () => completeTopic(item.topic, item.score));
        }
        if (boostButton) {
            boostButton.addEventListener('click', () => boostScore(item.topic, item.score));
        }

        progressContainer.appendChild(progressElement);
    });
}

function completeTopic(topic, currentScore) {
    const targetScore = currentScore >= 90 ? 100 : Math.max(currentScore, 90);
    updateProgress(topic, targetScore, true);
}

function boostScore(topic, currentScore) {
    const boostedScore = Math.min(100, currentScore + 10);
    updateProgress(topic, boostedScore, currentScore >= 70);
}

function updateProgress(topic, score, completed) {
    Progress.updateProgress({ topic, score, completed })
        .then(response => {
            console.log('Progress updated:', response);
            loadUserProgress();
        })
        .catch(error => {
            console.error('Error updating progress:', error);
        });
}