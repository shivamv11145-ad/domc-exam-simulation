<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz</title>
</head>
<body>
    <div id="exam-container">
        <p id="question"></p>
        <p id="option"></p>
        <button onclick="handleResponse(true)">Yes</button>
        <button onclick="handleResponse(false)">No</button>
    </div>
    <div id="result-container" style="display:none;">
        <h2>Your Score</h2>
        <p id="score"></p>
        <button onclick="location.reload()">Retake Quiz</button>
    </div>

    <script>
        let questions = [];
        let currentQuestionIndex = 0;
        let currentOptionIndex = 0;
        let score = 0;
        let isCurrentQuestionCorrect = true;

        async function loadQuestions() {
            const selectedQuiz = localStorage.getItem('selectedQuiz') || 'questions-VA.json'; // Default to 'questions-VA.json' if none selected
            try {
                const response = await fetch(selectedQuiz);
                questions = await response.json();
                startExam();
            } catch (error) {
                console.error('Error loading questions:', error);
            }
        }

        function startExam() {
            currentQuestionIndex = 0;
            currentOptionIndex = 0;
            score = 0;
            isCurrentQuestionCorrect = true;
            displayNextOption();
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
        }

        window.onload = loadQuestions;
    </script>
</body>
</html>
