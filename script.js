const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");
const clock = document.getElementById("clock");

const gridCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const gridRows = ['1', '2', '3', '4', '5'];
const spacingX = 100;
const spacingY = 100;
const offsetX = 50;
const offsetY = 50;

const points = {};
const marbleRadius = 10;
const initialMarbles = ['A1', 'D1', 'G1', 'A3', 'D3', 'G3', 'A5', 'D5', 'G5'];
let marbles = [...initialMarbles];
let maxMarbles = 9;

let isAM = true;
let selectedHour = null;

const moveMap = {
  1: ["G1", "F1"],
  2: ["G3", "F3"],
  3: ["G5", "F5"],
  4: ["A5", "B5"],
  5: ["A3", "B3"],
  6: ["A1", "B1"]
};

// Calculate all grid point coordinates
gridCols.forEach((colLetter, colIdx) => {
  gridRows.forEach((rowNumber, rowIdx) => {
    const label = `${colLetter}${rowNumber}`;
    points[label] = [
      offsetX + colIdx * spacingX,
      offsetY + rowIdx * spacingY
    ];
  });
});

const squarePath = ['B1', 'F1', 'F5', 'B5'];

function drawGridLines() {
  ctx.strokeStyle = "#ddd";
  for (let i = 0; i < gridCols.length; i++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + i * spacingX, offsetY);
    ctx.lineTo(offsetX + i * spacingX, offsetY + (gridRows.length - 1) * spacingY);
    ctx.stroke();
  }
  for (let i = 0; i < gridRows.length; i++) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + i * spacingY);
    ctx.lineTo(offsetX + (gridCols.length - 1) * spacingX, offsetY + i * spacingY);
    ctx.stroke();
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGridLines();

  // Outer blue rectangle
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.moveTo(...points["A1"]);
  ctx.lineTo(...points["G1"]);
  ctx.lineTo(...points["G5"]);
  ctx.lineTo(...points["A5"]);
  ctx.closePath();
  ctx.stroke();

  // Orange square path
  ctx.beginPath();
  ctx.strokeStyle = "orange";
  ctx.lineWidth = 2;
  squarePath.forEach((pt, idx) => {
    if (idx === 0) ctx.moveTo(...points[pt]);
    else ctx.lineTo(...points[pt]);
  });
  ctx.closePath();
  ctx.stroke();

  // Purple diagonals
  ctx.strokeStyle = "purple";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(...points["B1"]);
  ctx.lineTo(...points["F5"]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(...points["B5"]);
  ctx.lineTo(...points["F1"]);
  ctx.stroke();

  // Green center circle
  const center = points["D3"];
  const radius = Math.hypot(center[0] - points["D1"][0], center[1] - points["D1"][1]);
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Node dots and labels
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  for (const label in points) {
    const [x, y] = points[label];
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(label, x + 5, y - 5);
  }

  drawMarbles();
}

function drawMarbles() {
  ctx.fillStyle = "orange";
  marbles.forEach(m => {
    const [x, y] = m.includes(',') ? m.split(',').map(Number) : points[m];
    ctx.beginPath();
    ctx.arc(x, y, marbleRadius, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function getClickedPoint(x, y) {
  for (const label in points) {
    const [px, py] = points[label];
    const dist = Math.hypot(px - x, py - y);
    if (dist <= marbleRadius * 1.5) return label;
  }
  return null;
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const clickedLabel = getClickedPoint(x, y);
  if (!clickedLabel) return;

  const index = marbles.indexOf(clickedLabel);
  if (index === -1 && marbles.length < maxMarbles) {
    marbles.push(clickedLabel);
  } else if (index !== -1) {
    marbles.splice(index, 1);
  } else {
    alert("Maximum marbles placed. Remove one to add another.");
  }

  drawGrid();
});

function resetMarbles() {
  marbles = [...initialMarbles];
  drawGrid();
}

function toggleAmPm() {
  isAM = !isAM;
  document.getElementById("amPmBtn").textContent = isAM ? "AM" : "PM";

  if (selectedHour !== null) {
    onClockClick(selectedHour); // reapply move
  }
}

function onClockClick(hour) {
  if (!moveMap[hour]) return;

  const [from, to] = moveMap[hour];
  const src = isAM ? from : to;
  const dest = isAM ? to : from;

  const index = marbles.indexOf(src);
  if (index !== -1) {
    marbles[index] = dest;
  }

  drawGrid();
  highlightHour(hour);
}

function highlightHour(hour) {
  const allHours = document.querySelectorAll(".clock-hour");
  allHours.forEach(el => {
    el.setAttribute("fill", "black");
    el.setAttribute("font-weight", "normal");
  });

  const selected = document.querySelector(`[data-hour='${hour}']`);
  if (selected) {
    selected.setAttribute("fill", "red");
    selected.setAttribute("font-weight", "bold");
    selectedHour = hour;
  }
}

function renderClockNumbers() {
  for (let i = 1; i <= 12; i++) {
    const angle = (i - 3) * (Math.PI / 6);
    const x = 100 + 70 * Math.cos(angle);
    const y = 100 + 70 * Math.sin(angle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("data-hour", i);
    text.setAttribute("class", "clock-hour");
    text.textContent = i;

    text.addEventListener("click", () => {
      onClockClick(i);
    });

    clock.appendChild(text);
  }
}

// Initialize
renderClockNumbers();
drawGrid();
