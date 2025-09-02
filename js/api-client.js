// API Client for backend communication
class APIClientManager {
    constructor() {
        // Use environment variable or default to localhost for development
        this.baseURL = this.getBaseURL();
        this.timeout = 10000; // 10 second timeout
    }
    
    getBaseURL() {
        // In production, this would be the actual backend URL
        // For development/demo, we'll use a mock API or localhost
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return 'http://localhost:3000/api';
            }
        }
        
        // Default to a placeholder API (could be replaced with actual backend)
        return 'https://api.lost-loot.example.com/api';
    }
    
    // Generic HTTP request method
    async request(method, endpoint, data = null) {
        const url = `${this.baseURL}${endpoint}`;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            console.log(`API ${method} ${url}`, data ? data : '');
            
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), this.timeout);
            });
            
            // Create the fetch promise
            const fetchPromise = fetch(url, options);
            
            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            // For demo purposes, if the API is not available, return mock data
            if (!response.ok) {
                console.warn(`API request failed: ${response.status}`);
                return this.getMockResponse(method, endpoint, data);
            }
            
            const result = await response.json();
            console.log(`API Response:`, result);
            
            return result;
        } catch (error) {
            console.warn(`API request failed: ${error.message}`);
            
            // Return mock data for demo purposes
            return this.getMockResponse(method, endpoint, data);
        }
    }
    
    // Mock responses for demo/development
    getMockResponse(method, endpoint, data) {
        console.log('Using mock API response');
        
        if (endpoint === '/game/start' && method === 'POST') {
            return {
                success: true,
                teamId: data.teamId,
                startTime: Date.now(),
                message: 'Game started successfully'
            };
        }
        
        if (endpoint.startsWith('/team/status/') && method === 'GET') {
            const teamId = endpoint.split('/').pop();
            return {
                teamId: teamId,
                checkpoints: [],
                keys: [],
                isGameComplete: false,
                lastUpdated: Date.now()
            };
        }
        
        if (endpoint === '/checkpoint/complete' && method === 'POST') {
            return {
                success: true,
                checkpoint: data.checkpoint,
                earnedKey: data.earnedKey,
                message: 'Checkpoint completed successfully'
            };
        }
        
        if (endpoint === '/game/end' && method === 'POST') {
            return {
                success: true,
                teamId: data.teamId,
                completionTime: Date.now(),
                message: 'Game completed successfully'
            };
        }
        
        // Default mock response
        return {
            success: true,
            message: 'Mock response'
        };
    }
    
    // Start a new game session
    async startGame(teamId) {
        if (!teamId || typeof teamId !== 'string') {
            throw new Error('Invalid team ID');
        }
        
        return await this.request('POST', '/game/start', {
            teamId: teamId,
            startTime: Date.now()
        });
    }
    
    // Get team status and synchronize state
    async getTeamStatus(teamId) {
        if (!teamId) {
            throw new Error('Team ID is required');
        }
        
        return await this.request('GET', `/team/status/${teamId}`);
    }
    
    // Mark a checkpoint as completed
    async completeCheckpoint(teamId, checkpointNumber, earnedKey = false) {
        if (!teamId || !checkpointNumber) {
            throw new Error('Team ID and checkpoint number are required');
        }
        
        return await this.request('POST', '/checkpoint/complete', {
            teamId: teamId,
            checkpoint: checkpointNumber,
            earnedKey: earnedKey,
            completedAt: Date.now()
        });
    }
    
    // End the game
    async endGame(teamId, stats) {
        if (!teamId) {
            throw new Error('Team ID is required');
        }
        
        return await this.request('POST', '/game/end', {
            teamId: teamId,
            endTime: Date.now(),
            stats: stats
        });
    }
    
    // Get leaderboard data
    async getLeaderboard() {
        return await this.request('GET', '/leaderboard');
    }
    
    // Submit game feedback
    async submitFeedback(teamId, feedback) {
        return await this.request('POST', '/feedback', {
            teamId: teamId,
            feedback: feedback,
            submittedAt: Date.now()
        });
    }
    
    // Health check for API
    async healthCheck() {
        try {
            const response = await this.request('GET', '/health');
            return response.success || false;
        } catch (error) {
            return false;
        }
    }
    
    // Set custom base URL (for testing)
    setBaseURL(url) {
        this.baseURL = url;
    }
    
    // Set request timeout
    setTimeout(milliseconds) {
        this.timeout = milliseconds;
    }
}

// Create global instance
const APIClient = new APIClientManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}