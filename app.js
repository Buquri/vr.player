/* app.js - Advanced VR Engine */
document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('#main-video');
  const curvedScreen = document.querySelector('#vr-screen');
  const webBrowserScreen = document.querySelector('#web-browser-plane');
  const ambilight = document.querySelector('#ambilight-aura');
  const sky = document.querySelector('#scene-sky');

  // Video Streaming / HLS Engine
  window.loadVideoUrl = function(url) {
    if (!url) return;
    if (url.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else {
      video.src = url;
      video.play();
    }
  };

  // Web Browser / Web-View Loader
  window.loadWebPage = function(url) {
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const iframe = document.querySelector('#browser-iframe');
    if (iframe) {
      iframe.src = url;
      // Show browser screen in VR, hide video screen
      webBrowserScreen.setAttribute('visible', 'true');
      curvedScreen.setAttribute('visible', 'false');
    }
  };

  window.switchToVideoMode = function() {
    webBrowserScreen.setAttribute('visible', 'false');
    curvedScreen.setAttribute('visible', 'true');
  };

  // Local File Loader
  const fileInput = document.querySelector('#file-selector');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        video.src = URL.createObjectURL(file);
        switchToVideoMode();
        video.play();
      }
    });
  }

  // VR 3D Controls
  window.togglePlay = () => {
    switchToVideoMode();
    video.paused ? video.play() : video.pause();
  };

  window.skipTime = (seconds) => {
    video.currentTime += seconds;
  };

  // Environment Switcher
  window.setEnvironment = (type) => {
    if (type === 'passthrough') {
      sky.setAttribute('material', 'transparent: true; opacity: 0');
    } else if (type === 'void') {
      sky.setAttribute('material', 'transparent: false; opacity: 1; color: #000000');
    }
  };

  // Screen Adjustments
  window.adjustCurve = (delta) => {
    let currentTheta = parseFloat(curvedScreen.getAttribute('theta-length') || 75);
    let newTheta = Math.max(30, Math.min(180, currentTheta + delta));
    curvedScreen.setAttribute('theta-length', newTheta);
  };

  window.adjustDistance = (delta) => {
    let pos = curvedScreen.getAttribute('position');
    pos.z = Math.min(-1, Math.max(-8, pos.z + delta));
    curvedScreen.setAttribute('position', pos);
    
    // Also move HUD and Ambilight relatively
    let lightPos = ambilight.getAttribute('position');
    lightPos.z = pos.z;
    ambilight.setAttribute('position', lightPos);
  };

  // Dynamic Ambilight Engine
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 16;
  canvas.height = 16;

  function updateAmbilight() {
    if (!video.paused && !video.ended && video.readyState >= 2 && curvedScreen.getAttribute('visible') !== 'false') {
      ctx.drawImage(video, 0, 0, 16, 16);
      const pixel = ctx.getImageData(8, 8, 1, 1).data;
      const rgbColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      if (ambilight) {
        ambilight.setAttribute('light', `color: ${rgbColor}; intensity: 2.2`);
      }
    }
    requestAnimationFrame(updateAmbilight);
  }
  updateAmbilight();
});