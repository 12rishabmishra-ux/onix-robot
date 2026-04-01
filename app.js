// --- 1. CONFIG (Apni details yahan bharein) ---
const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; 
const HF_TOKEN = "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"; 

const panel = document.getElementById('control-panel');
const face = document.querySelector('.face-container');
const video = document.getElementById('videoFeed');

// --- 2. FACE & VOICE ENGINE ---
function setEmotion(emotion) {
    face.className = 'face-container';
    if(emotion && emotion !== 'neutral') face.classList.add(emotion);
}

function speakVoice(text, emotion) {
    if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(text);
        msg.pitch = 1.1; msg.rate = 0.9;
        setEmotion(emotion);

        msg.onboundary = (e) => {
            if(e.name === 'word') {
                face.classList.add('talking');
                setTimeout(() => face.classList.remove('talking'), 150);
            }
        };
        msg.onend = () => {
            face.classList.remove('talking');
            setTimeout(() => setEmotion('neutral'), 1500);
        };
        window.speechSynthesis.speak(msg);
    }
}

// --- 3. SYSTEM LOGIC ---
function togglePanel() {
    panel.classList.toggle('panel-active');
    face.style.filter = panel.classList.contains('panel-active') ? "blur(8px)" : "none";
}

function handleGlobalClick() {
    // Force Fullscreen
    let elem = document.documentElement;
    if (!document.fullscreenElement) elem.requestFullscreen().catch(e => {});
    
    // Auto-close menu
    if (panel.classList.contains('panel-active')) togglePanel();
}

async function switchCamera(mode) {
    if (window.stream) window.stream.getTracks().forEach(t => t.stop());
    window.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
    video.srcObject = window.stream;
}

async function sendFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
        const formData = new FormData(); formData.append('file', blob);
        try {
            const res = await fetch(`${CLOUD_URL}/process_frame`, {
                method: 'POST', body: formData,
                headers: { "Authorization": `Bearer ${HF_TOKEN}` }
            });
            const data = await res.json();
            if(data.message) speakVoice(data.message, data.emotion);
        } catch (e) { console.log("Thinking..."); }
    }, 'image/jpeg', 0.5);
}

function sendCommand(cmd) {
    console.log("ESP32 CMD: " + cmd);
    if(cmd === 'ON') speakVoice("System online. Hello Bhai!", "happy");
    if(cmd === 'SLEEP') speakVoice("Powering down to sleep mode.", "sleepy");
    if(cmd === 'OFF') speakVoice("Initiating emergency shutdown.", "angry");
    // fetch(`http://192.168.x.x/${cmd}`); 
}

// Start Up
switchCamera('user');
// setInterval(sendFrame, 4000);
