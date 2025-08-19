# Simple AR Web App

A simple marker-based Augmented Reality web application that displays a 3D box when scanning the Hiro marker.

## Features

- 📱 Works on mobile devices and desktop browsers
- 🎯 Uses the standard Hiro marker for AR tracking
- 📦 Displays a rotating 3D box with text
- 🌐 No app installation required - runs in web browsers
- 🔒 Secure HTTPS-ready for camera access

## How to Use

1. Open `index.html` in a web browser
2. Allow camera access when prompted
3. Point your camera at the Hiro marker (available in `marker.html`)
4. Watch the 3D box appear and rotate!

## Files

- `index.html` - Main AR application
- `marker.html` - Displays the Hiro marker for testing
- `README.md` - This documentation

## Technologies Used

- [A-Frame](https://aframe.io/) - Web VR/AR framework
- [AR.js](https://ar-js-org.github.io/AR.js/) - Augmented Reality for the web
- HTML5/CSS3/JavaScript

## Deployment

### GitHub Pages
1. Create a new repository on GitHub
2. Upload these files to the repository
3. Go to Settings → Pages
4. Select source branch (usually `main`)
5. Your app will be available at `https://yourusername.github.io/repository-name`

### Other Hosting Options
- **Netlify**: Drag and drop the files to [netlify.com](https://netlify.com)
- **Vercel**: Connect your GitHub repository to [vercel.com](https://vercel.com)
- **Local Testing**: Use a local server with HTTPS (required for camera access)

## Browser Compatibility

- ✅ Chrome (Android/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Android/Desktop)
- ✅ Edge (Desktop)

## Tips for Best Results

- Ensure good lighting conditions
- Print the marker on paper or display on another screen
- Keep the marker flat and fully visible
- Hold your device steady for better tracking
- The marker should be approximately 5-10cm in size

## Customization

You can easily customize the AR content by modifying the `<a-marker>` section in `index.html`:

```html
<a-box 
    position="0 0.5 0" 
    material="color: #FF6B6B"
    animation="property: rotation; to: 0 360 0; loop: true; dur: 4000">
</a-box>
```

## Troubleshooting

- **Camera not working**: Make sure you're accessing the site via HTTPS
- **Marker not detected**: Ensure good lighting and marker visibility
- **Performance issues**: Try on a different device or reduce 3D model complexity

## License

This project is open source and available under the MIT License.