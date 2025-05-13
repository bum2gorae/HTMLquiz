let quizData = [];
let userAnswers = [];

const quizContainer = document.getElementById("quiz-container");
const scoreDisplay = document.getElementById("score");

document.getElementById("load-quiz").addEventListener("click", () => {
  const file = document.getElementById("json-input").files[0];
  if (!file) return alert("JSON 파일을 선택해주세요");

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (!Array.isArray(json)) throw new Error("유효하지 않은 JSON 구조입니다.");
      quizData = json;
      renderQuizzes();
    } catch (err) {
      alert("JSON 파싱 오류: " + err.message);
    }
  };
  reader.readAsText(file);
});


function renderQuizzes() {
    quizContainer.innerHTML = "";
    userAnswers = [];
  
    quizData.forEach((quiz, idx) => {
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.dataset.questionIndex = idx;
  
      const q = document.createElement("p");
      q.textContent = quiz.question;
      card.appendChild(q);
  
      quiz.options.forEach((opt, optIdx) => {
        const optDiv = document.createElement("div");
        optDiv.className = "option";
        optDiv.textContent = opt;
        optDiv.dataset.optionIndex = optIdx;
  
        card.appendChild(optDiv);
      });
  
      quizContainer.appendChild(card);
    });
}

quizContainer.addEventListener("click", (e) => {
    if (!e.target.classList.contains("option")) return;
  
    const optionDiv = e.target;
    const card = optionDiv.closest(".quiz-card");
    const questionIndex = Number(card.dataset.questionIndex);
    const optionIndex = Number(optionDiv.dataset.optionIndex);
  
    // 선택 상태 표시
    const siblings = card.querySelectorAll(".option");
    siblings.forEach(el => el.classList.remove("selected"));
    optionDiv.classList.add("selected");
  
    // 사용자 답안 저장
    userAnswers[questionIndex] = optionIndex;
});  

document.getElementById("check-answer").addEventListener("click", () => {
  let score = 0;

  quizData.forEach((quiz, idx) => {
    const card = quizContainer.children[idx];
    const selected = userAnswers[idx];
    const options = card.querySelectorAll(".option");

    options.forEach((opt, i) => {
      opt.classList.remove("correct", "incorrect");
      if (i === quiz.answer) opt.classList.add("correct");
      else if (i === selected) opt.classList.add("incorrect");
    });

    if (selected === quiz.answer) score++;
  });

  scoreDisplay.textContent = `점수: ${score} / ${quizData.length}`;
});

document.getElementById("reset-quiz").addEventListener("click", () => {
    if (quizData.length === 0) return;
  
    scoreDisplay.textContent = "";
    renderQuizzes();
});

document.getElementById("reset-quiz").addEventListener("click", () => {
    if (quizData.length === 0) return;
  
    // 점수 초기화
    scoreDisplay.textContent = "";
  
    // 사용자 답안 초기화
    userAnswers = [];
  
    // 퀴즈 다시 렌더링 (선택 및 채점 상태 제거됨)
    renderQuizzes();
});

// 모달 열기/닫기
const modal = document.getElementById("quiz-modal");
document.getElementById("open-modal").addEventListener("click", () => {
  modal.classList.remove("hidden");
});

document.getElementById("close-modal").addEventListener("click", () => {
  modal.classList.add("hidden");
});

// 퀴즈 추가
document.getElementById("quiz-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const question = document.getElementById("new-question").value.trim();
  const options = [
    document.getElementById("new-option1").value.trim(),
    document.getElementById("new-option2").value.trim(),
    document.getElementById("new-option3").value.trim(),
    document.getElementById("new-option4").value.trim(),
    document.getElementById("new-option5").value.trim(),
  ].filter(opt => opt !== "");

  const answerInput = parseInt(document.getElementById("new-answer").value, 10);
  const answerIndex = answerInput - 1;

  if (!question || options.length < 2 || isNaN(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
    alert("입력이 올바르지 않습니다. 보기 2개 이상, 정답은 범위 내 번호로 입력해주세요.");
    return;
  }

  const newQuiz = { question, options, answer: answerIndex };
  quizData.push(newQuiz);
  renderQuizzes();
  scoreDisplay.textContent = "";

  e.target.reset();
  modal.classList.add("hidden"); // 추가 후 팝업 닫기
});

document.getElementById("download-json").addEventListener("click", () => {
    if (quizData.length === 0) {
      alert("저장할 퀴즈가 없습니다.");
      return;
    }
  
    // JSON 문자열 생성 (가독성을 위해 들여쓰기 2칸)
    const jsonString = JSON.stringify(quizData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    // 가짜 <a> 태그로 다운로드 트리거
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz.json";  // 다운로드 파일 이름
    a.click();
  
    URL.revokeObjectURL(url);  // 메모리 정리
});