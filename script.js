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
            actionButton.innerText = 'Submit';
            actionButton.onclick = handleReorderSubmit;
        } else {
            questionObj.options.forEach((option, index) => {
                const optionP = document.createElement('p');
                optionP.className = 'option';
                optionP.innerText = `Option: ${option.answer}`;
                optionElement.appendChild(optionP);
            });
            actionButton.innerText = 'Next';
            actionButton.onclick = handleResponse;
        }

        // Fade in the question and options
        questionElement.classList.remove('fade-out');
        optionElement.classList.remove('fade-out');
    }, 300); // Match the duration with the CSS transition duration
}

function handleResponse() {
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
    const dropTarget = event.target.closest('.reorder-option');

    if (dropTarget && dropTarget !== draggedElement) {
        const parent = draggedElement.parentNode;
        const draggedIndexNum = parseInt(draggedIndex, 10);
        const dropIndexNum = parseInt(dropTarget.dataset.index, 10);

        parent.insertBefore(draggedElement, dropTarget.nextSibling);
        if (draggedIndexNum < dropIndexNum) {
            parent.insertBefore(dropTarget, draggedElement);
        } else {
            parent.insertBefore(dropTarget, draggedElement.nextSibling);
        }
    }

    draggedElement.classList.remove('dragging');
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
