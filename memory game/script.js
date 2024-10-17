// Get references to HTML elements
const gameBoard = document.getElementById('game-board'); // The container for the game cards
const moveCounter = document.getElementById('move-counter'); // Displays the number of moves made
const timerDisplay = document.getElementById('timer'); // Displays the elapsed time
const restartButton = document.getElementById('restart-button'); // Button to restart the game
const resultNotification = document.getElementById('result-notification'); // Container for the result notification
const resultMessage = document.getElementById('result-message'); // Message displayed in the result notification
const closeNotificationButton = document.getElementById('close-notification'); // Button to close the result notification

// Array of image filenames for the game cards
const cardImages = [
    'riley.jpg', 'riley.jpg',
    'ren.jpg', 'ren.jpg',
    'nona.jpg', 'nona.jpg',
    'jonas.jpg', 'jonas.jpg',
    'clarrissa.jpg', 'clarrissa.jpg',
    'brother.jpg', 'brother.jpg'
];

let flippedCards = []; // Array to keep track of flipped cards
let matchedPairs = 0; // Counter for matched pairs
let moves = 0; // Counter for moves
let timer; // Variable to store timer interval
let seconds = 0; // Counter for seconds elapsed

// Function to shuffle the cards array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Function to initialize the game
function initializeGame() {
    // Clear the game board and reset variables
    gameBoard.innerHTML = ''; // Clear all existing cards
    flippedCards = []; // Reset flipped cards
    matchedPairs = 0; // Reset matched pairs count
    moves = 0; // Reset move count
    moveCounter.textContent = moves; // Update move counter display
    seconds = 0; // Reset timer
    timerDisplay.textContent = seconds; // Update timer display

    // Clear any existing timer
    clearInterval(timer);

    // Start the timer
    timer = setInterval(() => {
        seconds++;
        timerDisplay.textContent = seconds; // Update timer display every second
    }, 1000);

    // Shuffle the cards
    shuffle(cardImages);

    // Create card elements and add them to the game board
    cardImages.forEach(cardValue => {
        const card = document.createElement('div');
        card.classList.add('card'); // Add card styling class
        card.dataset.image = cardValue; // Store the image filename as data attribute
        card.addEventListener('click', flipCard); // Add click event listener to flip the card
        gameBoard.appendChild(card); // Append card to game board
    });
}

// Function to handle card flip
function flipCard() {
    // Ensure only two cards can be flipped at a time and prevent already flipped or matched cards from being flipped again
    if (flippedCards.length < 2 && !this.classList.contains('flipped') && !this.classList.contains('matched')) {
        this.classList.add('flipped'); // Add flipped class to show card face
        const image = this.dataset.image; // Get the image filename
        this.style.backgroundImage = `url(${image})`; // Set the background image
        flippedCards.push(this); // Add the card to the flippedCards array

        // Check for match if two cards are flipped
        if (flippedCards.length === 2) {
            moves++;
            moveCounter.textContent = moves; // Update move counter display
            checkForMatch(); // Check if the two flipped cards match
        }
    }
}

// Function to check if the flipped cards match
function checkForMatch() {
    const [card1, card2] = flippedCards; // Destructure the flipped cards

    if (card1.dataset.image === card2.dataset.image) {
        // If cards match, mark them as matched
        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = []; // Reset flippedCards array
        matchedPairs++; // Increment matched pairs count

        // Check if all pairs are matched
        if (matchedPairs === cardImages.length / 2) {
            clearInterval(timer); // Stop the timer
            showResultNotification(`You win! Time: ${seconds} seconds, Moves: ${moves}`); // Show custom notification
        }
    } else {
        // If cards do not match, flip them back over after a short delay
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.style.backgroundImage = ''; // Clear the background image
            card2.style.backgroundImage = ''; // Clear the background image
            flippedCards = []; // Reset flippedCards array
        }, 1000); // Delay for 1 second before flipping cards back
    }
}

// Function to show the result notification
function showResultNotification(message) {
    resultMessage.textContent = message; // Set the notification message
    resultNotification.classList.remove('hidden'); // Show the notification
}

// JavaScript to make the notification draggable
let isDragging = false; // Flag to indicate if the notification is being dragged
let offsetX, offsetY; // Offsets for dragging calculations

resultNotification.addEventListener('mousedown', (e) => {
    isDragging = true; // Start dragging
    // Calculate the offset between the mouse pointer and the top-left corner of the notification
    offsetX = e.clientX - resultNotification.getBoundingClientRect().left;
    offsetY = e.clientY - resultNotification.getBoundingClientRect().top;
    resultNotification.style.cursor = 'grabbing'; // Change cursor to grabbing while dragging
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        // Update the position of the notification
        resultNotification.style.left = `${e.clientX - offsetX}px`;
        resultNotification.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false; // Stop dragging
    resultNotification.style.cursor = 'move'; // Reset cursor after dragging
});

// Ensure the notification is centered within the viewport on load
resultNotification.style.left = '50%';
resultNotification.style.top = '50%';
resultNotification.style.transform = 'translate(-50%, -50%)';

// Event listener to close the result notification
closeNotificationButton.addEventListener('click', () => {
    resultNotification.classList.add('hidden'); // Hide the notification
});

// Event listener to restart the game
restartButton.addEventListener('click', initializeGame); // Initialize a new game on restart button click

// Initialize the game on page load
initializeGame();
