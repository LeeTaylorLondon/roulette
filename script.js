let balance = 863.06; // starting balance
let currentBet = null;
let countdownTimer;
let firstRoll = 0;
let countdown = 15.00; // Start the countdown at 5 seconds
const countdownElement = document.getElementById('countdown');
countdownElement.textContent = countdown.toFixed(2); // Display it with 2 decimal places
const balanceElement = document.getElementById('balance'); // Get your balance element by its ID


function formatBalance(balance) {
  return balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function updateBalance() {
  document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
  balanceElement.textContent = `${formatBalance(balance)}`;
}

function placeBet(choice) {
  // prevent players from placing a bet while rolling
  if (countdown <= 0) {
    alert("You cannot place a bet past the countdown!")
    return;
  }

  // normal function
  const betAmount = parseFloat(document.getElementById('bet-amount').value);
  if (betAmount > balance) {
    alert("You don't have enough money to place that bet.");
    return;
  }
  if (currentBet) {
    alert("You already placed a bet!");
    return;
  }

  clearBetPlacements(); // Clear any previous bet placements

  balance -= betAmount;
  updateBalance();
  currentBet = { amount: betAmount, choice: choice };

  const betButton = document.getElementById(`bet-${choice}`);
  if (betButton) {
    betButton.classList.add('bet-placed');
    betButton.setAttribute('data-bet-amount', `$${betAmount.toFixed(2)}`);
    betButton.textContent = `BET PLACED: `; // Change the text of the button
  }

  document.getElementById('bet-display').textContent = `Your bet: $${betAmount.toFixed(2)} on ${choice}`;
}

function clearBetPlacements() {
  const betButtons = document.querySelectorAll('.bet-button');
  betButtons.forEach(button => {
    button.classList.remove('bet-placed');
    button.removeAttribute('data-bet-amount');
    
  });
}

function determineWinner(scrollingText) {
  // We need to calculate the exact position of the text when the animation ends.
  // This example assumes your red line is centered at 50% of the wheel's width.
  const winnerLinePosition = wheel.offsetWidth / 2;
  const characterWidth = scrollingText.offsetWidth / scrollingText.textContent.length;
  const offsetLeft = scrollingText.getBoundingClientRect().left;
  const indexAtWinnerLine = Math.floor((winnerLinePosition - offsetLeft) / characterWidth);
  
  return scrollingText.textContent[indexAtWinnerLine % scrollingText.textContent.length];
}


function updateBalanceAfterRoll(winner) {
  if (currentBet && currentBet.choice.charAt(0).toUpperCase() === winner) {
    balance += currentBet.amount * 2;
    document.getElementById('result').textContent = `Result: ${winner} - You Win!`;
  } else {
    document.getElementById('result').textContent = `Result: ${winner} - You Lose!`;
  }
  updateBalance();
  currentBet = null;
  document.getElementById('bet-display').textContent = 'Your bet: ';
  clearBetPlacements(); // Clear any previous bet placements
  document.getElementById('bet-heads').textContent = 'PLACE BET HEADS';
  // document.getElementById('bet-heads').background-color = #333541;
  document.getElementById('bet-tails').textContent = 'PLACE BET TAILS';
  // document.getElementById('bet-tails').background-color = #333541;
}

function rollRoulette() {
  clearInterval(countdownTimer); // Clear any existing intervals

  const wheel = document.getElementById('wheel');
  const oldScrollingText = wheel.querySelector('.scrolling-text');
  if (oldScrollingText) {
    wheel.removeChild(oldScrollingText);
  }

  const scrollingText = document.createElement('div');
  scrollingText.className = 'scrolling-text';
  wheel.appendChild(scrollingText);

  // Randomly choose between 'HT' or 'TH' to start the sequence
  let sequenceStart = Math.random() < 0.5 ? 'HT' : 'TH';
  let rolls = sequenceStart.repeat(3000); // Create a very long sequence

  scrollingText.textContent = rolls; // Set the text

  colorHeadsOrange();

  // Wait for the animation to end before determining the winner
  scrollingText.addEventListener('animationend', function handleAnimationEnd() {
    const winner = determineWinner(scrollingText);
    updateBalanceAfterRoll(winner);
    startGame(); // Restart the game for the next roll
    // Remove the event listener to clean up
    scrollingText.removeEventListener('animationend', handleAnimationEnd);
  });
}

function updateCountdown(seconds) {
  document.getElementById('countdown').textContent = `${seconds}`;
}

function startGame() {
  clearInterval(countdownTimer); // Clear any existing interval to reset the game

  countdown = firstRoll === 0 ? 0.01 : 15.00; // countdown in seconds
  firstRoll = 1; // Mark as the first roll having occurred

  countdownTimer = setInterval(() => {
    countdown -= 0.01;
    updateCountdown(countdown);
    countdownElement.textContent = countdown.toFixed(2)
    if (countdown <= 0) {
      clearInterval(countdownTimer); // Stop the countdown
      countdownElement.textContent = '0.00';
      rollRoulette(); // It's time to roll
    }
  }, 10);
}

// Attach event listeners to the bet buttons
document.getElementById('bet-heads').addEventListener('click', function() {
  placeBet('heads');
});

document.getElementById('bet-tails').addEventListener('click', function() {
  placeBet('tails');
});

function colorHeadsOrange() {
  const scrollingTextElement = document.querySelector('.scrolling-text'); // Adjust if your class is different
  if (scrollingTextElement) {
    let updatedText = '';
    for (const char of scrollingTextElement.textContent) {
      if (char === 'H') {
        updatedText += '<span class="orange">' + char + '</span>';
      } else {
        updatedText += char;
      }
    }
    scrollingTextElement.innerHTML = updatedText;
  }
}

function modifyBet(amount) {
  var betAmountInput = document.getElementById('bet-amount');
  var currentBet = parseFloat(betAmountInput.value) || 0;

  switch(amount) {
    case 'clear':
      betAmountInput.value = 0.00;
      break;
    case 'half':
      betAmountInput.value = (currentBet / 2).toFixed(2);
      break;
    case 'double':
      betAmountInput.value = (currentBet * 2).toFixed(2);
      break;
    case 'max':
      // Set this to the maximum bet amount allowed
      betAmountInput.value = Math.floor(balance * 100) / 100; 
      // document.getElementById('bet-amount').value = maxBet.toFixed(2);
      break;
    default:
      betAmountInput.value = (currentBet + amount).toFixed(2);
      break;
  }
}

// Initialize the game
updateBalance();
startGame();