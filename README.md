# Lost Loot - Pirate-themed AR Treasure Hunt Game

A complete pirate-themed, team-based AR treasure hunt game using A-Frame and AR.js where teams of three complete 8 AR minigames at physical locations with real-time synchronized progress.

## 🏴‍☠️ Game Overview

Lost Loot is an immersive AR treasure hunt experience where teams of pirates compete to find the legendary lost treasure. Navigate through 8 challenging checkpoints, collect golden keys, and work together to unlock the ultimate prize!

### Key Features

- **8 Unique AR Minigames**: Each checkpoint offers a different challenge
- **Progressive Unlocking**: Complete checkpoints in sequence to unlock new areas
- **Golden Keys System**: Collect 3 special keys from checkpoints 1, 4, and 7
- **Real-time Synchronization**: Team progress syncs every 5 seconds
- **Mobile AR Support**: Works on modern smartphones with camera access

## 🎮 How to Play

### Getting Started

1. **Team Formation**: Assemble your crew of 3 pirates
2. **Login**: Enter your team ID on the main screen
3. **Start Hunt**: Begin your treasure hunting adventure
4. **Navigate**: Use the HUD to track progress and see clues
5. **Scan Markers**: Use the AR view to find and complete checkpoints
6. **Find Treasure**: Collect all 3 golden keys to unlock the final treasure

### The 8 Checkpoints

1. **⭐ The Captain's Compass** - Navigate by device orientation (Awards Key 1)
2. **🐙 The Kraken's Quiz** - Answer pirate trivia questions
3. **⚡ Cannonball Accuracy** - Test your shooting skills
4. **⭐ Treasure Chest Lock** - Solve the sequence puzzle (Awards Key 2)
5. **⚖️ Pirate's Balance** - Keep coins balanced using device motion
6. **⚔️ Skeleton Duel** - Quick reaction-based combat
7. **⭐ Map Assembly** - Piece together the treasure map (Awards Key 3)
8. **💰 The Lost Loot** - Use all 3 keys to unlock the final treasure

*⭐ indicates checkpoints that award golden keys*

## 🚀 Setup Instructions

### Prerequisites

- Modern web browser with JavaScript enabled
- Mobile device with camera access (recommended)
- HTTPS connection (required for AR features)
- Stable internet connection

### Installation

1. **Clone or download** this repository
2. **Serve files** using a web server (HTTPS required for camera access):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using Live Server (VS Code extension)
   Right-click index.html → "Open with Live Server"
   ```
3. **Access the game** at `https://localhost:8000` (or your server URL)

### For Development

If you're setting up a backend API server:

1. Update the API base URL in `js/api-client.js`
2. Implement the following endpoints:
   - `POST /api/game/start` - Initialize team session
   - `GET /api/team/status/{teamId}` - Get team progress
   - `POST /api/checkpoint/complete` - Mark checkpoint complete
   - `POST /api/game/end` - Finish game

## 📱 Browser Compatibility

### Recommended Browsers
- **Mobile**: Chrome 90+, Safari 14+, Firefox 88+
- **Desktop**: Chrome 90+, Edge 90+, Firefox 88+ (limited AR support)

### Required Permissions
- **Camera Access**: Required for AR marker detection
- **Device Orientation**: Used for compass and balance games
- **Device Motion**: Used for motion-controlled games

## 🎯 AR Markers

The game uses 8 unique AR markers for checkpoint activation. Markers should be:
- High contrast black and white patterns
- Printed on flat surfaces
- Well-lit for optimal detection
- Approximately 5cm x 5cm or larger

*Note: Currently using placeholder Hiro marker for demo. Custom markers can be added in the `assets/markers/` directory.*

## 🛠️ Technical Architecture

### Frontend Stack
- **A-Frame 1.3.0+**: WebXR and 3D scene management
- **AR.js 3.4.0+**: Marker-based AR tracking
- **Vanilla JavaScript**: Game logic and state management
- **CSS3**: Responsive UI and animations

### File Structure
```
lost-loot/
├── index.html          # Team login screen
├── hud.html           # Main game HUD
├── ar.html            # AR view with minigames
├── css/
│   └── styles.css     # Game styling
├── js/
│   ├── game-state.js  # State management
│   ├── api-client.js  # Backend communication
│   ├── ar-minigames.js # AR game logic
│   └── utils.js       # Helper functions
├── assets/
│   ├── markers/       # AR marker images
│   ├── models/        # 3D models (placeholder)
│   ├── images/        # UI icons and graphics
│   └── audio/         # Sound effects (placeholder)
└── README.md
```

### State Management
- Client-side state object with team data
- Real-time synchronization via API polling (5-second intervals)
- Local storage persistence for offline resilience

## 🎵 Assets

### Audio Files (Placeholder)
Place audio files in `assets/audio/` directory:
- `compass-start.mp3` - Compass activation
- `quiz-start.mp3` - Quiz beginning
- `cannon-hit.mp3` - Successful cannon shot
- `success.mp3` - Checkpoint completion
- `treasure-found.mp3` - Final treasure discovery

### 3D Models (Placeholder)
Place GLTF models in `assets/models/` directory:
- `compass.gltf` - Compass model
- `ship.gltf` - Pirate ship
- `chest.gltf` - Treasure chest
- `skeleton.gltf` - Skeleton warrior
- `key.gltf` - Golden key

## 🔧 Configuration

### API Configuration
Edit `js/api-client.js` to configure your backend:
```javascript
// Update the base URL for your API server
this.baseURL = 'https://your-api-server.com/api';
```

### Game Settings
Modify game parameters in the respective minigame classes:
- Difficulty levels
- Time limits
- Required scores
- Number of attempts

## 🐛 Troubleshooting

### Common Issues

**Camera not working:**
- Ensure HTTPS connection
- Grant camera permissions
- Try refreshing the page
- Check browser compatibility

**AR markers not detected:**
- Ensure good lighting
- Keep marker flat and steady
- Try moving closer/further from marker
- Clean camera lens

**Game not syncing:**
- Check internet connection
- Verify API server status
- Clear browser cache and cookies

**Audio not playing:**
- Check device volume
- Ensure files exist in `assets/audio/`
- Some browsers require user interaction before audio

### Debug Mode

Open browser developer tools (F12) to see console logs for debugging:
- State management operations
- API calls and responses
- AR tracking events
- Minigame progress

## 🎨 Customization

### Adding New Minigames

1. Create a new class extending `ARMinigame` in `ar-minigames.js`
2. Implement required methods: `initialize()`, `handleAction()`, `getUIContent()`
3. Add the marker HTML in `ar.html`
4. Update the minigames object in the AR view script

### Styling

Modify `css/styles.css` to customize:
- Color schemes
- Fonts and typography
- Button styles
- Animation effects

## 📄 License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## 🙏 Acknowledgments

- **A-Frame** - WebXR framework
- **AR.js** - AR library for the web
- Pirate emoji and symbols from standard Unicode sets

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional minigames
- Enhanced 3D models and animations
- Backend implementation
- Performance optimizations
- Cross-platform testing

---

**⚓ Set sail for adventure and find the Lost Loot! ⚓**