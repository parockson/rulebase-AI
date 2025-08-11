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

    // ===== Find intersections between diagonals and circle =====
    const diagonals = [
        [points["B1"], points["F5"]],
        [points["B5"], points["F1"]]
    ];
    const intersections = [];

    diagonals.forEach(line => {
        const [p1, p2] = line;
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];

        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (p1[0] - center[0]) + dy * (p1[1] - center[1]));
        const c = Math.pow(p1[0] - center[0], 2) + Math.pow(p1[1] - center[1], 2) - Math.pow(radius, 2);
        const det = b * b - 4 * a * c;

        if (det >= 0) {
            const t1 = (-b - Math.sqrt(det)) / (2 * a);
            const t2 = (-b + Math.sqrt(det)) / (2 * a);

            if (t1 >= 0 && t1 <= 1) intersections.push([p1[0] + t1 * dx, p1[1] + t1 * dy]);
            if (t2 >= 0 && t2 <= 1) intersections.push([p1[0] + t2 * dx, p1[1] + t2 * dy]);
        }
    });

    // ===== Draw intersection points & store them in points =====
    intersections.forEach((pt, i) => {
        const label = `α${i + 1}`;
        points[label] = pt; // store coordinate

        // Draw red intersection dot
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 6, 0, 2 * Math.PI);
        ctx.fill();

        // Draw label background
        ctx.fillStyle = "white";
        ctx.fillRect(pt[0] + 10, pt[1] - 20, 40, 18);

        // Draw label text
        ctx.fillStyle = "red";
        ctx.font = "bold 16px Arial";
        ctx.fillText(label, pt[0] + 15, pt[1] - 7);
    });

    // Node dots & labels (including α points)
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