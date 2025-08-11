// ===== DRAWING =====
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

    // Outer rectangle
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

    // Node dots & labels
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