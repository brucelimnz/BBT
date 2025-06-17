// Get references to all the necessary HTML elements using their IDs
const currentBallsDisplay = document.getElementById('current-balls');
const totalOversDisplay = document.getElementById('total-overs');
const dotBtn = document.getElementById('dot-btn');
const runsBtn = document.getElementById('runs-btn');
const extrasBtn = document.getElementById('extras-btn'); // Get Extras button reference
const undoBtn = document.getElementById('undo-btn');
const newOverBtn = document.getElementById('new-over-btn');
const ballDisplayContainer = document.querySelector('.ball-display');

// Initialize counts
let currentBalls = 0;
let totalOvers = 0;
const MAX_BALLS_PER_OVER = 6;

// History to store ball counts for undo functionality
let ballHistory = []; // Stores the 'currentBalls' value BEFORE an increment

// --- Function to Update the Display ---
function updateDisplay() {
    // Update Current Balls display
    if (currentBalls === MAX_BALLS_PER_OVER) {
        // Trigger longer vibration only when hitting OVER state
        if (currentBallsDisplay.textContent !== 'OVER') { // Prevent vibration if already showing OVER
            triggerHapticFeedback(200); // Longer vibration for over completion
        }
        currentBallsDisplay.textContent = 'OVER';
        ballDisplayContainer.classList.add('over-complete');
        // Disable Dot, Runs, AND Extras buttons when over is complete
        dotBtn.disabled = true;
        runsBtn.disabled = true;
        extrasBtn.disabled = true; // <-- Added this line for Extras
    } else {
        currentBallsDisplay.textContent = currentBalls + ' / ' + MAX_BALLS_PER_OVER;
        ballDisplayContainer.classList.remove('over-complete');
        // Enable Dot, Runs, AND Extras buttons if over is not complete
        dotBtn.disabled = false;
        runsBtn.disabled = false;
        extrasBtn.disabled = false; // <-- Added this line for Extras
    }

    // Update Total Overs display
    totalOversDisplay.textContent = totalOvers;

    // Disable/Enable Undo button based on history
    if (ballHistory.length === 0 && currentBalls === 0) {
        undoBtn.disabled = true;
    } else {
        undoBtn.disabled = false;
    }
}

// --- Function for Haptic Feedback (Vibration) ---
// Now accepts a duration in milliseconds
function triggerHapticFeedback(duration = 50) { // Default to short vibration (50ms)
    // Check if the Vibration API is supported by the browser
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// --- Event Listeners for Buttons ---

// 1. "Dot" Button: Increments the legal ball count
dotBtn.addEventListener('click', () => {
    // Check if the button is NOT disabled by the over completion state
    if (!dotBtn.disabled && currentBalls < MAX_BALLS_PER_OVER) {
        ballHistory.push(currentBalls); // Store current state before incrementing
        currentBalls++;
        updateDisplay();
        triggerHapticFeedback(50); // Short vibration for action
    }
});

// 2. "Runs" Button: Increments the legal ball count
runsBtn.addEventListener('click', () => {
    // Check if the button is NOT disabled by the over completion state
    if (!runsBtn.disabled && currentBalls < MAX_BALLS_PER_OVER) {
        ballHistory.push(currentBalls); // Store current state before incrementing
        currentBalls++;
        updateDisplay();
        triggerHapticFeedback(50); // Short vibration for action
    }
});

// 3. "Extras" Button: Records an extra, but does NOT increment legal balls
extrasBtn.addEventListener('click', () => {
    // Check if the button is NOT disabled by the over completion state
    if (!extrasBtn.disabled) { // Extras doesn't care about MAX_BALLS_PER_OVER for its function
        console.log("Extras bowled!");
        // Extras do not affect the ball count for the over, so no change to currentBalls or history.
        triggerHapticFeedback(50); // Short vibration for action
    }
});

// 4. "Undo" Button: Reverts the last ball count increment
undoBtn.addEventListener('click', () => {
    // Check if the button is NOT disabled
    if (!undoBtn.disabled) {
        if (ballHistory.length > 0) {
            currentBalls = ballHistory.pop(); // Revert to the previous ball count
            updateDisplay();
            triggerHapticFeedback(50); // Short vibration for action
        } else if (currentBalls > 0) { // If history is empty but we have a count (e.g., from initial state)
            currentBalls = 0; // Go back to 0 if nothing else to undo and currentBalls > 0
            updateDisplay();
            triggerHapticFeedback(50); // Short vibration for action
        }
    }
});

// 5. "New Over" Button: Resets the ball count to zero, clears history, and increments total overs
newOverBtn.addEventListener('click', () => {
    // Only increment total overs if the current over was completed (6 balls were bowled)
    if (currentBalls === MAX_BALLS_PER_OVER) {
        totalOvers++;
    }
    currentBalls = 0; // Reset current balls
    ballHistory = []; // Clear the history for the new over
    updateDisplay(); // Update the display
    // No vibration here, as the 'OVER' state vibration happens just before New Over is pressed.
});

// --- Initial Setup ---
// Call updateDisplay once when the script loads to set initial state
updateDisplay();