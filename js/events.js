// ===== EVENT HANDLERS =====
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
