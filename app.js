// --- CONFIG ---
const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; 
const HF_TOKEN = "hf_TERA_TOKEN_DALO"; // <--- Apna token yahan paste kar

let systemState = 'ACTIVE'; 
let isSpeaking = false;
let currentStream;
const faceContainer = document.querySelector('.face-container');
const video = document.getElementById('videoFeed');

// 1. EMOTION SETTER
function setEmotion(emotion) {
    faceContainer.className = 'face-container';
    if (emotion && emotion !== 'neutral') {
        faceContainer.classList.add(emotion);
    }
}

// 2. REALISTIC LIP SYNC
function startLipSync() {
    isSpeaking = true;
    const mouth = document.querySelector('.mouth');
    function animate() {
        if (!isSpeaking) {
            mouth.style.height = ''; 
            mouth.style.width = '';
            return;
        }
        let h = Math.floor(Math.random() * 15) + 5; // Random height
        mouth.style.height = `${h}vh`;
        setTimeout(animate, 120);
    }
    animate();
}

// 3. VOICE ENGINE
function speakVoice(text, emotion = 'neutral') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Purani aawaz kato
        const msg = new SpeechSynthesisUtterance(text);
        msg.pitch = 1.1; msg.rate = 1.0;
        
        setEmotion(emotion);
        msg.onstart = () => startLipSync();
        msg.onend = () => {
            isSpeaking = false;
            if (systemState === 'ACTIVE') setTimeout(() => setEmotion('neutral'), 1000);
            if (systemState === 'SLEEP') setEmotion('sleepy');
            if (systemState === 'SHUTDOWN') setEmotion('shutdown');
        };
        window.speechSynthesis.speak(msg);
    }
}

// 4. COMMAND CENTER (Shutdown Fix)
function sendCommand(cmd) {
    if (cmd === 'OFF') {
        systemState = 'SHUTDOWN';
        speakVoice("Shutting down. Goodbye.", "sad");
        setTimeout(() => { setEmotion('shutdown'); }, 3000);
    } 
    else if (cmd === 'ON' || cmd === 'WAKE') {
        systemState = 'ACTIVE';
        setEmotion('neutral');
        speakVoice("Systems online. I am awake.", "happy");
    }
    else if (cmd === 'SLEEP') {
        systemState = 'SLEEP';
        speakVoice("Going to sleep now.", "sleepy");
    }
}

// 5. CLOUD VISION (Sending frames to Hugging Face)
async function sendFrame() {
    if (systemState !== 'ACTIVE' || isSpeaking) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob);
        try {
            const res = await fetch(`${CLOUD_URL}/predict`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${HF_TOKEN}` },
                body: formData
            });
            const data = await res.json();
            if (data.reply) speakVoice(data.reply, data.emotion || 'happy');
        } catch (e) { console.log("Cloud offline"); }
    }, 'image/jpeg', 0.5);
}

// 6. UTILS (Camera & Panel)
async function switchCamera(mode) {
    if (currentStream) currentStream.getTracks().forEach(t => t.stop());
    currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
    video.srcObject = currentStream;
}

function togglePanel() { document.getElementById('control-panel').classList.toggle('panel-active'); }

// Start
switchCamera('user');
setInterval(sendFrame, 5000); // Har 5 sec mein scan
