// Get references to all the necessary HTML elements using their IDs
const currentBallsDisplay = document.getElementById('current-balls');
const dotBtn = document.getElementById('dot-btn');      // New: Dot button
const runsBtn = document.getElementById('runs-btn');    // New: Runs button
const extrasBtn = document.getElementById('extras-btn');  // New: Extras button (formerly No Ball)
const newOverBtn = document.getElementById('new-over-btn');
const ballDisplayContainer = document.querySelector('.ball-display'); // Get the parent container for styling

// Initialize the current ball count for the over
let currentBalls = 0;
// Define the maximum legal balls per over
const MAX_BALLS_PER_OVER = 6;

// --- Function to Update the Display ---
function updateDisplay() {
    // Check if the over is complete
    if (currentBalls === MAX_BALLS_PER_OVER) {
        // When over is complete, show "OVER" text
        currentBallsDisplay.textContent = 'OVER'; // <-- This is the line that sets the text to "OVER"
        // Add a CSS class to change the look of the display when over is complete
        ballDisplayContainer.classList.add('over-complete');
    } else {
        // When over is not complete, show the current ball count with "/ 6"
        currentBallsDisplay.textContent = currentBalls + ' / ' + MAX_BALLS_PER_OVER;
        // Remove the "over-complete" class if it was previously added
        ballDisplayContainer.classList.remove('over-complete');
    }
}

// --- Event Listeners for Buttons ---

// 1. "Dot" Button: Increments the legal ball count
dotBtn.addEventListener('click', () => {
    // Only increment if the current balls are less than the maximum for an over
    if (currentBalls < MAX_BALLS_PER_OVER) {
        currentBalls++; // Increase the count
        updateDisplay(); // Update what's shown on the screen
    }
});

// 2. "Runs" Button: Increments the legal ball count (now works like Dot)
runsBtn.addEventListener('click', () => {
    // Only increment if the current balls are less than the maximum for an over
    if (currentBalls < MAX_BALLS_PER_OVER) {
        currentBalls++; // Increase the count
        updateDisplay(); // Update what's shown on the screen
    }
});

// 3. "Extras" Button: Records an extra, but does NOT increment legal balls
extrasBtn.addEventListener('click', () => {
    console.log("Extras bowled!"); // You can check your browser's developer console for this message
    // This button acknowledges extras without affecting the over count.
});

// 4. "New Over" Button: Resets the ball count to zero
newOverBtn.addEventListener('click', () => {
    currentBalls = 0; // Reset the count
    updateDisplay(); // Update the display
});

// --- Initial Setup ---
// Call updateDisplay once when the script loads to set the initial "0"
updateDisplay();