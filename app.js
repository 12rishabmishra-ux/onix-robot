// ======================================================
// 1. CONFIGURATION (Apna Data Yahan Daalein)
// ======================================================
const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; // Apna HF Space URL
const HF_TOKEN = "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"; // Apna HF Read Token

let currentStream;
let isSpeaking = false;
let systemState = 'ACTIVE'; // ACTIVE, SLEEP, SHUTDOWN
const video = document.getElementById('videoFeed');
const faceContainer = document.querySelector('.face-container');

// ======================================================
// 2. FACE & EMOTION ENGINE
// ======================================================
function setEmotion(emotionName) {
    // Agar shutdown hai toh koi expression nahi aayega jab tak ON na ho
    if (systemState === 'SHUTDOWN' && emotionName !== 'neutral') return;
    
    faceContainer.className = 'face-container'; 
    if (emotionName && emotionName !== 'neutral') {
        faceContainer.classList.add(emotionName);
    }
}

// ======================================================
// 3. LIP-SYNC ENGINE (Realistic Movement)
// ======================================================
function startLipSync() {
    isSpeaking = true;
    const mouth = document.querySelector('.mouth');
    mouth.classList.add('is-speaking');
    
    function animateMouth() {
        if (!isSpeaking) {
            mouth.style.height = ''; 
            mouth.style.borderRadius = '';
            mouth.classList.remove('is-speaking');
            return;
        }
        // Randomly changing mouth height for natural look
        let h = Math.floor(Math.random() * 15) + 5; 
        mouth.style.height = `${h}vh`;
        mouth.style.borderRadius = `${h/2}vh`;
        setTimeout(animateMouth, 150); 
    }
    animateMouth();
}

function stopLipSync() {
    isSpeaking = false;
}

// ======================================================
// 4. VOICE & SPEECH ENGINE
// ======================================================
function speakVoice(text, emotionStr = 'neutral') {
    if ('speechSynthesis' in window) {
        // Purani aawaz ko stop karo
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.2; 
        utterance.rate = 1.0;  
        
        setEmotion(emotionStr);

        utterance.onstart = () => { startLipSync(); };
        utterance.onend = () => {
            stopLipSync();
            // State maintain karna (Sleep/Shutdown check)
            if (systemState === 'ACTIVE') {
                setTimeout(() => setEmotion('neutral'), 1000);
            } else if (systemState === 'SLEEP') {
                setEmotion('sleepy');
            } else if (systemState === 'SHUTDOWN') {
                setEmotion('shutdown');
            }
        };

        window.speechSynthesis.speak(utterance);
    }
}

// ======================================================
// 5. CLOUD VISION (Hugging Face Brain)
// ======================================================
async function sendFrameToCloud() {
    // Sirf tabhi photo bhejo jab robot ACTIVE ho aur kuch bol na raha ho
    if(systemState !== 'ACTIVE' || isSpeaking) return;

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
                headers: { "Authorization": `Bearer ${HF_TOKEN}` }
            });
            const data = await response.json();
            
            // Cloud se message aur emotion aaye toh react karo
            if(data.message) {
                speakVoice(data.message, data.emotion || 'happy');
            }
        } catch (e) {
            console.error("Cloud Connection Error:", e);
        }
    }, 'image/jpeg', 0.5);
}

// Har 4 second mein ek baar camera se photo cloud ko jayegi
setInterval(sendFrameToCloud, 4000);

// ======================================================
// 6. HARDWARE & UI CONTROLS
// ======================================================
function sendCommand(cmd) {
    if(cmd === 'ON' || cmd === 'WAKE') {
        systemState = 'ACTIVE';
        speakVoice("System Online. ONIX is ready.", "surprised");
    }
    else if(cmd === 'SLEEP') {
        systemState = 'SLEEP';
        speakVoice("Entering sleep mode. Goodbye.", "sleepy");
    }
    else if(cmd === 'OFF') {
        systemState = 'SHUTDOWN';
        speakVoice("Emergency shutdown initiated.", "sad");
    }
    // ESP32 Command (Optional): fetch(`http://YOUR_ESP_IP/${cmd}`);
}

async function switchCamera(mode) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: mode } 
        });
        video.srcObject = currentStream;
    } catch (err) {
        console.error("Camera Error:", err);
    }
}

function togglePanel() { 
    document.getElementById('control-panel').classList.toggle('panel-active'); 
}

// PWA Fullscreen Trigger
function goFullScreen() {
    let elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => console.log(err));
    }
}

// Initial Setup
switchCamera('user');
