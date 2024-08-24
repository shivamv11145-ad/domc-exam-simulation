document.getElementById("domc-exam").addEventListener("submit", function(event){
    event.preventDefault();

    let score = 0;
    const answers = {
        q1: 'B',
        q2: 'B'
    };

    for (let question in answers) {
        const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
        if (selectedOption && selectedOption.value === answers[question]) {
            score++;
        }
    }

    alert(`Your score is: ${score}/2`);
});
