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
    displayNextQuestion();
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

function displayNextQuestion() {
    const questionObj = questions[currentQuestionIndex];
    const questionElement = document.getElementById('question');
    const optionElement = document.getElementById('option');
    const actionButton = document.getElementById('action-button');
    const yesButton = document.getElementById('yes-btn');
    const noButton = document.getElementById('no-btn');
    const submitButton = document.getElementById('submit-button');

    // Clear previous content
    optionElement.innerHTML = '';

    // Fade out the question and options
    questionElement.classList.add('fade-out');
    optionElement.classList.add('fade-out');

    setTimeout(() => {
        questionElement.innerText = `Q${currentQuestionIndex + 1}: ${questionObj.question}`;

        if (questionObj.type === 'reorder') {
            questionObj.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'reorder-option';
                optionDiv.draggable = true;
                optionDiv.dataset.index = index;
                optionDiv.innerText = option.answer;
                optionDiv.addEventListener('dragstart', handleDragStart);
                optionDiv.addEventListener('dragover', handleDragOver);
                optionDiv.addEventListener('drop', handleDrop);
                optionElement.appendChild(optionDiv);
            });
            // Hide the Yes/No buttons and show Submit button
            yesButton.style.display = 'none';
            noButton.style.display = 'none';
            actionButton.style.display = 'none';
            submitButton.style.display = 'inline-block';
        } else {
            // Show Yes/No buttons and hide Submit button
            yesButton.style.display = 'inline-block';
            noButton.style.display = 'inline-block';
            actionButton.style.display = 'none';
            submitButton.style.display = 'none';

            // Display options one by one
            displayOption(0);
        }

        // Fade in the question and options
        questionElement.classList.remove('fade-out');
        optionElement.classList.remove('fade-out');
    }, 300); // Match the duration with the CSS transition duration
}

function displayOption(index) {
    const questionObj = questions[currentQuestionIndex];
    const optionElement = document.getElementById('option');
    if (index < questionObj.options.length) {
        const optionP = document.createElement('p');
        optionP.className = 'option';
        optionP.innerText = `Option: ${questionObj.options[index].answer}`;
        optionElement.appendChild(optionP);

        // Automatically move to next option after 1 second
        setTimeout(() => displayOption(index + 1), 1000);
    } else {
        // All options are displayed, show Yes/No buttons
        document.getElementById('yes-btn').style.display = 'inline-block';
        document.getElementById('no-btn').style.display = 'inline-block';
    }
}

function handleResponse(isYes) {
    const questionObj = questions[currentQuestionIndex];
    if (questionObj.type !== 'reorder') {
        const optionElements = document.querySelectorAll('#option .option');
        let isCorrect = true;

        optionElements.forEach((element, index) => {
            const option = questionObj.options[index];
            if (element.innerText.includes(option.answer)) {
                if (option.correct === false) {
                    isCorrect = false;
                }
            } else {
                isCorrect = false;
            }
        });

        if (isCorrect) {
            score += 1;
        }
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayNextQuestion();
    } else {
        endExam();
    }
}

function handleReorderSubmit() {
    const questionObj = questions[currentQuestionIndex];
    const optionElements = Array.from(document.querySelectorAll('#option .reorder-option'));
    const userAnswers = optionElements.map(element => element.innerText);

    const correctAnswers = questionObj.options.map(option => option.answer);

    if (JSON.stringify(userAnswers) === JSON.stringify(correctAnswers)) {
        score += 1;
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayNextQuestion();
    } else {
        endExam();
    }
}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.index);
    event.target.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const draggedIndex = event.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.reorder-option[data-index="${draggedIndex}"]`);
    const targetElement = event.target;

    if (targetElement.classList.contains('reorder-option') && targetElement !== draggedElement) {
        const tempIndex = draggedElement.dataset.index;
        draggedElement.dataset.index = targetElement.dataset.index;
        targetElement.dataset.index = tempIndex;

        const parent = draggedElement.parentNode;
        parent.insertBefore(draggedElement, targetElement.nextSibling);
    }
}

function endExam() {
    document.getElementById('exam-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('score').innerText = score;
}

function startTimer() {
    let timer = document.getElementById('timer');
    let minutes = 0;
    let seconds = 0;

    setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        timer.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

document.addEventListener('DOMContentLoaded', loadQuestions);
