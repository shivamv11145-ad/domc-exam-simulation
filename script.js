// Questions and options data
const questions = [
    {
        question: "What is 2 + 2?",
        options: [
            { answer: 3, correct: false },
            { answer: 4, correct: true },
            { answer: 1, correct: false }
        ]
    },
    {
        question: "What is 3 + 2?",
        options: [
            { answer: 5, correct: true },
            { answer: 6, correct: false },
            { answer: 2, correct: false }
        ]
    }
];

let currentQuestionIndex = 0;
let currentOptionIndex = 0;
let score = 0;
let currentQuestionCorrect = true; // Track if the current question's answers are correct

// Initialize the first question and option
function startExam() {
    currentQuestionIndex = 0;
    currentOptionIndex = 0;
    score = 0;
    currentQuestionCorrect = true;
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

    // Check if the user's response matches the correctness of the option
    if ((userResponse && !currentOption.correct) || (!userResponse && currentOption.correct)) {
        currentQuestionCorrect = false; // Mark the current question as incorrect
    }

    // Move to the next option or next question
    currentOptionIndex++;
    if (currentOptionIndex < questionObj.options.length) {
        displayNextOption();
    } else {
        if (currentQuestionCorrect) {
            score += 1; // Only add to the score if the entire question was answered correctly
        }

        // Reset for the next question
        currentOptionIndex = 0;
        currentQuestionIndex++;
        currentQuestionCorrect = true;

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
    document.getElementById('score').innerText = `${score}/${questions.length}`;  // Each question gives 1 point
}

// Start the exam when the page loads
window.onload = startExam;
