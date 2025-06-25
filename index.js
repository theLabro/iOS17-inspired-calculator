document.addEventListener("DOMContentLoaded", () => {
  const displayResult = document.getElementById("result");
  const displayExpression = document.getElementById("expression");
  const buttonsContainer = document.getElementById("buttons-container");

  let currentInput = "";
  let expression = "";
  let shouldResetDisplay = false;
  let openBracket = true;

  buttonsContainer.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target || !target.classList.contains("btn")) return;

    const num = target.dataset.num;
    const op = target.dataset.op;
    const action = target.dataset.action;

    if (num) handleNumber(num);
    else if (op) handleOperator(op);
    else if (action) handleAction(action);

    updateDisplay();
  });

  function handleNumber(num) {
    if (shouldResetDisplay) {
      currentInput = "";
      shouldResetDisplay = false;
    }
    if (num === "." && currentInput.includes(".")) return;
    currentInput += num;
  }

  function handleOperator(op) {
    if (["sqrt", "fact", "pow", "brac", "sqr"].includes(op)) {
      handleScientific(op);
      return;
    }

    expression += currentInput + op;
    currentInput = "";
  }

  function handleScientific(op) {
    let value = parseFloat(currentInput);
    let result;

    switch (op) {
      case "sqrt":
        expression += `Math.sqrt(${currentInput})`;
        currentInput = "";
        break;
      case "sqr":
        expression += `Math.pow(${currentInput},2)`;
        currentInput = "";
        break;
      case "fact":
        result = factorial(value);
        currentInput = result.toString();
        break;
      case "pow":
        expression += currentInput + "**";
        currentInput = "";
        break;
      case "brac":
        currentInput += openBracket ? "(" : ")";
        openBracket = !openBracket;
        break;
    }
  }

  function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    return n <= 1 ? 1 : n * factorial(n - 1);
  }

  function handleAction(action) {
    switch (action) {
      case "clear":
        resetCalculator();
        break;
      case "equals":
        calculate();
        break;
      case "percent":
        currentInput = (parseFloat(currentInput) / 100).toString();
        break;
      case "toggle-sign":
        currentInput = (parseFloat(currentInput) * -1).toString();
        break;
      case "sci-toggle":
        document.body.classList.toggle("scientific-mode");
        break;
    }
  }

  function calculate() {
    let fullExpression = expression + currentInput;
    try {
      const safeExpr = fullExpression.replace(/÷/g, "/").replace(/×/g, "*");

      let result = eval(safeExpr);

      if (isNaN(result) || !isFinite(result)) throw new Error("Invalid");

      addToHistory(fullExpression, result);
      currentInput = result.toString();
      expression = "";
      shouldResetDisplay = true;
    } catch {
      currentInput = "Error";
      expression = "";
      shouldResetDisplay = true;
    }
  }

  function resetCalculator() {
    currentInput = "";
    expression = "";
    shouldResetDisplay = false;
    document.querySelector('[data-action="clear"]').textContent = "AC";
  }

  function updateDisplay() {
    displayResult.textContent =
      currentInput.length > 9
        ? parseFloat(currentInput).toExponential(3)
        : currentInput || "0";
    displayExpression.textContent = expression;

    const clearBtn = document.querySelector('[data-action="clear"]');
    clearBtn.textContent = currentInput || expression ? "C" : "AC";
  }

  // --- History Logic ---
  const historyBtn = document.getElementById("history-btn");
  const closeHistoryBtn = document.getElementById("close-history-btn");
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  const historyPanel = document.getElementById("history-panel");
  const historyContent = document.getElementById("history-content");
  let calculationHistory = JSON.parse(localStorage.getItem("calcHistory")) || [];

  function addToHistory(expr, res) {
    calculationHistory.unshift({ expr, res });
    if (calculationHistory.length > 50) calculationHistory.pop();
    localStorage.setItem("calcHistory", JSON.stringify(calculationHistory));
    renderHistory();
  }

  function renderHistory() {
    historyContent.innerHTML = "";
    calculationHistory.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<div class="expr">${item.expr} =</div><div class="res">${item.res}</div>`;
      historyContent.appendChild(li);
    });
  }

  historyBtn.addEventListener("click", () => (historyPanel.style.left = "0"));
  closeHistoryBtn.addEventListener("click", () => (historyPanel.style.left = "-100%"));
  clearHistoryBtn.addEventListener("click", () => {
    calculationHistory = [];
    localStorage.removeItem("calcHistory");
    renderHistory();
  });

  // --- Time Logic ---
  const timeDisplay = document.getElementById("time-display");
  function updateTime() {
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    timeDisplay.textContent = now.toLocaleTimeString("en-US", options);
  }

  setInterval(updateTime, 1000);
  updateTime();
  renderHistory();
});
