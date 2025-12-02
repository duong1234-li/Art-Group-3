const ns = "http://www.w3.org/2000/svg";
const snow = document.getElementById('snow');
const rain = document.getElementById('rain');
const floatingParticles = document.getElementById('floating-particles');
const windToggle = document.getElementById('wind-toggle');
const bubbles = document.getElementById('bubbles');
const stars = document.getElementById('stars');
const snowRateSlider = document.getElementById('snow-rate');
const rainRateSlider = document.getElementById('rain-rate');

let waterAnimationId = null;

const palettes = [
    { // Red (Default)
        'petal-back': '#aa0000',
        'petal-main': '#cc0000',
        'petal-inner': '#990000',
        'petal-extra-inner': '#ff0000',
        'stamen': '#ff3333'
    },
    { // Blue
        'petal-back': '#0000aa',
        'petal-main': '#0000cc',
        'petal-inner': '#000099',
        'petal-extra-inner': '#3333ff',
        'stamen': '#6666ff'
    },
    { // Pink/White
        'petal-back': '#fbeaf1',
        'petal-main': '#f8d4e5',
        'petal-inner': '#f4b9d2',
        'petal-extra-inner': '#ffc0cb',
        'stamen': '#f4b9d2'
    }
];
let currentPaletteIndex = 0;

function createSvgElement(tag, attributes) {
    const el = document.createElementNS(ns, tag);
    for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
    }
    return el;
}

function setupToggleButton(btnId, element, enableText, disableText) {
    document.getElementById(btnId).addEventListener('click', (e) => {
        const isEnabled = element.style.display === 'block';
        element.style.display = isEnabled ? 'none' : 'block';
        e.target.textContent = isEnabled ? enableText : disableText;
    });
}

function updateStarVisibility() {
    const isRainEnabled = rain.style.display === 'block';
    const isWaterEnabled = bubbles.style.display !== 'none';
    if (isRainEnabled || isWaterEnabled) {
        stars.style.display = 'none';
    } else {
        stars.style.display = 'block';
    }
}

document.getElementById('water-toggle').addEventListener('click', (e) => {
    const isWaterEnabled = bubbles.style.display !== 'none';

    if (!isWaterEnabled) {
        // Enable Water
        bubbles.style.display = 'block';
        document.querySelector('.leaves').style.filter = 'url(#water-ripple)';
        document.querySelector('g[filter="url(#bloom)"]').style.filter = 'url(#bloom) url(#water-ripple)';
        e.target.textContent = 'Disable Ocean';
        document.title = 'Fish';
        animateWater();
    } else {
        // Disable Water
        bubbles.style.display = 'none';
        document.querySelector('.leaves').style.filter = 'none';
        document.querySelector('g[filter="url(#bloom)"]').style.filter = 'url(#bloom)'; // Correctly reset filter
        e.target.textContent = 'Enable Ocean';
        document.title = 'Spider Lily';
        cancelAnimationFrame(waterAnimationId);
    }
    updateStarVisibility();
});

function animateWater() {
    let frames = 0;
    function step() {
        frames++;
        // Animate baseFrequency to simulate moving water
        const freq = 0.01 + 0.005 * Math.sin(frames * 0.01); document.querySelector('#water-ripple feTurbulence').setAttribute('baseFrequency', `${freq} ${freq}`);
        waterAnimationId = requestAnimationFrame(step);
    }
    step();
}

windToggle.addEventListener('click', (e) => {
    const isWindEnabled = document.body.classList.contains('wind-enabled');
    if (isWindEnabled) {
        document.body.classList.remove('wind-enabled');
        e.target.textContent = 'Enable Wind';
    } else {
        document.body.classList.add('wind-enabled');
        e.target.textContent = 'Disable Wind';
    }
    // Re-initialize particles to apply/remove wind effect
    recreateParticles();
    toggleFlowerSway();
});

function recreateParticles() {
    // Clear existing particles
    snow.innerHTML = '';
    rain.innerHTML = '';
    floatingParticles.innerHTML = '';
    bubbles.innerHTML = ''; // Bubbles are also recreated for simplicity

    // Recreate particles
    createSnow(snowRateSlider.value);
    createRain(rainRateSlider.value);
    createBubbles(40);
}

function toggleFlowerSway() {
    const isWindEnabled = document.body.classList.contains('wind-enabled');
    // Target the parent group of each flower (which includes the stem)
    const flowerHeads = document.querySelectorAll('.procedural-flower');

    flowerHeads.forEach((group, index) => {
        // Remove existing sway animation to avoid duplicates
        const existingAnims = group.querySelectorAll('.sway-animation');
        existingAnims.forEach(anim => anim.parentNode.removeChild(anim));

        // Only apply wind effect to half of the flowers (every other flower)
        if (isWindEnabled && index % 2 === 0) {
            const swayAnim = createSvgElement("animateTransform");
            swayAnim.setAttribute("attributeName", "transform");
            swayAnim.setAttribute("type", "rotate");
            swayAnim.setAttribute("repeatCount", "indefinite");
            swayAnim.setAttribute("additive", "sum"); // Add to existing transform
            swayAnim.classList.add('sway-animation'); // Class to find and remove it

            const swayAmount = 5 + Math.random() * 4; // e.g., 5-9 degrees
            const swayDuration = 3 + Math.random() * 2; // e.g., 3-5 seconds
            swayAnim.setAttribute("values", `0; ${swayAmount}; 0; -${swayAmount / 2}; 0`);
            swayAnim.setAttribute("dur", `${swayDuration}s`);

            group.appendChild(swayAnim);
        }
    });
}

function createSnow(count) {
    const isWindEnabled = document.body.classList.contains('wind-enabled');

    for (let i = 0; i < count; i++) {
        const cx = Math.random() * 800;
        const r = 1 + Math.random() * 2;
        const dur = 5 + Math.random() * 5;
        const delay = Math.random() * 5;

        const circle = createSvgElement("circle", { cx, cy: -10, r });

        const animCy = createSvgElement("animate");
        animCy.setAttribute("attributeName", "cy");
        animCy.setAttribute("from", -10);
        animCy.setAttribute("to", 810);
        animCy.setAttribute("dur", dur + "s");
        animCy.setAttribute("repeatCount", "indefinite");
        animCy.setAttribute("begin", delay + "s");

        const animCx = createSvgElement("animate");
        animCx.setAttribute("attributeName", "cx");
        animCx.setAttribute("repeatCount", "indefinite");
        animCx.setAttribute("begin", delay + "s");

        if (isWindEnabled) {
            animCx.setAttribute("from", -100);
            animCx.setAttribute("to", 900);
            animCx.setAttribute("dur", (dur * 0.75) + "s"); // Set a fixed faster speed for wind
        } else {
            animCx.setAttribute("values", `${cx};${cx + 20};${cx}`);
            animCx.setAttribute("dur", (dur / 2) + "s");
        }

        circle.appendChild(animCy);
        circle.appendChild(animCx);
        snow.appendChild(circle);
    }
}

function createRain(count) {
    const isWindEnabled = document.body.classList.contains('wind-enabled');
    const windStrength = 300; // Fixed horizontal push
    const windDurationFactor = 1.0; // Fixed duration factor

    for (let i = 0; i < count; i++) {
        const x = Math.random() * 800;
        const y1 = -20 - Math.random() * 30;
        const len = 20 + Math.random() * 20;
        const y2 = y1 + len;
        const dur = 0.5 + Math.random() * 0.5;
        const delay = Math.random() * 2;

        let x1_start = x;
        let x2_start = x;
        if (isWindEnabled) {
            x1_start = x - windStrength;
        }

        const line = createSvgElement("line", { x1: x1_start, x2: x2_start, y1, y2 });

        const animY1 = createSvgElement("animate");
        animY1.setAttribute("attributeName", "y1");
        animY1.setAttribute("from", y1);
        animY1.setAttribute("to", 800);
        animY1.setAttribute("dur", dur + "s");
        animY1.setAttribute("repeatCount", "indefinite");
        animY1.setAttribute("begin", delay + "s");

        const animY2 = createSvgElement("animate");
        animY2.setAttribute("attributeName", "y2");
        animY2.setAttribute("from", y2);
        animY2.setAttribute("to", 800 + len);
        animY2.setAttribute("dur", dur + "s");
        animY2.setAttribute("repeatCount", "indefinite");
        animY2.setAttribute("begin", delay + "s");

        if (isWindEnabled) {
            const animX1 = createSvgElement("animate");
            animX1.setAttribute("attributeName", "x1");
            animX1.setAttribute("from", x1_start);
            animX1.setAttribute("to", x1_start + windStrength * 2);
            animX1.setAttribute("dur", (dur * windDurationFactor) + "s");
            animX1.setAttribute("repeatCount", "indefinite");
            animX1.setAttribute("begin", delay + "s");

            const animX2 = createSvgElement("animate");
            animX2.setAttribute("attributeName", "x2");
            animX2.setAttribute("from", x2_start);
            animX2.setAttribute("to", x2_start + windStrength * 2);
            animX2.setAttribute("dur", (dur * windDurationFactor) + "s");
            animX2.setAttribute("repeatCount", "indefinite");
            animX2.setAttribute("begin", delay + "s");

            line.appendChild(animX1);
            line.appendChild(animX2);
        }

        line.appendChild(animY1);
        line.appendChild(animY2);
        rain.appendChild(line);
    }
}

function createFloatingParticles(count) {
    const isWindEnabled = document.body.classList.contains('wind-enabled');

    for (let i = 0; i < count; i++) {
        const cx = Math.random() * 800;
        const cy = Math.random() * 800;
        const r = 1 + Math.random() * 2;
        const dur = 2 + Math.random() * 3;
        const delay = Math.random() * 5;
        const floatDist = 50 + Math.random() * 100;

        const circle = createSvgElement("circle", { cx, cy, r });

        const animCy = createSvgElement("animate");
        animCy.setAttribute("attributeName", "cy");
        animCy.setAttribute("from", cy);
        animCy.setAttribute("to", cy - floatDist);
        animCy.setAttribute("dur", dur + "s");
        animCy.setAttribute("repeatCount", "indefinite");
        animCy.setAttribute("begin", delay + "s");

        const animOpacity = createSvgElement("animate");
        animOpacity.setAttribute("attributeName", "opacity");
        animOpacity.setAttribute("values", "0;0.8;0");
        animOpacity.setAttribute("dur", dur + "s");
        animOpacity.setAttribute("repeatCount", "indefinite");
        animOpacity.setAttribute("begin", delay + "s");

        if (isWindEnabled) {
            const animCx = createSvgElement("animate");
            animCx.setAttribute("attributeName", "cx");
            animCx.setAttribute("from", cx);
            animCx.setAttribute("to", cx + 200 + Math.random() * 150);
            animCx.setAttribute("dur", (dur * 1.5) + "s");
            animCx.setAttribute("repeatCount", "indefinite");
            animCx.setAttribute("begin", delay + "s");
            circle.appendChild(animCx);
        }

        circle.appendChild(animCy);
        circle.appendChild(animOpacity);
        floatingParticles.appendChild(circle);
    }
}

function createBubbles(count) {
    for (let i = 0; i < count; i++) {
        const cx = Math.random() * 800;
        const r = 2 + Math.random() * 6;
        const dur = 3 + Math.random() * 5;
        const delay = Math.random() * 5;

        const circle = createSvgElement("circle", { cx, cy: 850, r });

        const animCy = createSvgElement("animate");
        animCy.setAttribute("attributeName", "cy");
        animCy.setAttribute("from", 850);
        animCy.setAttribute("to", -50);
        animCy.setAttribute("dur", dur + "s");
        animCy.setAttribute("repeatCount", "indefinite");
        animCy.setAttribute("begin", delay + "s");

        const animCx = createSvgElement("animate");
        animCx.setAttribute("attributeName", "cx");
        animCx.setAttribute("values", `${cx};${cx + 20};${cx - 20};${cx}`);
        animCx.setAttribute("dur", (dur / 1.5) + "s");
        animCx.setAttribute("repeatCount", "indefinite");

        circle.appendChild(animCy);
        circle.appendChild(animCx);
        bubbles.appendChild(circle);
    }
}

function generatePetalGroup(petalId, rotations) {
    const group = createSvgElement("g");
    rotations.forEach(r => {
        const petal = createSvgElement("use", {
            "href": `#${petalId}`,
            "transform": `rotate(${r})`
        });
        group.appendChild(petal);
    });
    return group;
}

function initializeArt() {
    const floret = document.getElementById('floret');
    floret.appendChild(generatePetalGroup("petal-back", [15, 75, 135, 195, 255, 315]));
    floret.appendChild(generatePetalGroup("petal-main", [0, 60, 120, 180, 240, 300]));
    floret.appendChild(generatePetalGroup("petal-inner", [30, 90, 150, 210, 270, 330]));
    floret.appendChild(generatePetalGroup("petal-extra-inner", [45, 105, 165, 225, 285, 345]));

    generateFlowers();
}

function generateFlowers() {
    const flowers = document.querySelectorAll('.procedural-flower');
    const currentPalette = palettes[currentPaletteIndex];
    flowers.forEach(flower => {
        // 1. Create Stamen Cluster
        const stamenGroup = createSvgElement("g", { "transform": `scale(0.9)`, "class": "stamen-cluster" });
        (function createStamens() {
            // Use fixed steps for angles to ensure ball shape, with jitter
            const startAngle = -85;
            const endAngle = 85;
            const step = 15; // Denser step for better coverage

            for (let baseAngle = startAngle; baseAngle <= endAngle; baseAngle += step) {
                // Add randomness to the angle
                const angleJitter = -5 + Math.random() * 10;
                const angle = baseAngle + angleJitter;

                // Randomize length
                const lenScale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

                const stamen = createSvgElement("g", { "transform": `rotate(${angle})` });
                const path = createSvgElement("path");
                const length = 140 * lenScale;

                // Calculate curve bias to make tips face up
                // If angle is positive (right), we want to curve left (negative x)
                // If angle is negative (left), we want to curve right (positive x)
                // This counteracts the rotation to make the tip point more vertically
                const curveBias = -angle * 0.8;

                // Control points
                // cp1: slight bias
                const cp1x = (Math.random() * 10 - 5) + (curveBias * 0.2);
                const cp1y = -length * 0.3;

                // cp2: stronger bias
                const cp2x = (Math.random() * 20 - 10) + (curveBias * 0.6);
                const cp2y = -length * 0.7;

                // end: strongest bias (tip points up)
                const endx = (Math.random() * 10 - 5) + curveBias;
                const endy = -length;

                Object.assign(path, { d: `M0,0 C${cp1x},${cp1y} ${cp2x},${cp2y} ${endx},${endy}`, stroke: currentPalette.stamen, "stroke-width": "0.8", fill: "none" });

                stamen.appendChild(path);
                stamenGroup.appendChild(stamen);
            }
            // Add foreshortened stamens in center (randomized)
            for (let i = 0; i < 3; i++) {
                const stamen = createSvgElement("g", { "transform": `rotate(${-20 + Math.random() * 40})` });
                const path = createSvgElement("path");
                // Base short curve: M0,0 Q10,-30 20,-50
                const scale = 0.8 + Math.random() * 0.4;
                const qx = 10 * scale + (Math.random() * 5);
                const qy = -30 * scale + (Math.random() * 5);
                const ex = 20 * scale + (Math.random() * 5);
                const ey = -50 * scale + (Math.random() * 5);

                Object.assign(path, { d: `M0,0 Q${qx},${qy} ${ex},${ey}`, stroke: currentPalette.stamen, "stroke-width": "0.8", fill: "none" });

                stamen.appendChild(path);
                stamenGroup.appendChild(stamen);
            }
        })();
        flower.appendChild(stamenGroup);

        // 2. Add Floret (the petals)
        const floretInstance = createSvgElement("use", {
            "href": "#floret",
            "transform": "scale(1)" // Ensure it faces the screen
        });

        flower.appendChild(floretInstance);

    });
}

function createStars(count) {
    if (!stars) return;

    for (let i = 0; i < count; i++) {
        const cx = Math.random() * 800;
        const cy = Math.random() * 350; // Only generate stars in the top portion of the sky
        const r = 0.5 + Math.random() * 1; // Small stars (0.5 to 1.5 radius)

        const circle = createSvgElement("circle", { cx, cy, r, fill: "#ffffff" });

        // Create a twinkling animation
        const animOpacity = createSvgElement("animate");
        animOpacity.setAttribute("attributeName", "opacity");

        const baseOpacity = 0.4 + Math.random() * 0.5; // Random base brightness
        const peakOpacity = Math.min(1, baseOpacity + 0.3);
        animOpacity.setAttribute("values", `${baseOpacity};${peakOpacity};${baseOpacity}`);

        const dur = 3 + Math.random() * 5; // Twinkle duration 3-8s
        const delay = Math.random() * 8; // Random start delay
        animOpacity.setAttribute("dur", dur + "s");
        animOpacity.setAttribute("begin", delay + "s");
        animOpacity.setAttribute("repeatCount", "indefinite");

        circle.appendChild(animOpacity);
        stars.appendChild(circle);
    }
}

// --- Slider Event Listeners ---
snowRateSlider.addEventListener('input', (e) => {
    if (snow.style.display === 'block') {
        snow.innerHTML = '';
        createSnow(e.target.value);
    }
});

rainRateSlider.addEventListener('input', (e) => {
    if (rain.style.display === 'block') {
        rain.innerHTML = '';
        createRain(e.target.value);
    }
});

document.getElementById('color-toggle').addEventListener('click', () => {
    // Cycle to the next palette
    currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
    const newPalette = palettes[currentPaletteIndex];

    // Update petal definitions
    document.getElementById('petal-back').setAttribute('fill', newPalette['petal-back']);
    document.getElementById('petal-main').setAttribute('fill', newPalette['petal-main']);
    document.getElementById('petal-inner').setAttribute('fill', newPalette['petal-inner']);
    document.getElementById('petal-extra-inner').setAttribute('fill', newPalette['petal-extra-inner']);

    // Clear and regenerate flowers to apply new stamen colors
    const flowerHeads = document.querySelectorAll('.procedural-flower');
    flowerHeads.forEach(head => {
        head.innerHTML = ''; // Clear existing petals and stamens
    });
    generateFlowers();
    toggleFlowerSway(); // Re-apply wind effect if active
});

// Custom toggle for snow to also show/hide the slider
const snowSliderContainer = document.getElementById('snow-slider-container');
document.getElementById('snow-toggle').addEventListener('click', (e) => {
    const isSnowEnabled = snow.style.display === 'block';
    if (isSnowEnabled) {
        snow.style.display = 'none';
        snowSliderContainer.style.display = 'none';
        e.target.textContent = 'Enable Snow';
    } else {
        snow.style.display = 'block';
        snowSliderContainer.style.display = 'flex';
        e.target.textContent = 'Disable Snow';
    }
});

// Custom toggle for rain to also hide/show stars and slider
const rainSliderContainer = document.getElementById('rain-slider-container');
document.getElementById('rain-toggle').addEventListener('click', (e) => {
    const isRainEnabled = rain.style.display === 'block';
    if (isRainEnabled) {
        rain.style.display = 'none';
        rainSliderContainer.style.display = 'none';
        e.target.textContent = 'Enable Rain';
    } else {
        rain.style.display = 'block';
        rainSliderContainer.style.display = 'flex';
        e.target.textContent = 'Disable Rain';
    }
    updateStarVisibility();
});

recreateParticles(); // Initial particle creation
toggleFlowerSway(); // Apply initial wind state if any (e.g. if we set it by default)
createStars(150); // Add 150 stars to the background
initializeArt();