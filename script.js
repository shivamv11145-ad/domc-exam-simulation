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

// Initialize the first question and option
function startExam() {
    currentQuestionIndex = 0;
    currentOptionIndex = 0;
    score = 0;
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
    if ((userResponse && currentOption.correct) || (!userResponse && !currentOption.correct
