let questions = [];
let currentQuestionIndex = 0;
let currentOptionIndex = 0;
let score = 0;
let isCurrentQuestionCorrect = true;

async function loadQuestions() {
    const selectedQuiz = localStorage.getItem('selectedQuiz') || 'questions-VA.json'; // Default to 'questions-VA.json' if none selected

    // Use the raw GitHub URL for the JSON file
    const quizFileUrl = `https://raw.githubusercontent.com/shivamv11145-ad/domc-exam-simulation/main/${selectedQuiz}`;

    try {
        const response = await fetch(quizFileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        questions = await response.json();
        startExam();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('question').innerText = 'Failed to load questions. Please try again later.';
        document.getElementById('option').innerText = '';
    }
}

function startExam() {
    currentQuestionIndex = 0;
    currentOptionIndex = 0;
    score = 0;
    isCurrentQuestionCorrect = true;
    displayNextOption();
    startTimer(); // Start the timer when the exam starts
}

function displayNextOption() {
    const questionObj = questions[currentQuestionIndex];
    document.getElementById('question').innerText = `Q${currentQuestionIndex + 1}: ${questionObj.question}`;
    document.getElementById('option').innerText = `Option: ${questionObj.options[currentOptionIndex].answer}`;
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
let totalTime = 10 * 60; // Set the timer for 10 minutes
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
            totalTime--;
        } else {
            clearInterval(timerInterval);
            alert("Time's up!");
            endExam(); // End the exam when time is up
        }
    }, 1000);
}

window.onload = loadQuestions;
