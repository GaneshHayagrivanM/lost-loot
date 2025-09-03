// Utility functions for the Lost Loot game

// Format time duration
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = (minutes % 60).toString().padStart(2, '0');
    const formattedSeconds = (seconds % 60).toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// Generate random ID
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Debounce function for limiting API calls
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Deep clone object
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
}

// Validate team ID format
function validateTeamId(teamId) {
    if (!teamId || typeof teamId !== 'string') {
        return false;
    }
    
    // Team ID should be 3-20 alphanumeric characters
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(teamId);
}

// Calculate distance between two points (for device orientation)
function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Normalize angle to 0-360 degrees
function normalizeAngle(angle) {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
}

// Convert degrees to radians
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Convert radians to degrees
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

// Get device orientation compass heading
function getCompassHeading(alpha, beta, gamma) {
    // Convert device orientation to compass heading
    // This is a simplified calculation for demo purposes
    const heading = alpha ? normalizeAngle(360 - alpha) : 0;
    return heading;
}

// Vibrate device (if supported)
function vibrate(pattern = 200) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// Play audio feedback
function playSound(soundName, volume = 1.0) {
    try {
        const audio = new Audio(`assets/audio/${soundName}.mp3`);
        audio.volume = volume;
        audio.play().catch(error => {
            console.log('Audio play failed:', error);
        });
    } catch (error) {
        console.log('Audio not available:', error);
    }
}

// Show toast notification
function showToast(message, duration = 3000, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add CSS styles if not already defined
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                max-width: 300px;
                word-wrap: break-word;
                animation: slideIn 0.3s ease-out;
            }
            .toast-info { background: #2196F3; }
            .toast-success { background: #4CAF50; }
            .toast-warning { background: #FF9800; }
            .toast-error { background: #F44336; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Local storage helpers
const Storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
};

// Random utility functions for games
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Device capabilities detection
const DeviceCapabilities = {
    hasDeviceOrientation: function() {
        return 'DeviceOrientationEvent' in window;
    },
    
    hasDeviceMotion: function() {
        return 'DeviceMotionEvent' in window;
    },
    
    hasVibration: function() {
        return 'vibrate' in navigator;
    },
    
    hasWebRTC: function() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },
    
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isIOS: function() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
    
    isAndroid: function() {
        return /Android/.test(navigator.userAgent);
    }
};

// AR utility functions
const ARUtils = {
    // Check if AR is supported
    isARSupported: function() {
        // Basic check for WebRTC (camera access)
        return DeviceCapabilities.hasWebRTC();
    },
    
    // Request camera permission with better error handling
    requestCameraPermission: async function() {
        try {
            // Check if permission API is available
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                if (permission.state === 'denied') {
                    console.warn('Camera permission previously denied');
                    return false;
                }
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Try rear camera first
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            stream.getTracks().forEach(track => track.stop());
            console.log('Camera permission granted successfully');
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            
            // Try fallback to any camera
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                fallbackStream.getTracks().forEach(track => track.stop());
                console.log('Camera permission granted with fallback');
                return true;
            } catch (fallbackError) {
                console.error('Fallback camera permission also failed:', fallbackError);
                return false;
            }
        }
    },
    
    // Validate marker pattern files
    validateMarkerFile: async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Marker file not found: ${url}`);
                return false;
            }
            const text = await response.text();
            // Basic validation - pattern files should have content
            return text.length > 1000; // Pattern files are typically several KB
        } catch (error) {
            console.error(`Error validating marker file ${url}:`, error);
            return false;
        }
    },
    
    // Get available fallback markers
    getFallbackMarkers: function() {
        return ['hiro', 'kanji']; // Built-in AR.js markers
    },
    
    // Create A-Frame animation
    createAnimation: function(property, to, duration = 1000, loop = false) {
        return {
            property: property,
            to: to,
            dur: duration,
            loop: loop
        };
    },
    
    // Check AR.js compatibility
    checkARjsCompatibility: function() {
        try {
            // Check if A-Frame is loaded and has required version
            if (typeof AFRAME === 'undefined') {
                // Check if script tags are present but failed to load
                const aframeScript = document.querySelector('script[src*="aframe"]');
                const arjsScript = document.querySelector('script[src*="AR.js"]');
                
                if (aframeScript && arjsScript) {
                    return Promise.resolve({ 
                        compatible: false, 
                        reason: 'A-Frame scripts present but not loaded - possibly blocked by ad blocker or network issues' 
                    });
                } else {
                    return Promise.resolve({ 
                        compatible: false, 
                        reason: 'A-Frame scripts not found in document' 
                    });
                }
            }
            
            // Check A-Frame version (should be 1.3.0 or compatible)
            const aframeVersion = AFRAME.version;
            if (aframeVersion && aframeVersion.startsWith('1.')) {
                console.log('A-Frame version:', aframeVersion);
            } else {
                console.warn('Unknown or potentially incompatible A-Frame version:', aframeVersion);
            }
            
            // Wait for AR.js to load (it might load asynchronously)
            const maxWaitTime = 5000; // 5 seconds
            const startTime = Date.now();
            
            return new Promise((resolve) => {
                const checkARjs = () => {
                    if (typeof AFRAME.components['arjs'] !== 'undefined') {
                        // Check for required AR components
                        const requiredComponents = ['arjs'];
                        const missingComponents = requiredComponents.filter(
                            component => typeof AFRAME.components[component] === 'undefined'
                        );
                        
                        if (missingComponents.length > 0) {
                            resolve({ compatible: false, reason: `Missing components: ${missingComponents.join(', ')}` });
                        } else {
                            resolve({ compatible: true, reason: 'All checks passed' });
                        }
                    } else if (Date.now() - startTime > maxWaitTime) {
                        resolve({ compatible: false, reason: 'AR.js failed to load within timeout - check network connection and ad blockers' });
                    } else {
                        setTimeout(checkARjs, 100);
                    }
                };
                
                checkARjs();
            });
            
        } catch (error) {
            return Promise.resolve({ compatible: false, reason: error.message });
        }
    }
};

// Performance monitoring
const Performance = {
    marks: {},
    
    mark: function(name) {
        this.marks[name] = performance.now();
    },
    
    measure: function(name, startMark) {
        const end = performance.now();
        const start = this.marks[startMark] || 0;
        const duration = end - start;
        console.log(`Performance ${name}: ${duration.toFixed(2)}ms`);
        return duration;
    }
};

// Error handling utilities
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    const userMessage = getUserFriendlyErrorMessage(error);
    showToast(userMessage, 5000, 'error');
    
    // Log error for debugging (in production, this would go to error tracking service)
    logError(error, context);
}

function getUserFriendlyErrorMessage(error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Network error. Please check your connection.';
    }
    
    if (error.message.includes('permission')) {
        return 'Permission required. Please allow camera access.';
    }
    
    if (error.message.includes('timeout')) {
        return 'Request timed out. Please try again.';
    }
    
    return 'Something went wrong. Please try again.';
}

function logError(error, context) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        context: context,
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // In production, send to error tracking service
    console.log('Error logged:', errorLog);
}

// Export utilities for global use
if (typeof window !== 'undefined') {
    window.Utils = {
        formatTime,
        generateId,
        debounce,
        throttle,
        deepClone,
        validateTeamId,
        calculateDistance,
        normalizeAngle,
        degreesToRadians,
        radiansToDegrees,
        getCompassHeading,
        vibrate,
        playSound,
        showToast,
        Storage,
        randomBetween,
        randomInt,
        shuffleArray,
        DeviceCapabilities,
        ARUtils,
        Performance,
        handleError
    };
}