document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS ---
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    const startGameButton = document.getElementById('start-game-button');
    const gameArea = document.getElementById('game-area');
    const currentScoreEl = document.getElementById('current-score');
    const livesEl = document.getElementById('lives');
    const highScoreEl = document.getElementById('high-score');
    const confettiContainer = document.getElementById('confetti-container');

    // NEW: Leaderboard element
    const leaderboardList = document.getElementById('leaderboard-list');

    // --- STATE VARIABLES ---
    const targetDate = new Date("2025-08-19T00:00:00");
    let currentUser = null;
    let usersData = {};

    // Game state
    let score = 0;
    let lives = 3;
    let gameInterval = null;
    let spawnRate = 2000; // Initial spawn rate: 2 seconds

    // --- LOGIN LOGIC ---
    // Load user data from localStorage
    const savedData = localStorage.getItem('disneyGameUsers');
    if (savedData) {
        usersData = JSON.parse(savedData);
    }

    loginButton.addEventListener('click', () => {
        const username = usernameInput.value.trim().toLowerCase(); // Case-insensitive
        if (username) {
            currentUser = username;
            if (!usersData[currentUser]) {
                usersData[currentUser] = { highScore: 0 };
            }
            saveData();
            showMainContent();
        } else {
            alert("Please enter a name!");
        }
    });

    function saveData() {
        localStorage.setItem('disneyGameUsers', JSON.stringify(usersData));
    }

    function showMainContent() {
        loginContainer.classList.remove('active');
        mainContainer.classList.add('active');
        highScoreEl.textContent = usersData[currentUser].highScore;
        startCountdown();
        updateLeaderboard(); // NEW: Update leaderboard on login
    }

    // --- COUNTDOWN LOGIC ---
    function startCountdown() {
        updateCountdown(); // Initial call
        setInterval(updateCountdown, 1000);
    }

    let lastValues = {};
    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('countdown-timer').innerHTML = "<h1>The Magic is Here!</h1>";
            triggerConfetti();
            clearInterval(this);
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        updateTimeValue(daysEl, d);
        updateTimeValue(hoursEl, h);
        updateTimeValue(minutesEl, m);
        updateTimeValue(secondsEl, s);
    }

    function updateTimeValue(element, value) {
        const elementId = element.id;
        if (lastValues[elementId] !== value) {
            element.textContent = value;
            element.classList.add('sparkle');
            setTimeout(() => element.classList.remove('sparkle'), 500);
            lastValues[elementId] = value;
        }
    }

    function triggerConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            const colors = [getComputedStyle(document.documentElement).getPropertyValue('--mickey-black'), getComputedStyle(document.documentElement).getPropertyValue('--mickey-red'), getComputedStyle(document.documentElement).getPropertyValue('--accent-gold')];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confettiContainer.appendChild(confetti);
        }
    }
    
    // --- GAME LOGIC ---
    startGameButton.addEventListener('click', startGame);

    function startGame() {
        score = 0;
        lives = 3;
        spawnRate = 2000;
        currentScoreEl.textContent = score;
        livesEl.textContent = lives;
        startGameButton.style.display = 'none';
        
        gameInterval = setInterval(spawnMickey, spawnRate);
    }

    function spawnMickey() {
        const mickey = document.createElement('div');
        mickey.className = 'mickey-head';
        
        const maxWidth = gameArea.clientWidth - 50;
        const maxHeight = gameArea.clientHeight - 50;
        mickey.style.left = `${Math.random() * maxWidth}px`;
        mickey.style.top = `${Math.random() * maxHeight}px`;
        
        mickey.addEventListener('click', () => {
            score++;
            currentScoreEl.textContent = score;
            mickey.remove();
            
            if (score > 0 && score % 3 === 0 && spawnRate > 500) {
                spawnRate -= 200;
                clearInterval(gameInterval);
                gameInterval = setInterval(spawnMickey, spawnRate);
            }
        });

        setTimeout(() => {
            if (document.body.contains(mickey)) {
                mickey.remove();
                lives--;
                livesEl.textContent = lives;
                if (lives <= 0) {
                    endGame();
                }
            }
        }, spawnRate * 0.9);

        gameArea.appendChild(mickey);
    }

    function endGame() {
        clearInterval(gameInterval);
        alert(`Game Over! Your score: ${score}`);
        
        gameArea.innerHTML = '';
        gameArea.appendChild(startGameButton);
        startGameButton.style.display = 'block';

        if (score > usersData[currentUser].highScore) {
            usersData[currentUser].highScore = score;
            highScoreEl.textContent = score;
            saveData();
            alert("New high score!");
        }
        
        updateLeaderboard(); // NEW: Update leaderboard after a game
    }

    // --- NEW: LEADERBOARD FUNCTION ---
    function updateLeaderboard() {
        leaderboardList.innerHTML = ''; // Clear existing list

        // Convert users object to an array and sort by high score
        const sortedUsers = Object.entries(usersData)
            .sort(([, a], [, b]) => b.highScore - a.highScore)
            .slice(0, 10); // Show top 10 users

        // Create and append list items for each user
        sortedUsers.forEach(([name, data], index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${index + 1}. <span class="name">${name}</span></span>
                <span class="score">${data.highScore} pts</span>
            `;
            leaderboardList.appendChild(li);
        });
    }
});