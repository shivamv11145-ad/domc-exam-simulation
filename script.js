let questions = [];
let currentQuestionIndex = 0;
let currentOptionIndex = 0;
let score = 0;
let isCurrentQuestionCorrect = true;
let reorderAnswers = [];

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
    displayQuestion();
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

function displayQuestion() {
    const questionObj = questions[currentQuestionIndex];
    const questionElement = document.getElementById('question');
    const optionElement = document.getElementById('option');
    const buttonContainer = document.querySelector('.buttons');

    // Clear existing options
    optionElement.innerHTML = '';

    // Determine question type
    if (questionObj.type === 'reorder') {
        // Reordering question type
        buttonContainer.innerHTML = `<button onclick="submitReorder()" class="submit-btn">Submit</button>`;
        reorderAnswers = shuffleArray(questionObj.options);

        reorderAnswers.forEach((option, index) => {
            const optionBox = document.createElement('div');
            optionBox.className = 'reorder-option';
            optionBox.innerText = option.answer;
            optionBox.draggable = true;
            optionBox.id = `option-${index}`;
            optionElement.appendChild(optionBox);
        });

        enableDragAndDrop();
    } else {
        // Regular question type
        questionElement.innerText = `Q${currentQuestionIndex + 1}: ${questionObj.question}`;
        displayNextOption();
    }
}

function displayNextOption() {
    const questionObj = questions[currentQuestionIndex];
    const optionElement = document.getElementById('option');
    const buttonContainer = document.querySelector('.buttons');

    buttonContainer.innerHTML = `
        <button onclick="handleResponse(true)" class="yes-btn">Yes</button>
        <button onclick="handleResponse(false)" class="no-btn">No</button>
    `;

    optionElement.innerText = `Option: ${questionObj.options[currentOptionIndex].answer}`;
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
            displayQuestion();
        } else {
            endExam();
        }
    }
}

function submitReorder() {
    const questionObj = questions[currentQuestionIndex];
    const userOrder = Array.from(document.querySelectorAll('.reorder-option')).map((el) => el.innerText);

    const correctOrder = questionObj.options.map(option => option.answer);
    let correctOrderMatch = true;

    userOrder.forEach((answer, index) => {
        if (answer !== correctOrder[index]) {
            correctOrderMatch = false;
        }
    });

    if (correctOrderMatch) {
        score += 1;
    }

    currentQuestionIndex++;
    updateQuestionTracker();

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endExam();
    }
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function enableDragAndDrop() {
    const draggableItems = document.querySelectorAll('.reorder-option');

    draggableItems.forEach((item) => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragover', dragOver);
        item.addEventListener('dragenter', dragEnter);
        item.addEventListener('dragleave', dragLeave);
        item.addEventListener('drop', drop);
        item.addEventListener('dragend', dragEnd);
    });
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
    event.target.classList.add('dragging');
}

function dragOver(event) {
    event.preventDefault();
}

function dragEnter(event) {
    event.target.classList.add('drag-over');
}

function dragLeave(event) {
    event.target.classList.remove('drag-over');
}

function drop(event) {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(draggedId);
    const targetElement = event.target;

    if (targetElement.classList.contains('reorder-option')) {
        const parentElement = targetElement.parentElement;
        parentElement.insertBefore(draggedElement, targetElement.nextSibling);
    }

    targetElement.classList.remove('drag-over');
}

function dragEnd(event) {
    event.target.classList.remove('dragging');
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
