// Game State Management Module
class GameStateManager {
    constructor() {
        this.state = {
            teamId: null,
            startTime: null,
            checkpoints: [], // Array of completed checkpoint numbers
            keys: [], // Array of collected key numbers (1, 2, 3)
            isGameComplete: false,
            lastSync: null
        };
        
        this.loadFromStorage();
    }
    
    // Initialize team and start game
    async initializeTeam(teamId) {
        try {
            // Call API to start game
            const response = await APIClient.startGame(teamId);
            
            this.state = {
                teamId: teamId,
                startTime: Date.now(),
                checkpoints: [],
                keys: [],
                isGameComplete: false,
                lastSync: Date.now()
            };
            
            this.saveToStorage();
            
            console.log(`Game initialized for team: ${teamId}`);
            return this.state;
        } catch (error) {
            console.error('Failed to initialize team:', error);
            throw new Error('Failed to start game. Please check your connection.');
        }
    }
    
    // Check if game is initialized
    isInitialized() {
        return this.state.teamId !== null && this.state.startTime !== null;
    }
    
    // Get current state
    getState() {
        return { ...this.state };
    }
    
    // Complete a checkpoint
    async completeCheckpoint(checkpointNumber, earnedKey = false) {
        try {
            // Validate checkpoint completion
            if (this.state.checkpoints.includes(checkpointNumber)) {
                throw new Error('Checkpoint already completed');
            }
            
            // Check if checkpoint is unlocked (sequential completion)
            if (checkpointNumber > 1 && !this.state.checkpoints.includes(checkpointNumber - 1)) {
                throw new Error('Previous checkpoint must be completed first');
            }
            
            // Update local state
            this.state.checkpoints.push(checkpointNumber);
            
            // Add key if earned (checkpoints 1, 4, 7 award keys)
            if (earnedKey && [1, 4, 7].includes(checkpointNumber)) {
                const keyNumber = checkpointNumber === 1 ? 1 : checkpointNumber === 4 ? 2 : 3;
                if (!this.state.keys.includes(keyNumber)) {
                    this.state.keys.push(keyNumber);
                }
            }
            
            // Check if game is complete (all checkpoints done)
            if (this.state.checkpoints.length === 8) {
                this.state.isGameComplete = true;
            }
            
            // Save to storage
            this.saveToStorage();
            
            // Sync with server
            await APIClient.completeCheckpoint(this.state.teamId, checkpointNumber, earnedKey);
            
            console.log(`Checkpoint ${checkpointNumber} completed. Keys: ${this.state.keys.length}/3`);
            
            return this.state;
        } catch (error) {
            console.error('Failed to complete checkpoint:', error);
            throw error;
        }
    }
    
    // Sync state with server
    async syncWithServer() {
        try {
            if (!this.state.teamId) {
                return;
            }
            
            const serverState = await APIClient.getTeamStatus(this.state.teamId);
            
            // Update local state with server data
            if (serverState) {
                this.state.checkpoints = serverState.checkpoints || [];
                this.state.keys = serverState.keys || [];
                this.state.isGameComplete = serverState.isGameComplete || false;
                this.state.lastSync = Date.now();
                
                this.saveToStorage();
                
                console.log('State synced with server');
            }
            
            return this.state;
        } catch (error) {
            console.error('Failed to sync with server:', error);
            // Don't throw error to avoid breaking the game flow
            return this.state;
        }
    }
    
    // Get next unlocked checkpoint
    getNextCheckpoint() {
        for (let i = 1; i <= 8; i++) {
            if (!this.state.checkpoints.includes(i)) {
                return i;
            }
        }
        return null; // All checkpoints completed
    }
    
    // Check if checkpoint is unlocked
    isCheckpointUnlocked(checkpointNumber) {
        if (checkpointNumber === 1) return true;
        return this.state.checkpoints.includes(checkpointNumber - 1);
    }
    
    // Check if checkpoint is completed
    isCheckpointCompleted(checkpointNumber) {
        return this.state.checkpoints.includes(checkpointNumber);
    }
    
    // Get game statistics
    getGameStats() {
        const elapsedTime = this.state.startTime ? Date.now() - this.state.startTime : 0;
        
        return {
            teamId: this.state.teamId,
            elapsedTime: elapsedTime,
            checkpointsCompleted: this.state.checkpoints.length,
            totalCheckpoints: 8,
            keysCollected: this.state.keys.length,
            totalKeys: 3,
            completionPercentage: (this.state.checkpoints.length / 8) * 100,
            isComplete: this.state.isGameComplete
        };
    }
    
    // Reset game state (for testing or new game)
    reset() {
        this.state = {
            teamId: null,
            startTime: null,
            checkpoints: [],
            keys: [],
            isGameComplete: false,
            lastSync: null
        };
        this.saveToStorage();
    }
    
    // Save state to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('lostLootGameState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save state to storage:', error);
        }
    }
    
    // Load state from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('lostLootGameState');
            if (saved) {
                const parsedState = JSON.parse(saved);
                this.state = { ...this.state, ...parsedState };
                console.log('Game state loaded from storage');
            }
        } catch (error) {
            console.error('Failed to load state from storage:', error);
            // Reset to default state on error
            this.reset();
        }
    }
    
    // Export state for debugging
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
    
    // Import state for debugging
    importState(stateJson) {
        try {
            const importedState = JSON.parse(stateJson);
            this.state = { ...this.state, ...importedState };
            this.saveToStorage();
            console.log('State imported successfully');
        } catch (error) {
            console.error('Failed to import state:', error);
            throw new Error('Invalid state format');
        }
    }
}

// Create global instance
const GameState = new GameStateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}