let questions = [];
let currentQuestionIndex = 0;
let currentOptionIndex = 0;
let score = 0;
let isCurrentQuestionCorrect = true;

async function loadQuestions() {
    const selectedQuiz = localStorage.getItem('selectedQuiz') || 'questions-VA.json';

    const quizFileUrl = `https://raw.githubusercontent.com/shivamv11145-ad/domc-exam-simulation/main/${selectedQuiz}`;

    try {
        const response = await fetch(quizFileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        questions = await response.json();
        console.log("Questions loaded:", questions);  // Debugging log
        initializeQuestionTracker();
        startExam();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('question').innerText = 'Failed to load questions. Please try again later.';
        document.getElementById('option').innerText = '';
    }
}

function initializeQuestionTracker() {
    const trackerContainer = document.getElementById('question-tracker');
    console.log("Initializing question tracker...");  // Debugging log

    trackerContainer.innerHTML = ''; // Clear any existing content

    questions.forEach((_, index) => {
        const trackerItem = document.createElement('div');
        trackerItem.className = 'tracker-item unanswered';
        trackerItem.id = `tracker-item-${index}`;
        trackerItem.innerText = `Q${index + 1}`;
        trackerContainer.appendChild(trackerItem);
        console.log(`Tracker item for Q${index + 1} added.`);  // Debugging log
    });
}

function startExam() {
    currentQuestionIndex = 0;
    currentOptionIndex = 0;
    score = 0;
    isCurrentQuestionCorrect = true;
    updateQuestionTracker();
    displayNextOption();
    startTimer();
}

function updateQuestionTracker() {
    questions.forEach((_, index) => {
        const trackerItem = document.getElementById(`tracker-item-${index}`);
        if (index === currentQuestionIndex) {
            trackerItem.className = 'tracker-item active';
        } else if (index < currentQuestionIndex) {
            trackerItem.className = 'tracker-item answered';
        } else {
            trackerItem.className = 'tracker-item unanswered';
        }
    });
}

function displayNextOption() {
    const questionObj = questions[currentQuestionIndex];
    const questionElement = document.getElementById('question');
    const optionElement = document.getElementById('option');

    // Add blur effect for better visibility (optional)
    questionElement.classList.add('blur');
    optionElement.classList.add('blur');

    // Apply fade-out effect
    questionElement.classList.add('fade-out');
    optionElement.classList.add('fade-out');

    setTimeout(() => {
        questionElement.innerText = `Q${currentQuestionIndex + 1}: ${questionObj.question}`;
        optionElement.innerText = `Option: ${questionObj.options[currentOptionIndex].answer}`;

        // Apply fade-in effect
        questionElement.classList.remove('fade-out');
        optionElement.classList.remove('fade-out');
        questionElement.classList.add('fade-in');
        optionElement.classList.add('fade-in');

        // Remove blur effect after transition
        questionElement.classList.remove('blur');
        optionElement.classList.remove('blur');
    }, 600); // Match the transition duration
}


function handleResponse(userResponse) {
    const questionObj = questions[currentQuestionIndex];
    const currentOption = questionObj.options[currentOptionIndex];

    if ((userResponse && currentOption.correct) || (!userResponse && !currentOption.correct)) {
        // User got this option right, do nothing
    } else {
        isCurrentQuestionCorrect = false;
    }

    currentOptionIndex++;
    if (currentOptionIndex < questionObj.options.length) {
        displayNextOption();
    } else {
        if (isCurrentQuestionCorrect) {
            score += 1;
        }
        currentOptionIndex = 0;
        currentQuestionIndex++;
        isCurrentQuestionCorrect = true;

        updateQuestionTracker();

        if (currentQuestionIndex < questions.length) {
            displayNextOption();
        } else {
            endExam();
        }
    }
}

function endExam() {
    document.getElementById('exam-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('score').innerText = `${score}/${questions.length}`;
    clearInterval(timerInterval); // Stop the timer when the exam ends
}

/* Timer Code */
let timerElement = document.getElementById('timer');
let totalTime = 15 * 60; // Set the timer for 10 minutes
let timerInterval;

function startTimer() {
    timerInterval = setInterval(() => {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;

        if (seconds < 10) {
            seconds = '0' + seconds;
        }

        timerElement.textContent = `${minutes}:${seconds}`;

        if (totalTime > 0) {
            totalTime--; // Decrement the total time
        } else {
            clearInterval(timerInterval);
            alert("Time's up!");
            endExam(); // End the exam when time is up
        }
    }, 1000);
}

window.onload = loadQuestions;
