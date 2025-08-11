// ===== CONSTANTS & VARIABLES =====
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

// Calculate grid point coordinates
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
