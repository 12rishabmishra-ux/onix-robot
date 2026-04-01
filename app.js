// 1. Apni details yahan bharein (HTTPS compulsory hai)
const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; // <-- Embed URL yahan daalein
const HF_TOKEN = "hf_..."; // <-- 'Read' Access Token yahan paste karein

let currentStream;
const video = document.getElementById('videoFeed');
const faceContainer = document.querySelector('.face-container');

// Camera badalne ka logic
async function switchCamera(mode) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    const constraints = { video: { facingMode: mode } };
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
}

// Private Cloud ko photo bhejne ka logic
async function sendFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob);

        try {
            const response = await fetch(`${CLOUD_URL}/process_frame`, {
                method: 'POST',
                body: formData,
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}` // <-- Authentication header for Private Space
                }
            });
            const data = await response.json();
            // add voice synthesis logic here based on data.emotion
        } catch (e) { console.log("Connection busy..."); }
    }, 'image/jpeg', 0.5);
}

// Stealth Panel logic (Toggle functionality)
function togglePanel() {
    document.getElementById('control-panel').classList.toggle('panel-active');
}

// Power Commands (Arduino/ESP32 controls)
function sendCommand(cmd) {
    console.log("ESP32 CMD: " + cmd);
    // Yahan commands process hone ke baad emotion update logic bhi aayega
}

// PWA Install Prompt Logic (Making it an 'Asli App')
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-alert').style.display = 'block';
});

// Start everything
switchCamera('user');
setInterval(sendFrame, 2000);
