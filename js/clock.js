// ===== CLOCK FUNCTIONS =====
function toggleAmPm() {
    isAM = !isAM;
    document.getElementById("amPmBtn").textContent = isAM ? "AM" : "PM";

    if (selectedHour !== null) {
        onClockClick(selectedHour);
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