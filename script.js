// Get references to all the necessary HTML elements using their IDs
const currentBallsDisplay = document.getElementById('current-balls');
const totalOversDisplay = document.getElementById('total-overs');
const historyTracker = document.getElementById('history-tracker');
const dotBtn = document.getElementById('dot-btn');
const runsBtn = document.getElementById('runs-btn');
const extrasBtn = document.getElementById('extras-btn');
const undoBtn = document.getElementById('undo-btn');
const ballDisplayContainer = document.querySelector('.ball-display');

// Runs selection modal elements
const runsSelectionModal = document.getElementById('runs-selection-modal');
const runsOverlay = document.getElementById('runs-overlay');
const runButtons = document.querySelectorAll('.run-option-btn');
const cancelRunSelectionBtn = document.getElementById('cancel-run-selection-btn');

// Extras selection modal elements
const extrasSelectionModal = document.getElementById('extras-selection-modal');
const extrasOverlay = document.getElementById('extras-overlay');
const extraOptionButtons = document.querySelectorAll('.extra-option-btn');
const cancelExtraSelectionBtn = document.getElementById('cancel-extra-selection-btn');


// Initialize counts
let currentBalls = 0;
let totalOvers = 0; // Represents full overs
const MAX_BALLS_PER_OVER = 6;

// History for the current over's events (e.g., '0', '4', 'Wd', 'B')
let overEvents = [];

// History to store FULL STATE for undo functionality
// Stores objects { balls: number, overEvents: string[] }
let stateHistory = [];


// Variables to hold timeout IDs for 'OVER' animation/sound and automatic reset
let overAnimationTimeout;
let autoResetTimeout;

// Flag to ensure Tone.js audio context is started only once
let audioInitialized = false;


// --- Tone.js Sound Setup ---
// General input click sound (wooden click)
const clickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 2,
    oscillator: {
        type: 'sine'
    },
    envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0,
        release: 0.1
    }
}).toDestination();
clickSynth.chain(new Tone.Filter(1000, "lowpass").toDestination());

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

const resetSynth = new Tone.Synth({
    oscillator: {
        type: 'sine'
    },
    envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0,
        release: 0.2
    }
}).toDestination();

// Undo button "pop" sound - distinct and higher pitched
const undoPopSynth = new Tone.MembraneSynth({
    pitchDecay: 0.01,
    octaves: 1.5,
    oscillator: {
        type: 'sine'
    },
    envelope: {
        attack: 0.002,
        decay: 0.15,
        sustain: 0,
        release: 0.05
    },
    volume: -5
}).toDestination();
undoPopSynth.chain(new Tone.Filter(2000, "highpass").toDestination());


// --- Function to Initialize Audio Context ---
async function initializeAudioContext() {
    if (!audioInitialized) {
        try {
            await Tone.start();
            console.log('Audio context started successfully!');
            audioInitialized = true;
        } catch (error) {
            console.error('Failed to start audio context:', error);
        }
    }
}


// --- Function to Play Sounds ---
function playSound(type) {
    if (!audioInitialized) {
        console.warn("Audio not initialized. Skipping sound playback.");
        return;
    }

    switch (type) {
        case 'click':
            clickSynth.triggerAttackRelease("D3", "16n");
            break;
        case 'over':
            overSynth.triggerAttackRelease("C5", "8n");
            break;
        case 'reset':
            resetSynth.triggerAttackRelease("C6", "8n");
            break;
        case 'undoPop':
            undoPopSynth.triggerAttackRelease("C5", "32n");
            break;
    }
}


// --- Function to perform the automatic reset ---
function performAutoReset() {
    if (currentBalls === MAX_BALLS_PER_OVER) {
        totalOvers++;
    }
    currentBalls = 0;
    overEvents = [];
    stateHistory = [];
    updateDisplay();
    playSound('reset');
}


// --- Function to Update the Display and Button States ---
function updateDisplay() {
    clearTimeout(overAnimationTimeout);
    clearTimeout(autoResetTimeout);

    if (currentBalls === MAX_BALLS_PER_OVER) {
        const lastSixBalls = overEvents.slice(-MAX_BALLS_PER_OVER);
        const isMaiden = lastSixBalls.every(event => event === '0');

        if (isMaiden) {
            currentBallsDisplay.textContent = 'MAIDEN';
        } else {
            currentBallsDisplay.textContent = 'OVER';
        }

        overAnimationTimeout = setTimeout(() => {
            ballDisplayContainer.classList.add('over-complete');
            currentBallsDisplay.textContent = 'OVER'; 
            triggerHapticFeedback(200);
            playSound('over');
        }, 1000);

        autoResetTimeout = setTimeout(() => {
            performAutoReset();
        }, 3000);

        dotBtn.disabled = true;
        runsBtn.disabled = true;
        extrasBtn.disabled = true;
    } else {
        ballDisplayContainer.classList.remove('over-complete');
        
        currentBallsDisplay.textContent = currentBalls + ' / ' + MAX_BALLS_PER_OVER;

        dotBtn.disabled = false;
        runsBtn.disabled = false;
        extrasBtn.disabled = false;
    }

    if (stateHistory.length === 0 && currentBalls === 0) {
        undoBtn.disabled = true;
    } else {
        undoBtn.disabled = false;
    }

    // --- CHANGED: Display overs in "fullOvers.currentBalls" format ---
    const fullOvers = Math.floor(totalOvers);
    const ballsInCurrentOver = currentBalls % MAX_BALLS_PER_OVER;
    totalOversDisplay.textContent = `${fullOvers}.${ballsInCurrentOver}`;
    // --- END CHANGED ---

    historyTracker.textContent = overEvents.join(' . ');
}

// --- Function for Haptic Feedback (Vibration) ---
function triggerHapticFeedback(duration = 50) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// --- Function to temporarily disable all main buttons (e.g., when a modal is open) ---
function disableMainButtons() {
    dotBtn.disabled = true;
    runsBtn.disabled = true;
    extrasBtn.disabled = true;
    undoBtn.disabled = true;
}

// --- Function to re-enable main buttons (e.g., when a modal closes) ---
function reEnableMainButtons() {
    updateDisplay();
}


// --- Event Listeners for Buttons ---
dotBtn.addEventListener('click', async () => {
    await initializeAudioContext();
    if (!dotBtn.disabled && currentBalls < MAX_BALLS_PER_OVER) {
        stateHistory.push({ balls: currentBalls, overEvents: [...overEvents] }); 
        currentBalls++;
        overEvents.push('0');
        updateDisplay();
        triggerHapticFeedback(50);
        playSound('click');
    }
});

runsBtn.addEventListener('click', async () => {
    await initializeAudioContext();
    if (!runsBtn.disabled && currentBalls < MAX_BALLS_PER_OVER) {
        runsSelectionModal.classList.add('active');
        runsOverlay.classList.add('active');
        disableMainButtons();
    }
});

runButtons.forEach(button => {
    button.addEventListener('click', async () => {
        await initializeAudioContext();
        const runsScored = parseInt(button.textContent);
        console.log(`User selected ${runsScored} run(s)`);

        if (currentBalls < MAX_BALLS_PER_OVER) {
            stateHistory.push({ balls: currentBalls, overEvents: [...overEvents] }); 
            currentBalls++;
            overEvents.push(runsScored.toString());
        }
        
        runsSelectionModal.classList.remove('active');
        runsOverlay.classList.remove('active');
        reEnableMainButtons();
        
        triggerHapticFeedback(50);
        playSound('click');
    });
});

cancelRunSelectionBtn.addEventListener('click', async () => {
    await initializeAudioContext();
    runsSelectionModal.classList.remove('active');
    runsOverlay.classList.remove('active');
    reEnableMainButtons();
});


extrasBtn.addEventListener('click', async () => {
    await initializeAudioContext();
    if (!extrasBtn.disabled) {
        extrasSelectionModal.classList.add('active');
        extrasOverlay.classList.add('active');
        disableMainButtons();
    }
});

extraOptionButtons.forEach(button => {
    button.addEventListener('click', async () => {
        await initializeAudioContext();
        const extraType = button.dataset.extraType;
        console.log(`User selected Extra: ${extraType}`);

        stateHistory.push({ balls: currentBalls, overEvents: [...overEvents] });

        if (extraType === "Wicket" || extraType === "Byes") {
            if (currentBalls < MAX_BALLS_PER_OVER) {
                currentBalls++;
            }
        }
        if (extraType === "Wide") overEvents.push('WD');
        else if (extraType === "No Ball") overEvents.push('NB');
        else if (extraType === "Wicket") overEvents.push('X');
        else if (extraType === "Byes") overEvents.push('BY');
        
        extrasSelectionModal.classList.remove('active');
        extrasOverlay.classList.remove('active');
        reEnableMainButtons();

        triggerHapticFeedback(50);
        playSound('click');
    });
});

cancelExtraSelectionBtn.addEventListener('click', async () => {
    await initializeAudioContext();
    extrasSelectionModal.classList.remove('active');
    extrasOverlay.classList.remove('active');
    reEnableMainButtons();
});


undoBtn.addEventListener('click', async () => {
    await initializeAudioContext();
    clearTimeout(autoResetTimeout);
    clearTimeout(overAnimationTimeout);
    ballDisplayContainer.classList.remove('over-complete');

    if (stateHistory.length > 0) {
        const prevState = stateHistory.pop();
        currentBalls = prevState.balls;
        overEvents = prevState.overEvents;
        reEnableMainButtons();
        triggerHapticFeedback(50);
        playSound('undoPop');
    } else if (currentBalls > 0) {
        currentBalls = 0;
        overEvents = [];
        reEnableMainButtons();
        triggerHapticFeedback(50);
        playSound('undoPop');
    }
});

// --- Initial Setup ---
updateDisplay();