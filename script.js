const workoutPlan = {
  pull: [
    { name: "Dead Hang", type: "standard" }, // cite: 9
    { name: "Hyper Extension", type: "standard" }, // cite: 10
    { name: "Lats", type: "choice", options: ["Lat Pullover", "Lat Pulldown"] }, // cite: 13, 14
    { name: "Upper Back", type: "choice", options: ["Seated Cable Rows", "T-Bar Row"] }, // cite: 17, 18
    { name: "Biceps", type: "choice", options: ["Preacher Curls", "Normal Curls", "Spider Curls"] }, // cite: 27, 29, 30
    { name: "Core (2 sets to failure)", type: "standard" } // cite: 156
  ],
  push: [
    { name: "Dumbbell Bench Press", type: "standard" }, // cite: 35
    { name: "Shoulder Press", type: "standard" }, // cite: 41
    { name: "Lateral Raises", type: "standard" }, // cite: 47
    { name: "Rear Delt Fly", type: "standard" }, // cite: 53
    { name: "Tricep Pushdown", type: "standard" }, // cite: 122
    { name: "Skull Crushers", type: "standard" }, // cite: 124
    { name: "Core (2 sets to failure)", type: "standard" } // cite: 156
  ],
  leg: [
    { name: "Compound Lift", type: "choice", options: ["Leg Press", "Squats"] }, // cite: 128
    { name: "Knee Extension", type: "standard" }, // cite: 134
    { name: "Hip Thrusts", type: "standard" }, // cite: 136
    { name: "Hamstring Curls", type: "standard" }, // cite: 138
    { name: "Calf Raises", type: "standard" }, // cite: 147
    { name: "Core (2 sets to failure)", type: "standard" } // cite: 156
  ]
};

const daySelect = document.getElementById("daySelect");
const exerciseList = document.getElementById("exerciseList");
const storageKey = (day) => `workoutTracker_v2_${day}`;

function loadData(day) {
  const saved = localStorage.getItem(storageKey(day));
  return saved ? JSON.parse(saved) : {};
}

function saveData(day, data) {
  localStorage.setItem(storageKey(day), JSON.stringify(data));
}

function render() {
  const day = daySelect.value;
  const dayData = loadData(day);
  exerciseList.innerHTML = "";

  workoutPlan[day].forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "exercise-item";
    
    if (item.type === "choice") {
      const selected = dayData[`choice_${index}`] || null;
      div.innerHTML = `
        <div class="choice-container">
          <span class="choice-label">${item.name} (Pick One)</span>
          <div class="choice-buttons">
            ${item.options.map(opt => `
              <button class="choice-btn ${selected === opt ? 'selected' : ''}" 
                      onclick="makeChoice('${day}', ${index}, '${opt}')">${opt}</button>
            `).join('')}
          </div>
        </div>
      `;
      
      if (selected) {
        div.innerHTML += renderExerciseRow(selected, dayData[selected] || {});
        if (dayData[selected]?.checked) div.classList.add("checked");
      }
    } else {
      div.innerHTML = renderExerciseRow(item.name, dayData[item.name] || {});
      if (dayData[item.name]?.checked) div.classList.add("checked");
    }
    
    exerciseList.appendChild(div);
  });
}

function renderExerciseRow(name, data) {
  return `
    <div style="margin-top: 15px; border-top: 1px solid #1a1a1a; padding-top: 15px;">
      <div class="exercise-header">
        <span class="exercise-name">${name}</span>
        <label class="done-label">
          DONE <input type="checkbox" ${data.checked ? 'checked' : ''} 
                onchange="toggleCheck('${name}', this.checked)">
        </label>
      </div>
      <input type="text" class="pr-input" placeholder="Set PR (e.g. 50kg x 10)" 
             value="${data.pr || ''}" onblur="updatePR('${name}', this.value)">
    </div>
  `;
}

window.makeChoice = (day, index, val) => {
  const data = loadData(day);
  data[`choice_${index}`] = val;
  saveData(day, data);
  render();
};

window.toggleCheck = (name, val) => {
  const day = daySelect.value;
  const data = loadData(day);
  if (!data[name]) data[name] = {};
  data[name].checked = val;
  saveData(day, data);
  render();
};

window.updatePR = (name, val) => {
  const day = daySelect.value;
  const data = loadData(day);
  if (!data[name]) data[name] = {};
  data[name].pr = val;
  saveData(day, data);
};

document.getElementById("resetDayBtn").onclick = () => {
  const day = daySelect.value;
  const data = loadData(day);
  Object.keys(data).forEach(k => { if(data[k].checked !== undefined) data[k].checked = false; });
  saveData(day, data);
  render();
};

document.getElementById("clearAllBtn").onclick = () => {
  if(confirm("Erase all progress and PRs?")) {
    Object.keys(workoutPlan).forEach(d => localStorage.removeItem(storageKey(d)));
    render();
  }
};

daySelect.onchange = render;
render();