// AR Minigames Implementation

// Base class for all minigames
class ARMinigame {
    constructor(checkpointNumber) {
        this.checkpointNumber = checkpointNumber;
        this.isActive = false;
        this.progress = 0;
        this.isCompleted = false;
    }
    
    initialize() {
        this.isActive = true;
        this.progress = 0;
        console.log(`Minigame ${this.checkpointNumber} initialized`);
    }
    
    cleanup() {
        this.isActive = false;
        console.log(`Minigame ${this.checkpointNumber} cleaned up`);
    }
    
    reset() {
        this.progress = 0;
        this.isCompleted = false;
        console.log(`Minigame ${this.checkpointNumber} reset`);
    }
    
    getProgress() {
        return this.progress;
    }
    
    getUIContent() {
        return '<p>Base minigame - override this method</p>';
    }
    
    handleAction() {
        console.log('Base action - override this method');
    }
}

// Checkpoint 1: Captain's Compass - Device orientation navigation
class CaptainCompassGame extends ARMinigame {
    constructor() {
        super(1);
        this.targetHeading = 0; // North
        this.currentHeading = 0;
        this.tolerance = 15; // degrees
        this.holdTime = 3000; // 3 seconds
        this.startHoldTime = null;
        this.orientationHandler = null;
    }
    
    initialize() {
        super.initialize();
        this.targetHeading = Utils.randomInt(0, 359);
        this.setupOrientationListener();
        Utils.playSound('compass-start');
    }
    
    setupOrientationListener() {
        if (Utils.DeviceCapabilities.hasDeviceOrientation()) {
            this.orientationHandler = (event) => {
                this.currentHeading = Utils.getCompassHeading(event.alpha, event.beta, event.gamma);
                this.checkAlignment();
            };
            
            window.addEventListener('deviceorientationabsolute', this.orientationHandler);
            window.addEventListener('deviceorientation', this.orientationHandler);
        }
    }
    
    checkAlignment() {
        const diff = Math.abs(this.currentHeading - this.targetHeading);
        const aligned = Math.min(diff, 360 - diff) <= this.tolerance;
        
        if (aligned) {
            if (!this.startHoldTime) {
                this.startHoldTime = Date.now();
            }
            
            const elapsed = Date.now() - this.startHoldTime;
            this.progress = Math.min((elapsed / this.holdTime) * 100, 100);
            
            if (elapsed >= this.holdTime && !this.isCompleted) {
                this.complete();
            }
        } else {
            this.startHoldTime = null;
            this.progress = 0;
        }
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        Utils.playSound('success');
        Utils.vibrate([200, 100, 200]);
        
        if (window.ARView) {
            window.ARView.completeCheckpoint(1, true); // Awards key
        }
    }
    
    cleanup() {
        super.cleanup();
        if (this.orientationHandler) {
            window.removeEventListener('deviceorientationabsolute', this.orientationHandler);
            window.removeEventListener('deviceorientation', this.orientationHandler);
        }
    }
    
    getUIContent() {
        const headingDiff = Math.abs(this.currentHeading - this.targetHeading);
        const alignedDiff = Math.min(headingDiff, 360 - headingDiff);
        
        return `
            <div class="compass-game">
                <h3>🧭 Captain's Compass</h3>
                <p>Point your device to <strong>${this.targetHeading}°</strong></p>
                <div class="compass-display">
                    <div class="current-heading">Current: ${Math.round(this.currentHeading)}°</div>
                    <div class="target-heading">Target: ${this.targetHeading}°</div>
                    <div class="alignment-indicator ${alignedDiff <= this.tolerance ? 'aligned' : ''}">
                        ${alignedDiff <= this.tolerance ? '✅ ALIGNED' : `📍 ${Math.round(alignedDiff)}° off`}
                    </div>
                </div>
                ${this.startHoldTime ? '<p>Hold steady...</p>' : '<p>Align your compass</p>'}
            </div>
        `;
    }
}

// Checkpoint 2: Kraken's Quiz - Interactive pirate trivia
class KrakenQuizGame extends ARMinigame {
    constructor() {
        super(2);
        this.questions = [
            {
                question: "What flag do pirates traditionally fly?",
                options: ["Jolly Roger", "Union Jack", "Stars and Stripes", "Tricolor"],
                correct: 0
            },
            {
                question: "What is a pirate's favorite letter?",
                options: ["R", "P", "C", "Arrr"],
                correct: 2
            },
            {
                question: "What do pirates call their ship's bathroom?",
                options: ["The head", "The stern", "The bow", "The galley"],
                correct: 0
            },
            {
                question: "Which famous pirate was known as Blackbeard?",
                options: ["Captain Hook", "Edward Teach", "Anne Bonny", "Jack Sparrow"],
                correct: 1
            },
            {
                question: "What is a pirate's weapon of choice?",
                options: ["Musket", "Cutlass", "Cannon", "Dagger"],
                correct: 1
            }
        ];
        
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.totalQuestions = 3; // Only ask 3 questions
        this.selectedAnswer = null;
    }
    
    initialize() {
        super.initialize();
        this.questions = Utils.shuffleArray(this.questions);
        Utils.playSound('quiz-start');
    }
    
    handleAction() {
        if (this.selectedAnswer !== null) {
            this.submitAnswer();
        }
    }
    
    selectAnswer(answerIndex) {
        this.selectedAnswer = answerIndex;
    }
    
    submitAnswer() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === currentQuestion.correct;
        
        if (isCorrect) {
            this.correctAnswers++;
            Utils.playSound('correct');
            Utils.vibrate(200);
        } else {
            Utils.playSound('incorrect');
        }
        
        this.currentQuestionIndex++;
        this.progress = (this.currentQuestionIndex / this.totalQuestions) * 100;
        this.selectedAnswer = null;
        
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.complete();
        }
        
        setTimeout(() => {
            if (window.ARView) {
                window.ARView.updateMinigameUI();
            }
        }, 1500);
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        
        const passed = this.correctAnswers >= 2; // Need 2/3 correct
        
        if (passed) {
            Utils.playSound('success');
            Utils.vibrate([200, 100, 200]);
            
            if (window.ARView) {
                window.ARView.completeCheckpoint(2, false);
            }
        } else {
            Utils.playSound('failure');
            if (window.ARView) {
                window.ARView.showMessage('Quiz failed! You need at least 2 correct answers.');
            }
            setTimeout(() => this.reset(), 3000);
        }
    }
    
    reset() {
        super.reset();
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.selectedAnswer = null;
        this.questions = Utils.shuffleArray(this.questions);
    }
    
    getUIContent() {
        if (this.currentQuestionIndex >= this.totalQuestions) {
            return `
                <div class="quiz-game">
                    <h3>🐙 Kraken's Quiz Complete</h3>
                    <p>Score: ${this.correctAnswers}/${this.totalQuestions}</p>
                    <p>${this.correctAnswers >= 2 ? '🎉 Well done, pirate!' : '💀 Better luck next time!'}</p>
                </div>
            `;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        
        return `
            <div class="quiz-game">
                <h3>🐙 Kraken's Quiz</h3>
                <div class="question-counter">Question ${this.currentQuestionIndex + 1}/${this.totalQuestions}</div>
                <div class="question">${question.question}</div>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <button 
                            class="quiz-option ${this.selectedAnswer === index ? 'selected' : ''}"
                            onclick="currentMinigame.selectAnswer(${index})"
                        >
                            ${String.fromCharCode(65 + index)}) ${option}
                        </button>
                    `).join('')}
                </div>
                <div class="score">Correct: ${this.correctAnswers}</div>
            </div>
        `;
    }
}

// Checkpoint 3: Cannonball Accuracy - Tap-to-shoot targeting game
class CannonballAccuracyGame extends ARMinigame {
    constructor() {
        super(3);
        this.targets = [];
        this.shotsRemaining = 5;
        this.hits = 0;
        this.requiredHits = 3;
    }
    
    initialize() {
        super.initialize();
        this.createTargets();
        Utils.playSound('cannon-ready');
    }
    
    createTargets() {
        this.targets = [];
        for (let i = 0; i < 4; i++) {
            this.targets.push({
                id: i,
                x: Utils.randomBetween(-1, 1),
                y: Utils.randomBetween(0.2, 0.8),
                z: Utils.randomBetween(-1.5, -0.5),
                hit: false,
                visible: true
            });
        }
    }
    
    handleAction() {
        if (this.shotsRemaining > 0) {
            this.fire();
        }
    }
    
    fire() {
        this.shotsRemaining--;
        
        // Simple hit detection - randomly hit one of the visible targets
        const visibleTargets = this.targets.filter(t => t.visible && !t.hit);
        
        if (visibleTargets.length > 0 && Math.random() < 0.6) { // 60% hit chance
            const target = visibleTargets[Utils.randomInt(0, visibleTargets.length - 1)];
            target.hit = true;
            this.hits++;
            
            Utils.playSound('cannon-hit');
            Utils.vibrate(300);
        } else {
            Utils.playSound('cannon-miss');
        }
        
        this.progress = ((this.shotsRemaining === 0) || (this.hits >= this.requiredHits)) ? 100 : 
                       (5 - this.shotsRemaining) * 20;
        
        if (this.shotsRemaining === 0 || this.hits >= this.requiredHits) {
            this.complete();
        }
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        
        const success = this.hits >= this.requiredHits;
        
        if (success) {
            Utils.playSound('success');
            Utils.vibrate([200, 100, 200]);
            
            if (window.ARView) {
                window.ARView.completeCheckpoint(3, false);
            }
        } else {
            Utils.playSound('failure');
            if (window.ARView) {
                window.ARView.showMessage(`Not enough hits! You need ${this.requiredHits} hits.`);
            }
            setTimeout(() => this.reset(), 3000);
        }
    }
    
    reset() {
        super.reset();
        this.shotsRemaining = 5;
        this.hits = 0;
        this.createTargets();
    }
    
    getUIContent() {
        return `
            <div class="cannon-game">
                <h3>⚡ Cannonball Accuracy</h3>
                <div class="game-stats">
                    <div>Shots: ${this.shotsRemaining}/5</div>
                    <div>Hits: ${this.hits}/${this.requiredHits}</div>
                </div>
                <div class="targets">
                    ${this.targets.map(t => `
                        <div class="target ${t.hit ? 'hit' : 'active'}">${t.hit ? '💥' : '🎯'}</div>
                    `).join('')}
                </div>
                <p>${this.shotsRemaining > 0 ? 'Tap Action to fire!' : 'Game complete!'}</p>
            </div>
        `;
    }
}

// Checkpoint 4: Treasure Chest Lock - Sequence-based puzzle
class TreasureChestLockGame extends ARMinigame {
    constructor() {
        super(4);
        this.sequence = [];
        this.playerSequence = [];
        this.sequenceLength = 4;
        this.symbols = ['⚓', '🗡️', '💎', '🏴‍☠️', '🦜', '🌊'];
    }
    
    initialize() {
        super.initialize();
        this.generateSequence();
        this.showSequence();
        Utils.playSound('chest-open');
    }
    
    generateSequence() {
        this.sequence = [];
        for (let i = 0; i < this.sequenceLength; i++) {
            this.sequence.push(this.symbols[Utils.randomInt(0, this.symbols.length - 1)]);
        }
    }
    
    showSequence() {
        // In a real implementation, this would animate the sequence
        console.log('Sequence to remember:', this.sequence);
        
        setTimeout(() => {
            this.startInput();
        }, 3000);
    }
    
    startInput() {
        this.playerSequence = [];
        this.progress = 0;
    }
    
    addSymbol(symbol) {
        if (this.playerSequence.length < this.sequenceLength) {
            this.playerSequence.push(symbol);
            this.progress = (this.playerSequence.length / this.sequenceLength) * 100;
            
            Utils.playSound('click');
            
            if (this.playerSequence.length === this.sequenceLength) {
                this.checkSequence();
            }
        }
    }
    
    checkSequence() {
        const correct = this.sequence.every((symbol, index) => 
            symbol === this.playerSequence[index]
        );
        
        if (correct) {
            this.complete();
        } else {
            Utils.playSound('incorrect');
            Utils.vibrate([100, 100, 100]);
            
            if (window.ARView) {
                window.ARView.showMessage('Wrong sequence! Try again.');
            }
            
            setTimeout(() => {
                this.reset();
                this.showSequence();
            }, 2000);
        }
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        
        Utils.playSound('success');
        Utils.vibrate([200, 100, 200]);
        
        if (window.ARView) {
            window.ARView.completeCheckpoint(4, true); // Awards key
        }
    }
    
    reset() {
        super.reset();
        this.playerSequence = [];
        this.generateSequence();
    }
    
    getUIContent() {
        return `
            <div class="chest-game">
                <h3>🏴‍☠️ Treasure Chest Lock</h3>
                <div class="sequence-display">
                    <p>Remember the sequence:</p>
                    <div class="sequence">${this.sequence.join(' ')}</div>
                </div>
                <div class="input-sequence">
                    <p>Your input:</p>
                    <div class="player-sequence">${this.playerSequence.join(' ')} ${'_'.repeat(this.sequenceLength - this.playerSequence.length)}</div>
                </div>
                <div class="symbol-buttons">
                    ${this.symbols.map(symbol => `
                        <button 
                            class="symbol-btn"
                            onclick="currentMinigame.addSymbol('${symbol}')"
                            ${this.playerSequence.length >= this.sequenceLength ? 'disabled' : ''}
                        >
                            ${symbol}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Checkpoint 5: Pirate's Balance - Motion-controlled coin balancing
class PirateBalanceGame extends ARMinigame {
    constructor() {
        super(5);
        this.coins = [];
        this.totalCoins = 5;
        this.balanceTime = 10000; // 10 seconds
        this.startTime = null;
        this.motionHandler = null;
        this.tilt = { x: 0, y: 0 };
    }
    
    initialize() {
        super.initialize();
        this.createCoins();
        this.setupMotionListener();
        this.startTime = Date.now();
        Utils.playSound('coins');
    }
    
    createCoins() {
        this.coins = [];
        for (let i = 0; i < this.totalCoins; i++) {
            this.coins.push({
                id: i,
                x: Utils.randomBetween(-0.5, 0.5),
                y: 0.5,
                vx: 0,
                vy: 0,
                onTable: true
            });
        }
    }
    
    setupMotionListener() {
        if (Utils.DeviceCapabilities.hasDeviceMotion()) {
            this.motionHandler = (event) => {
                this.tilt.x = event.accelerationIncludingGravity.x || 0;
                this.tilt.y = event.accelerationIncludingGravity.y || 0;
                this.updateCoins();
            };
            
            window.addEventListener('devicemotion', this.motionHandler);
        }
    }
    
    updateCoins() {
        this.coins.forEach(coin => {
            if (coin.onTable) {
                // Apply tilt physics
                coin.vx += this.tilt.x * 0.01;
                coin.vy += this.tilt.y * 0.01;
                
                // Apply friction
                coin.vx *= 0.95;
                coin.vy *= 0.95;
                
                // Update position
                coin.x += coin.vx;
                coin.y += coin.vy;
                
                // Check if coin falls off table
                if (Math.abs(coin.x) > 0.8 || Math.abs(coin.y) > 0.8) {
                    coin.onTable = false;
                    Utils.playSound('coin-drop');
                }
            }
        });
        
        this.checkGameState();
    }
    
    checkGameState() {
        const coinsOnTable = this.coins.filter(c => c.onTable).length;
        const elapsed = Date.now() - this.startTime;
        
        this.progress = Math.min((elapsed / this.balanceTime) * 100, 100);
        
        if (coinsOnTable === 0) {
            // All coins fell off
            this.fail();
        } else if (elapsed >= this.balanceTime) {
            // Time's up, success if any coins remain
            this.complete();
        }
    }
    
    fail() {
        Utils.playSound('failure');
        if (window.ARView) {
            window.ARView.showMessage('All coins fell! Try to keep them balanced.');
        }
        setTimeout(() => this.reset(), 3000);
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        
        Utils.playSound('success');
        Utils.vibrate([200, 100, 200]);
        
        if (window.ARView) {
            window.ARView.completeCheckpoint(5, false);
        }
    }
    
    cleanup() {
        super.cleanup();
        if (this.motionHandler) {
            window.removeEventListener('devicemotion', this.motionHandler);
        }
    }
    
    reset() {
        super.reset();
        this.createCoins();
        this.startTime = Date.now();
    }
    
    getUIContent() {
        const coinsOnTable = this.coins.filter(c => c.onTable).length;
        const elapsed = this.startTime ? Date.now() - this.startTime : 0;
        const timeLeft = Math.max(0, this.balanceTime - elapsed);
        
        return `
            <div class="balance-game">
                <h3>⚖️ Pirate's Balance</h3>
                <div class="game-stats">
                    <div>Coins: ${coinsOnTable}/${this.totalCoins}</div>
                    <div>Time: ${Math.ceil(timeLeft / 1000)}s</div>
                </div>
                <div class="balance-table">
                    ${this.coins.map(coin => 
                        coin.onTable ? '🪙' : '❌'
                    ).join(' ')}
                </div>
                <p>Tilt your device to keep the coins balanced!</p>
                <div class="tilt-indicator">
                    Tilt: X=${this.tilt.x.toFixed(1)} Y=${this.tilt.y.toFixed(1)}
                </div>
            </div>
        `;
    }
}

// Checkpoint 6: Skeleton Duel - Quick-tap reaction game
class SkeletonDuelGame extends ARMinigame {
    constructor() {
        super(6);
        this.round = 0;
        this.totalRounds = 5;
        this.wins = 0;
        this.requiredWins = 3;
        this.reactionTime = null;
        this.showTime = null;
        this.isWaitingForReaction = false;
    }
    
    initialize() {
        super.initialize();
        this.startNextRound();
        Utils.playSound('duel-start');
    }
    
    startNextRound() {
        this.round++;
        this.isWaitingForReaction = false;
        
        // Random delay before showing attack
        const delay = Utils.randomBetween(2000, 5000);
        
        setTimeout(() => {
            this.showAttack();
        }, delay);
    }
    
    showAttack() {
        this.showTime = Date.now();
        this.isWaitingForReaction = true;
        
        Utils.playSound('sword-clash');
        Utils.vibrate(100);
        
        // Auto-fail after 1 second
        setTimeout(() => {
            if (this.isWaitingForReaction) {
                this.handleReaction(false);
            }
        }, 1000);
    }
    
    handleAction() {
        if (this.isWaitingForReaction) {
            this.reactionTime = Date.now() - this.showTime;
            this.handleReaction(true);
        }
    }
    
    handleReaction(success) {
        this.isWaitingForReaction = false;
        
        if (success && this.reactionTime < 800) { // Must react within 800ms
            this.wins++;
            Utils.playSound('victory');
            Utils.vibrate(200);
        } else {
            Utils.playSound('defeat');
        }
        
        this.progress = (this.round / this.totalRounds) * 100;
        
        if (this.round >= this.totalRounds) {
            this.complete();
        } else {
            setTimeout(() => {
                this.startNextRound();
            }, 1500);
        }
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        
        const success = this.wins >= this.requiredWins;
        
        if (success) {
            Utils.playSound('success');
            Utils.vibrate([200, 100, 200]);
            
            if (window.ARView) {
                window.ARView.completeCheckpoint(6, false);
            }
        } else {
            Utils.playSound('failure');
            if (window.ARView) {
                window.ARView.showMessage(`Not enough wins! You need ${this.requiredWins} victories.`);
            }
            setTimeout(() => this.reset(), 3000);
        }
    }
    
    reset() {
        super.reset();
        this.round = 0;
        this.wins = 0;
        this.reactionTime = null;
        this.isWaitingForReaction = false;
    }
    
    getUIContent() {
        return `
            <div class="duel-game">
                <h3>⚔️ Skeleton Duel</h3>
                <div class="duel-stats">
                    <div>Round: ${this.round}/${this.totalRounds}</div>
                    <div>Wins: ${this.wins}/${this.requiredWins}</div>
                </div>
                <div class="duel-area ${this.isWaitingForReaction ? 'attack-mode' : ''}">
                    ${this.isWaitingForReaction ? '⚡ TAP NOW! ⚡' : 'Get ready...'}
                </div>
                ${this.reactionTime ? `<div class="reaction-time">Last: ${this.reactionTime}ms</div>` : ''}
                <p>${this.isWaitingForReaction ? 'Quick! Tap Action!' : 'Wait for the skeleton to attack...'}</p>
            </div>
        `;
    }
}

// Checkpoint 7: Map Assembly - AR drag-and-drop puzzle
class MapAssemblyGame extends ARMinigame {
    constructor() {
        super(7);
        this.pieces = [];
        this.totalPieces = 4;
        this.placedPieces = 0;
    }
    
    initialize() {
        super.initialize();
        this.createMapPieces();
        Utils.playSound('map-unfold');
    }
    
    createMapPieces() {
        this.pieces = [
            { id: 1, name: 'Northwest', placed: false, correctPosition: { x: -0.5, y: 0.5 } },
            { id: 2, name: 'Northeast', placed: false, correctPosition: { x: 0.5, y: 0.5 } },
            { id: 3, name: 'Southwest', placed: false, correctPosition: { x: -0.5, y: -0.5 } },
            { id: 4, name: 'Southeast', placed: false, correctPosition: { x: 0.5, y: -0.5 } }
        ];
    }
    
    handleAction() {
        // Simulate placing the next piece
        const nextPiece = this.pieces.find(p => !p.placed);
        if (nextPiece) {
            this.placePiece(nextPiece.id);
        }
    }
    
    placePiece(pieceId) {
        const piece = this.pieces.find(p => p.id === pieceId);
        if (piece && !piece.placed) {
            piece.placed = true;
            this.placedPieces++;
            
            Utils.playSound('piece-place');
            Utils.vibrate(150);
            
            this.progress = (this.placedPieces / this.totalPieces) * 100;
            
            if (this.placedPieces === this.totalPieces) {
                this.complete();
            }
        }
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        
        Utils.playSound('success');
        Utils.vibrate([200, 100, 200]);
        
        if (window.ARView) {
            window.ARView.completeCheckpoint(7, true); // Awards key
        }
    }
    
    reset() {
        super.reset();
        this.placedPieces = 0;
        this.pieces.forEach(p => p.placed = false);
    }
    
    getUIContent() {
        return `
            <div class="map-game">
                <h3>🗺️ Map Assembly</h3>
                <div class="map-progress">
                    Pieces: ${this.placedPieces}/${this.totalPieces}
                </div>
                <div class="map-grid">
                    ${this.pieces.map(piece => `
                        <div class="map-piece ${piece.placed ? 'placed' : 'empty'}"
                             onclick="currentMinigame.placePiece(${piece.id})">
                            ${piece.placed ? '🗺️' : '📋'}
                            <br>${piece.name}
                        </div>
                    `).join('')}
                </div>
                <p>Tap Action or click pieces to assemble the map!</p>
            </div>
        `;
    }
}

// Checkpoint 8: The Lost Loot - Final treasure opening
class LostLootGame extends ARMinigame {
    constructor() {
        super(8);
        this.keysUsed = 0;
        this.requiredKeys = 3;
        this.treasureOpened = false;
    }
    
    initialize() {
        super.initialize();
        
        // Check if player has all 3 keys
        const state = GameState.getState();
        const hasAllKeys = state.keys.length >= 3;
        
        if (!hasAllKeys) {
            if (window.ARView) {
                window.ARView.showMessage('You need all 3 golden keys to open the treasure!');
            }
            return;
        }
        
        Utils.playSound('treasure-reveal');
    }
    
    handleAction() {
        if (this.keysUsed < this.requiredKeys) {
            this.useKey();
        } else if (!this.treasureOpened) {
            this.openTreasure();
        }
    }
    
    useKey() {
        this.keysUsed++;
        this.progress = (this.keysUsed / this.requiredKeys) * 100;
        
        Utils.playSound('key-turn');
        Utils.vibrate(200);
        
        if (this.keysUsed === this.requiredKeys) {
            setTimeout(() => {
                this.enableTreasureOpening();
            }, 1000);
        }
    }
    
    enableTreasureOpening() {
        Utils.playSound('unlock');
        Utils.vibrate([100, 100, 100]);
    }
    
    openTreasure() {
        this.treasureOpened = true;
        this.complete();
    }
    
    complete() {
        this.isCompleted = true;
        this.progress = 100;
        
        Utils.playSound('treasure-found');
        Utils.vibrate([300, 100, 300, 100, 300]);
        
        if (window.ARView) {
            window.ARView.completeCheckpoint(8, false);
        }
        
        // End the game
        setTimeout(() => {
            this.endGame();
        }, 2000);
    }
    
    async endGame() {
        const stats = GameState.getGameStats();
        
        try {
            await APIClient.endGame(stats.teamId, stats);
            
            if (window.ARView) {
                window.ARView.showMessage('🎉 Congratulations! You found the Lost Loot! 🎉');
            }
            
            // Redirect to completion screen or HUD
            setTimeout(() => {
                window.location.href = 'hud.html';
            }, 5000);
            
        } catch (error) {
            console.error('Error ending game:', error);
        }
    }
    
    getUIContent() {
        const state = GameState.getState();
        const hasAllKeys = state.keys.length >= 3;
        
        if (!hasAllKeys) {
            return `
                <div class="treasure-game">
                    <h3>💰 The Lost Loot</h3>
                    <p>❌ You need all 3 golden keys!</p>
                    <p>Current keys: ${state.keys.length}/3</p>
                    <p>Complete checkpoints 1, 4, and 7 to earn all keys.</p>
                </div>
            `;
        }
        
        return `
            <div class="treasure-game">
                <h3>💰 The Lost Loot</h3>
                <div class="treasure-status">
                    <div>Keys used: ${this.keysUsed}/3</div>
                    <div class="key-slots">
                        ${Array.from({length: 3}).map((_, i) => 
                            `<span class="key-slot ${i < this.keysUsed ? 'used' : 'ready'}">${i < this.keysUsed ? '🔓' : '🗝️'}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="treasure-chest ${this.treasureOpened ? 'opened' : 'closed'}">
                    ${this.treasureOpened ? '💎✨💰✨💎' : '📦'}
                </div>
                <p>
                    ${this.keysUsed < 3 ? 'Use your golden keys!' : 
                      !this.treasureOpened ? 'Open the treasure!' : 
                      '🎉 Treasure found! 🎉'}
                </p>
            </div>
        `;
    }
}

// Export minigame classes
if (typeof window !== 'undefined') {
    window.CaptainCompassGame = CaptainCompassGame;
    window.KrakenQuizGame = KrakenQuizGame;
    window.CannonballAccuracyGame = CannonballAccuracyGame;
    window.TreasureChestLockGame = TreasureChestLockGame;
    window.PirateBalanceGame = PirateBalanceGame;
    window.SkeletonDuelGame = SkeletonDuelGame;
    window.MapAssemblyGame = MapAssemblyGame;
    window.LostLootGame = LostLootGame;
}