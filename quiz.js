
// 1. Quiz Configuration & Answer Key
const QUIZ_LIMIT_SECONDS = 10 * 60; // 10-minute time limit (600 seconds)
const PASSING_SCORE = 7;            // 7 out of 10 (70%) required to pass

const quizKey = {
  1: {
    type: "text",
    validAnswers: ["tim berners-lee", "tim berners lee", "berners-lee", "berners lee"],
    correctLabel: "Tim Berners-Lee"
  },
  2: {
    type: "radio",
    answer: "Mosaic",
    correctLabel: "NCSA Mosaic"
  },
  3: {
    type: "radio",
    answer: "Blink",
    correctLabel: "Blink"
  },
  4: {
    type: "checkbox",
    answers: ["Rendering Engine", "JavaScript Engine", "Networking Layer"],
    correctLabel: "Rendering Engine, JavaScript Engine, and Networking Layer"
  },
  5: {
    type: "text",
    validAnswers: ["https"],
    correctLabel: "HTTPS"
  },
  6: {
    type: "radio",
    answer: "Gecko",
    correctLabel: "Gecko"
  },
  7: {
    type: "radio",
    answer: "First Browser War",
    correctLabel: "The First Browser War"
  },
  8: {
    type: "checkbox",
    answers: ["Tab Sandboxing", "Cookie Blocking", "HTTPS-Only"],
    correctLabel: "Multi-process tab sandboxing, Blocking third-party tracking cookies, and HTTPS-Only Mode"
  },
  9: {
    type: "radio",
    answer: "W3C",
    correctLabel: "W3C (World Wide Web Consortium)"
  },
  10: {
    type: "radio",
    answer: "WebAssembly",
    correctLabel: "WebAssembly (Wasm)"
  }
};

// 2. State Variables & DOM Elements
let secondsLeft = QUIZ_LIMIT_SECONDS;
let countdownId = null;
let quizSubmitted = false;

const quizForm = document.getElementById("quizForm");
const timerPanel = document.getElementById("timerPanel");
const timerClock = document.getElementById("timerClock");
const resultsBanner = document.getElementById("resultsBanner");
const overallBadge = document.getElementById("overallBadge");
const overallResultText = document.getElementById("overallResultText");
const totalScoreText = document.getElementById("totalScoreText");
const timeSpentText = document.getElementById("timeSpentText");
const submitQuizBtn = document.getElementById("submitQuizBtn");
const resetQuizBtn = document.getElementById("resetQuizBtn");

// 3. Helper Function: Format Seconds as MM:SS
function formatMMSS(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// 4. Countdown Timer Logic
function startCountdown() {
  clearInterval(countdownId);
  timerClock.textContent = formatMMSS(secondsLeft);
  timerPanel.classList.remove("timer-urgent");

  countdownId = setInterval(() => {
    secondsLeft--;
    timerClock.textContent = formatMMSS(secondsLeft);

    // Highlight timer in red during the final 60 seconds
    if (secondsLeft <= 60) {
      timerPanel.classList.add("timer-urgent");
    }

    // Automatically submit quiz when time reaches 00:00
    if (secondsLeft <= 0) {
      clearInterval(countdownId);
      evaluateQuiz(true);
    }
  }, 1000);
}

// 5. Quiz Grading & Color-Coded Feedback Logic
function evaluateQuiz(wasAutoSubmitted = false) {
  if (quizSubmitted) return;
  quizSubmitted = true;
  clearInterval(countdownId);

  let totalScore = 0;
  const questionCount = Object.keys(quizKey).length;

  Object.keys(quizKey).forEach((num) => {
    const item = quizKey[num];
    const block = document.getElementById(`q-block-${num}`);
    const feedback = document.getElementById(`q-feedback-${num}`);
    let isCorrect = false;

    if (item.type === "text") {
      const val = document.getElementById(`q${num}`).value.trim().toLowerCase();
      isCorrect = item.validAnswers.includes(val);
    } else if (item.type === "radio") {
      const checked = document.querySelector(`input[name="q${num}"]:checked`);
      isCorrect = checked ? checked.value === item.answer : false;
    } else if (item.type === "checkbox") {
      const selected = Array.from(document.querySelectorAll(`input[name="q${num}"]:checked`))
        .map((el) => el.value);
      isCorrect =
        selected.length === item.answers.length &&
        item.answers.every((ans) => selected.includes(ans));
    }

    // Clear previous styling and apply green/red result feedback
    block.classList.remove("is-correct", "is-incorrect");
    feedback.classList.remove("fb-correct", "fb-incorrect");

    if (isCorrect) {
      totalScore++;
      block.classList.add("is-correct");
      feedback.classList.add("fb-correct");
      feedback.innerHTML = `<strong>Score: 1/1 | Result: Correct</strong> &mdash; Answer: ${item.correctLabel}`;
    } else {
      block.classList.add("is-incorrect");
      feedback.classList.add("fb-incorrect");
      feedback.innerHTML = `<strong>Score: 0/1 | Result: Incorrect</strong> &mdash; Correct Answer: ${item.correctLabel}`;
    }
  });

  // Lock form controls after submission
  quizForm.querySelectorAll("input").forEach((el) => {
    el.disabled = true;
  });
  submitQuizBtn.disabled = true;

  // Calculate score percentage, pass/fail result, and total time spent
  const pct = Math.round((totalScore / questionCount) * 100);
  const passed = totalScore >= PASSING_SCORE;
  const elapsedSeconds = QUIZ_LIMIT_SECONDS - secondsLeft;

  totalScoreText.textContent = `${totalScore} / ${questionCount} (${pct}%)`;
  timeSpentText.textContent = formatMMSS(elapsedSeconds);
  overallResultText.textContent = wasAutoSubmitted
    ? `${passed ? "PASS" : "FAIL"} (Auto-submitted at 10:00)`
    : passed
    ? "PASS (70% or higher)"
    : "FAIL (Below 70%)";

  // Style the top summary banner
  resultsBanner.classList.remove("hidden", "banner-pass", "banner-fail");
  overallBadge.classList.remove("badge-pass", "badge-fail");

  if (passed) {
    resultsBanner.classList.add("banner-pass");
    overallBadge.classList.add("badge-pass");
    overallBadge.textContent = "PASS";
  } else {
    resultsBanner.classList.add("banner-fail");
    overallBadge.classList.add("badge-fail");
    overallBadge.textContent = "FAIL";
  }

  resultsBanner.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 6. Reset / Retake Quiz Logic
function resetQuizState() {
  clearInterval(countdownId);
  quizSubmitted = false;
  secondsLeft = QUIZ_LIMIT_SECONDS;

  quizForm.reset();
  quizForm.querySelectorAll("input").forEach((el) => {
    el.disabled = false;
  });
  submitQuizBtn.disabled = false;

  resultsBanner.classList.add("hidden");
  resultsBanner.classList.remove("banner-pass", "banner-fail");

  Object.keys(quizKey).forEach((num) => {
    const block = document.getElementById(`q-block-${num}`);
    const feedback = document.getElementById(`q-feedback-${num}`);
    block.classList.remove("is-correct", "is-incorrect");
    feedback.classList.remove("fb-correct", "fb-incorrect");
    feedback.innerHTML = "";
  });

  startCountdown();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 7. Event Listeners & Initialization
quizForm.addEventListener("submit", (e) => {
  e.preventDefault();
  evaluateQuiz(false);
});

resetQuizBtn.addEventListener("click", resetQuizState);

startCountdown();
