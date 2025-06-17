// Get references to all the necessary HTML elements using their IDs
const currentBallsDisplay = document.getElementById('current-balls');
const totalOversDisplay = document.getElementById('total-overs');
const dotBtn = document.getElementById('dot-btn');
const runsBtn = document.getElementById('runs-btn');
const extrasBtn = document.getElementById('extras-btn');
const undoBtn = document.getElementById('undo-btn');
const ballDisplayContainer = document.querySelector('.ball-display');

// Initialize counts
let currentBalls = 0;
let totalOvers = 0;
const MAX_BALLS_PER_OVER = 6;

// History to store ball counts for undo functionality
let ballHistory = [];

// Variables to hold timeout IDs for 'OVER' animation/sound and automatic reset
let overAnimationTimeout;
let autoResetTimeout;


// --- Tone.js Sound Setup ---
// Synth for general button clicks (short, subtle, wooden tap sound)
const clickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 0.5,
    oscillator: {
        type: 'sine'
    },
    envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.05
    }
}).toDestination();

clickSynth.chain(new Tone.Filter(1000, "lowpass").toDestination());

// Synth for "OVER" notification (distinct, "bing" sound)
const overSynth = new Tone.Synth({
    oscillator: {
        type: 'triangle'
    },
    envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0,
        release: 0.3
    }
}).toDestination();

// Removed: resetSynth as it's no longer used


// --- Function to Play Sounds ---
function playSound(type) {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }

    switch (type) {
        case 'click':
            clickSynth.triggerAttackRelease("C3", "16n");
            break;
        case 'over':
            overSynth.triggerAttackRelease("C5", "8n");
            break;
        // Removed: 'reset' case
    }
}


// --- Function to perform the automatic reset ---
function performAutoReset() {
    // Only increment total overs if the current over was completed (6 balls were bowled)
    if (currentBalls === MAX_BALLS_PER_OVER) {
        totalOvers++;
    }
    currentBalls = 0;
    ballHistory = []; // Clear the history for the new over
    updateDisplay(); // Update the display to 0/6
    // Removed: playSound('reset');
}


// --- Function to Update the Display ---
function updateDisplay() {
    // Clear any pending 'OVER' animation/sound timeout and automatic reset timeout
    clearTimeout(overAnimationTimeout);
    clearTimeout(autoResetTimeout);

    // Update Current Balls display and handle "OVER" state
    if (currentBalls === MAX_BALLS_PER_OVER) {
        currentBallsDisplay.textContent = 'OVER'; // Immediately change text

        // Disable relevant action buttons immediately
        dotBtn.disabled = true;
        runsBtn.disabled = true;
        extrasBtn.disabled = true;
        undoBtn.disabled = true;

        // Set a timeout for the visual and auditory/haptic feedback (1 second delay)
        overAnimationTimeout = setTimeout(() => {
            ballDisplayContainer.classList.add('over-complete'); // Add class for styling (green background, pulsing)
            triggerHapticFeedback(200); // Longer vibration
            playSound('over'); // Play over sound (now a 'bing')
        }, 1000); // 1 second delay

        // Set a timeout for the automatic reset (3 seconds after over is reached)
        autoResetTimeout = setTimeout(() => {
            performAutoReset();
        }, 3000); // 3 second delay for automatic reset
    } else {
        // Ensure 'OVER' visual/audio is cancelled if state changes before timeout (e.g., via Undo)
        ballDisplayContainer.classList.remove('over-complete');
        
        currentBallsDisplay.textContent = currentBalls + ' / ' + MAX_BALLS_PER_OVER; // Show current count

        // Enable action buttons if over is not complete
        dotBtn.disabled = false;
        runsBtn.disabled = false;
        extrasBtn.disabled = false;

        // --- ONLY control Undo button's state based on history and currentBalls when NOT 'OVER' ---
        if (ballHistory.length === 0 && currentBalls === 0) {
            undoBtn.disabled = true;
        } else {
            undoBtn.disabled = false;
        }
    }

    // Update Total Overs display
    totalOversDisplay.textContent = totalOvers;
}

// --- Function for Haptic Feedback (Vibration) ---
function triggerHapticFeedback(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// --- Event Listeners for Buttons ---

// 1. "Dot" Button: Increments the legal ball count
dotBtn.addEventListener('click', () => {
    if (!dotBtn.disabled && currentBalls < MAX_BALLS_PER_OVER) {
        ballHistory.push(currentBalls);
        currentBalls++;
        updateDisplay();
        triggerHapticFeedback(50);
        playSound('click');
    }
});

// 2. "Runs" Button: Increments the legal ball count
runsBtn.addEventListener('click', () => {
    if (!runsBtn.disabled && currentBalls < MAX_BALLS_PER_OVER) {
        ballHistory.push(currentBalls);
        currentBalls++;
        updateDisplay();
        triggerHapticFeedback(50);
        playSound('click');
    }
});

// 3. "Extras" Button: Records an extra, but does NOT increment legal balls
extrasBtn.addEventListener('click', () => {
    if (!extrasBtn.disabled) {
        console.log("Extras bowled!");
        triggerHapticFeedback(50);
        playSound('click');
    }
});

// 4. "Undo" Button: Reverts the last ball count increment
undoBtn.addEventListener('click', () => {
    clearTimeout(autoResetTimeout);
    clearTimeout(overAnimationTimeout);
    ballDisplayContainer.classList.remove('over-complete');

    if (ballHistory.length > 0) {
        currentBalls = ballHistory.pop();
        updateDisplay();
        triggerHapticFeedback(50);
        playSound('click');
    } else if (currentBalls > 0) {
        currentBalls = 0;
        ballHistory = [];
        updateDisplay();
        triggerHapticFeedback(50);
        playSound('click');
    }
});

// --- Initial Setup ---
updateDisplay();