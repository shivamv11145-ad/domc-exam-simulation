let questions = [];
let currentQuestionIndex = 0;
let currentOptionIndex = 0;
let score = 0;
let isCurrentQuestionCorrect = true;

// Fetch questions from the JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions-VA.json');
        questions = await response.json();
        startExam();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Initialize the first question and option
function startExam() {
    currentQuestionIndex = 0;
    currentOptionIndex = 0;
    score = 0;
    isCurrentQuestionCorrect = true;
    displayNextOption();
}

// Display the next option in the current question
function displayNextOption() {
    const questionObj = questions[currentQuestionIndex];
    document.getElementById('question').innerText = `Q${currentQuestionIndex + 1}: ${questionObj.question}`;
    document.getElementById('option').innerText = `Option: ${questionObj.options[currentOptionIndex].answer}`;
}

// Handle the user's response (Yes or No)
function handleResponse(userResponse) {
    const questionObj = questions[currentQuestionIndex];
    const currentOption = questionObj.options[currentOptionIndex];

    // Check if the user's response matches the correct answer
    if ((userResponse && currentOption.correct) || (!userResponse && !currentOption.correct)) {
        // User got this option right, do nothing
    } else {
        // User got this option wrong
        isCurrentQuestionCorrect = false;
    }

    // Move to the next option or next question
    currentOptionIndex++;
    if (currentOptionIndex < questionObj.options.length) {
        displayNextOption();
    } else {
        // If all correct options were chosen and no wrong options were selected, award a point
        if (isCurrentQuestionCorrect) {
            score += 1;
        }

        // Reset for the next question
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


// End the exam and display the score
function endExam() {
    document.getElementById('exam-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('score').innerText = `${score}/${questions.length}`;
}

// Start the exam when the page loads by loading questions first
window.onload = loadQuestions;
