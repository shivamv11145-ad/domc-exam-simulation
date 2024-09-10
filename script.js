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

    // Fade out the question and option
    questionElement.classList.add('fade-out');
    optionElement.classList.add('fade-out');

    setTimeout(() => {
        questionElement.innerText = `Q${currentQuestionIndex + 1}: ${questionObj.question}`;

        if (questionObj.type === 'reorder') {
            displayReorderOptions(questionObj);
        } else {
            optionElement.innerText = `Option: ${questionObj.options[currentOptionIndex].answer}`;
            // Fade in the question and option
            questionElement.classList.remove('fade-out');
            optionElement.classList.remove('fade-out');
        }
    }, 300); // Match the duration with the CSS transition duration
}

function displayReorderOptions(questionObj) {
    const optionElement = document.getElementById('option');
    optionElement.innerHTML = ''; // Clear previous options

    // Create draggable options
    questionObj.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'reorder-option';
        optionDiv.draggable = true;
        optionDiv.innerText = option.answer;
        optionDiv.dataset.index = index;

        // Add event listeners for drag and drop
        optionDiv.addEventListener('dragstart', handleDragStart);
        optionDiv.addEventListener('dragover', handleDragOver);
        optionDiv.addEventListener('drop', handleDrop);
        optionDiv.addEventListener('dragend', handleDragEnd);

        optionElement.appendChild(optionDiv);
    });

    // Fade in the question and options
    const questionElement = document.getElementById('question');
    questionElement.classList.remove('fade-out');
    optionElement.classList.remove('fade-out');
}

function handleDragStart(event) {
    draggedElement = event.target;
    event.target.style.opacity = '0.5';
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    if (event.target.className === 'reorder-option') {
        const targetElement = event.target;
        const parent = targetElement.parentNode;
        parent.insertBefore(draggedElement, targetElement.nextSibling);
    }
}

function handleDragEnd(event) {
    event.target.style.opacity = '';
    // Update the order based on the new arrangement
    updateOrder();
}

function updateOrder() {
    const reorderedOptions = Array.from(document.querySelectorAll('.reorder-option'));
    const reorderedIndices = reorderedOptions.map(option => parseInt(option.dataset.index, 10));

    // Check if reordered indices match the correct order
    const questionObj = questions[currentQuestionIndex];
    const correctOrder = questionObj.options.map(option => option.correctOrder);

    if (JSON.stringify(reorderedIndices) === JSON.stringify(correctOrder)) {
        isCurrentQuestionCorrect = true;
    } else {
        isCurrentQuestionCorrect = false;
    }
}

function handleResponse(userResponse) {
    const questionObj = questions[currentQuestionIndex];

    if (questionObj.type === 'reorder') {
        // No user response handling for re-ordering, handled in updateOrder
    } else {
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
}

function endExam() {
    document.getElementById('exam-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('score').innerText = `${score}/${questions.length}`;
    clearInterval(timerInterval); // Stop the timer when the exam ends
}

/* Timer Code */
let timerElement = document.getElementById('timer');
let totalTime = 15 * 60; // Set the timer for 15 minutes
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
