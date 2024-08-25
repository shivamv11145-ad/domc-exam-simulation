let questions = [];
let currentQuestionIndex = 0;
let currentOptionIndex = 0;
let score = 0;
let isCurrentQuestionCorrect = true;

// Fetch questions from the JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
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

    // If the user's response doesn't match the correct answer, mark the question as incorrect
    if ((userResponse && !currentOption.correct) || (!userResponse && currentOption.correct)) {
        isCurrentQuestionCorrect = false;
    }

    // Move to the next option or next question
    currentOptionIndex++;
    if (currentOptionIndex < questionObj.options.length) {
        displayNextOption();
    } else {
        // If the entire question was answered correctly, increase the score
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