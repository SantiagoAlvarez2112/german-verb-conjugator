// === CONFIG ===
let currentLevel = null;
let currentType = null;
let currentTense = null;
let loadedVerbs = {}; // Loaded JSON data per level

const allTenses = [
  "Präsens",
  "Perfekt",
  "Präteritum",
  "Futur I",
  "Plusquamperfekt",
  "Konjunktiv I",
  "Passiv",
  "Konjunktiv II",
  "Futur II",
  "Imperativ"
];

const tensesByLevel = {
  A1: allTenses,
  A2: allTenses,
  B1: allTenses,
  B2: allTenses,
  C1: allTenses,
  C2: allTenses
};

// === SHOW LEVEL ===
function showLevel(level) {
  currentLevel = level;
  currentType = null;
  currentTense = null;

  const verbTypes = ["Regular", "Irregular", "Modal", "Separable", "Reflexive", "Mixed"];
  const container = document.getElementById("levelContent");

  container.innerHTML = `<h2>Level ${level}</h2><p>Choose a verb type to practice:</p>`;

  verbTypes.forEach(type => {
    const div = document.createElement("div");
    div.className = "verb-type";
    div.innerHTML = `<strong>${type} Verbs</strong>`;
    div.onclick = () => loadVerbs(level, type);
    container.appendChild(div);
  });
}

// === LOAD VERBS ===
function loadVerbs(level, type) {
  currentType = type;
  const container = document.getElementById("levelContent");

  if (loadedVerbs[level]) {
    showVerbList(loadedVerbs[level][type.toLowerCase()]);
  } else {
    fetch(`verbs_${level}.json`)
      .then(res => res.json())
      .then(data => {
        loadedVerbs[level] = data[level];
        showVerbList(data[level][type.toLowerCase()]);
      })
      .catch(err => {
        container.innerHTML = `<p>Error loading verbs: ${err}</p>`;
      });
  }
}

// === SHOW VERB LIST BEFORE GAME ===
function showVerbList(verbs) {
  const container = document.getElementById("levelContent");
  const verbKeys = Object.keys(verbs).sort();

  container.innerHTML = `
    <h2>${currentLevel} > ${currentType} Verbs</h2>
    <button onclick="showTenses('${currentType}')">🎲 Practice Random Verb</button>
    <table border="1" style="margin: 20px auto;">
      <tr><th>Verb</th><th>Translation</th><th>Preposition</th><th>Partizip 1</th><th>Auxiliary</th><th>Practice</th></tr>
      ${verbKeys.map(v => {
        const tenses = Object.keys(verbs[v].tenses);
        return `
        <tr>
          <td>${v}</td>
          <td>${verbs[v].translation}</td>
          <td>${verbs[v].preposition || '-'}</td>
          <td>${verbs[v].partizip1 || '-'}</td>
          <td>${verbs[v].auxiliary || '-'}</td>
          <td>
            <select onchange="practiceSingleVerb('${v}', this.value)">
              <option value="">Choose Tense</option>
              ${tenses.map(t => `<option value="${t}">${t}</option>`).join("")}
            </select>
          </td>
        </tr>`;
      }).join("")}
    </table>
    <button class="back" onclick="showLevel('${currentLevel}')">⬅ Back to Verb Types</button>
  `;
}

// === SHOW TENSES ===
function showTenses(type) {
  currentType = type;
  const tenses = tensesByLevel[currentLevel];
  const container = document.getElementById("levelContent");

  container.innerHTML = `<h2>${currentLevel} > ${type} Verbs</h2><p>Choose a verb tense to practice:</p>`;

  tenses.forEach(tense => {
    const div = document.createElement("div");
    div.className = "verb-type";
    div.innerHTML = `<strong>${tense}</strong>`;
    div.onclick = () => startGame(currentLevel, type, tense);
    container.appendChild(div);
  });

  const backBtn = document.createElement("button");
  backBtn.textContent = "⬅ Back to Verb List";
  backBtn.onclick = () => showVerbList(loadedVerbs[currentLevel][type.toLowerCase()]);
  container.appendChild(document.createElement("br"));
  container.appendChild(backBtn);
}

// === START GAME ===
function practiceSingleVerb(verb, tense) {
  if (!tense) return;
  startGame(currentLevel, currentType, tense, verb);
}

function startGame(level, type, tense, specificVerb = null) {
  currentTense = tense;
  const verbSet = loadedVerbs[level]?.[type.toLowerCase()];
  if (!verbSet) return alert("No verbs found!");

  const verbKeys = Object.keys(verbSet);
  const selectedVerb = specificVerb || verbKeys[Math.floor(Math.random() * verbKeys.length)];
  const verbData = verbSet[selectedVerb];

  const container = document.getElementById("levelContent");
container.innerHTML = `
  <h2>${level} > ${type} > ${tense}</h2>
  <p><strong>Verb:</strong> ${selectedVerb}</p>
  <p><strong>Meaning:</strong> ${verbData.translation}</p>
  ${verbData.auxiliary ? `<p><strong>Auxiliary:</strong> ${verbData.auxiliary}</p>` : ""}
  ${verbData.preposition ? `<p><strong>⚠️ Preposition:</strong> ${verbData.preposition}</p>` : ""}
  ${verbData.partizip1 ? `<p><strong>🟡 Partizip 1:</strong> ${verbData.partizip1}</p>` : ""}
  <div id="inputsContainer"></div>
  <button onclick="checkAnswers('${selectedVerb}', '${level}', '${type}', '${tense}')">Check Answers</button>
  <button onclick="startGame('${level}', '${type}', '${tense}')">🔁 Next Verb</button>
  <div id="result"></div>
  <button onclick="showTenses('${type}')">⬅ Back to Tenses</button>
`;

  const isImperativ = (tense === "Imperativ");
  const pronouns = isImperativ ? ["du", "wir", "ihr", "Sie"] : ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
  const inputsDiv = document.getElementById("inputsContainer");
  inputsDiv.innerHTML = "";

  if (verbData.tenses[tense]) {
    pronouns.forEach(pronoun => {
      const div = document.createElement("div");
      div.innerHTML = `
        <label>${pronoun}: <input type="text" id="input-${pronoun}" /></label>
      `;
      inputsDiv.appendChild(div);
    });
  } else {
    inputsDiv.innerHTML = "<p>This tense is not available for this verb.</p>";
  }
}

// === CHECK ANSWERS ===
function checkAnswers(verb, level, type, tense) {
  const verbData = loadedVerbs[level][type.toLowerCase()][verb];
  const correct = verbData.tenses[tense];
  const isImperativ = (tense === "Imperativ");
  const pronouns = isImperativ ? ["du", "ihr", "Sie"] : ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

  let output = "";
  let score = 0;

  pronouns.forEach(pronoun => {
    const inputEl = document.getElementById(`input-${pronoun}`);
    const userInput = inputEl.value.trim().toLowerCase();
    const correctAnswer = correct[pronoun]?.toLowerCase();

    inputEl.classList.remove("correct", "incorrect");

    if (userInput === correctAnswer) {
      inputEl.classList.add("correct");
      output += `<p>${pronoun}: ✅</p>`;
      score++;
    } else {
      inputEl.classList.add("incorrect");
      output += `<p>${pronoun}: ❌ (Correct: ${correctAnswer})</p>`;
    }
  });

  document.getElementById("result").innerHTML = output;

  if (score === pronouns.length) {
  document.getElementById("customModal").style.display = "block";
  }
}
function closeModal() {
  document.getElementById("customModal").style.display = "none";
  startGame(currentLevel, currentType, currentTense);
}

// === TOGGLE THEME ===
function toggleTheme() {
  const body = document.body;
  const toggle = document.getElementById("themeToggle");

  if (toggle.checked) {
    body.classList.remove("light");
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.remove("dark");
    body.classList.add("light");
    localStorage.setItem("theme", "light");
  }
}

// === LOAD SAVED THEME ON STARTUP ===
window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.classList.add(savedTheme);
  document.getElementById("themeToggle").checked = savedTheme === "dark";
};
