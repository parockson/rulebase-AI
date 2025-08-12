// drawing.js
// Assumes constants.js has already created:
// canvas, ctx, gridCols, gridRows, spacingX, spacingY, offsetX, offsetY,
// points (object), marbles (array of labels like "A1"), squarePath, marbleRadius

// ====== GRID LINES & BOARD DRAWING (kept identical to your original) ======
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

function ensureAlphaPoints() {
    // calculate α points as intersections of the diagonals and the center circle
    const center = points["D3"];
    const radius = Math.hypot(center[0] - points["D1"][0], center[1] - points["D1"][1]);
    const r = radius;
    const cx = center[0];
    const cy = center[1];
    const offset = r / Math.sqrt(2);

    // assign (will override every frame but that's fine)
    points["α1"] = [cx + offset, cy - offset]; // top-right
    points["α2"] = [cx + offset, cy + offset]; // bottom-right
    points["α3"] = [cx - offset, cy + offset]; // bottom-left
    points["α4"] = [cx - offset, cy - offset]; // top-left
}

function drawBoard() {
    // draws only the board (rectangle, square path, diagonals, circle, nodes)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridLines();

    // Outer rectangle (blue)
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.moveTo(...points["A1"]);
    ctx.lineTo(...points["G1"]);
    ctx.lineTo(...points["G5"]);
    ctx.lineTo(...points["A5"]);
    ctx.closePath();
    ctx.stroke();

    // Orange square path (use your squarePath variable)
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

    // Ensure α points exist (based on the circle)
    ensureAlphaPoints();

    // Draw alpha points (red) for debugging/visual
    ctx.fillStyle = "red";
    ctx.font = "12px Arial";
    ["α1", "α2", "α3", "α4"].forEach((lbl, i) => {
        const p = points[lbl];
        if (!p) return;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(lbl, p[0] + 6, p[1] - 6);
    });

    // Node dots & labels (regular grid points)
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    for (const label in points) {
        // skip α labels when drawing the normal nodes so they don't duplicate label text
        if (label.startsWith("α")) continue;
        const [x, y] = points[label];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(label, x + 5, y - 5);
    }
}


// ====== HUMAN (marble) ANIMATION SYSTEM ======

// Internal state for each marble (keeps animated x,y, target,walking phase, etc.)
let marbleStates = [];

// Convert a label like "B3" or "150,250" to numeric [x,y]
function labelToPoint(label) {
    if (!label) return [0, 0];
    if (Array.isArray(label)) return label;
    if (typeof label === "string" && label.includes(",")) {
        const [sx, sy] = label.split(",").map(Number);
        return [sx, sy];
    }
    // fallback to points map (undefined labels become [0,0])
    return points[label] ? [points[label][0], points[label][1]] : [0, 0];
}

function initMarbleStates() {
    marbleStates = marbles.map(m => {
        const [x, y] = labelToPoint(m);
        return {
            label: m, // current logical label (e.g., "A1")
            x,
            y, // current draw position
            sx: x,
            sy: y, // start pos for current move
            tx: x,
            ty: y, // target pos for current move
            startTime: 0,
            duration: 400,
            moving: false,
            phase: Math.random() * Math.PI * 2 // for leg/arm swing
        };
    });
}

// Easing function
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Public function: move a marble from its current label/index to target label or coords
// startArg can be a label string ("A1") or an index (0-based)
function moveHuman(startArg, endLabelOrCoords, duration = 500) {
    // ensure alpha points exist so target resolves if it's α
    ensureAlphaPoints();

    let idx = -1;
    if (typeof startArg === "number") idx = startArg;
    else idx = marbles.indexOf(startArg);

    if (idx === -1) {
        console.warn("moveHuman: start marble not found:", startArg);
        return;
    }

    const st = marbleStates[idx];
    const [tx, ty] = labelToPoint(endLabelOrCoords);

    // setup move
    st.sx = st.x;
    st.sy = st.y;
    st.tx = tx;
    st.ty = ty;
    st.startTime = performance.now();
    st.duration = duration;
    st.moving = true;
    st.nextLabel = (typeof endLabelOrCoords === "string") ? endLabelOrCoords : `${tx},${ty}`;

    // do NOT immediately change the marbles[] label - wait until animation finishes
}

// Draw a single humanoid at (x,y) with swinging limbs based on phase
function drawHumanAvatar(x, y, phase, isMoving, facingAngle = 0) {
    ctx.save();
    ctx.translate(x, y);

    // bobbing while walking
    const bob = Math.sin(phase) * (isMoving ? 3 : 1);

    // rotate small amount toward movement direction for a natural look
    ctx.rotate(facingAngle * 0.12);

    // head
    ctx.beginPath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.arc(0, -10 + bob, 5, 0, Math.PI * 2);
    ctx.stroke();

    // torso
    ctx.beginPath();
    ctx.moveTo(0, -5 + bob);
    ctx.lineTo(0, 10 + bob);
    ctx.stroke();

    // arms (swing opposite to legs)
    const armSwing = Math.sin(phase * 1.8) * (isMoving ? 8 : 3);
    ctx.beginPath();
    ctx.moveTo(0, 0 + bob);
    ctx.lineTo(-8, 0 + bob + armSwing * 0.06);
    ctx.moveTo(0, 0 + bob);
    ctx.lineTo(8, 0 + bob - armSwing * 0.06);
    ctx.stroke();

    // legs
    const legSwing = Math.sin(phase * 1.8) * (isMoving ? 8 : 3);
    ctx.beginPath();
    ctx.moveTo(0, 10 + bob);
    ctx.lineTo(-6, 22 + bob + legSwing * 0.06);
    ctx.moveTo(0, 10 + bob);
    ctx.lineTo(6, 22 + bob - legSwing * 0.06);
    ctx.stroke();

    ctx.restore();
}

// Draw all humanoids using marbleStates
function drawHumansAnimated() {
    const now = performance.now();
    marbleStates.forEach((st, idx) => {
        // If marble state label doesn't match marbles[idx], resync (keeps things robust if marbles array changed externally)
        if (st.label !== marbles[idx]) {
            const p = labelToPoint(marbles[idx]);
            st.label = marbles[idx];
            st.x = p[0];
            st.y = p[1];
            st.sx = st.x;
            st.sy = st.y;
            st.tx = st.x;
            st.ty = st.y;
            st.moving = false;
        }

        // Advance movement if moving
        if (st.moving) {
            const t = Math.min(1, (now - st.startTime) / st.duration);
            const e = easeInOutQuad(t);
            st.x = st.sx + (st.tx - st.sx) * e;
            st.y = st.sy + (st.ty - st.sy) * e;

            // update facing angle for rotation effect
            const facing = Math.atan2(st.ty - st.sy, st.tx - st.sx);

            // draw humanoid at interpolated position
            drawHumanAvatar(st.x, st.y, st.phase, true, facing);

            if (t >= 1) {
                // finalize movement: update logical marble label and stopping state
                st.moving = false;
                st.label = st.nextLabel || st.label;
                marbles[idx] = st.label; // update the logical marbles array
                // make sure state positions are exactly at target
                st.x = st.tx;
                st.y = st.ty;
            }
        } else {
            // standing draw
            drawHumanAvatar(st.x, st.y, st.phase, false, 0);
        }

        // advance phase for swing/bob
        st.phase += st.moving ? 0.18 : 0.04;
    });
}


// ====== MAIN ANIMATION LOOP ======
function animateLoop() {
    // draw board (will also ensure α points exist)
    drawBoard();

    // draw animated humans on top
    drawHumansAnimated();

    requestAnimationFrame(animateLoop);
}

// ====== Initialization ======
initMarbleStates();
requestAnimationFrame(animateLoop);

// ====== Public helper (optional) ======
window.moveHuman = moveHuman; // call from console or other code: moveHuman("A1", "B1", 600)
window.initMarbleStates = initMarbleStates; // call this if you change marbles[] programmatically