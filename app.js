// --- 1. CONFIG ZONE (Yahan apni details bharein) ---
const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; 
const HF_TOKEN = "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"; 

let currentStream;
const video = document.getElementById('videoFeed');
const faceContainer = document.querySelector('.face-container');

// --- 2. FACE & EMOTION ZONE (The 'Vector' Look) ---

// Ye function chehre ke expressions badlega
function setEmotion(emotionName) {
    const face = document.querySelector('.face-container');
    // Purane saare styles hatao
    face.classList.remove('happy', 'sleepy', 'angry', 'neutral');
    
    // Naya expression lagao
    if (emotionName) {
        face.classList.add(emotionName);
    }
}

// Stealth Panel ko dikhane ya chhupane ke liye
function togglePanel() {
    document.getElementById('control-panel').classList.toggle('panel-active');
}

// --- 3. LOGIC & CAMERA ZONE ---

// Camera switch karne ka logic (Front/Back)
async function switchCamera(mode) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    const constraints = { video: { facingMode: mode } };
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
}

// Cloud ko frame bhejna
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
                headers: { "Authorization": `Bearer ${HF_TOKEN}` }
            });
            const data = await response.json();
            
            // Agar cloud se koi emotion aaye toh yahan update hoga
            if(data.emotion) setEmotion(data.emotion);
            
        } catch (e) { console.log("Connecting to Cloud..."); }
    }, 'image/jpeg', 0.5);
}

// Dashboard ke buttons se commands bhejna
function sendCommand(cmd) {
    console.log("Sending Command: " + cmd);
    
    // Commands ke hisaab se face react karega
    if(cmd === 'ON') setEmotion('happy');
    if(cmd === 'SLEEP') setEmotion('sleepy');
    if(cmd === 'WAKE') setEmotion('neutral');
    if(cmd === 'OFF') setEmotion('angry');

    // ESP32 link (Yahan IP address aayega baad mein)
    // fetch(`http://192.168.x.x/${cmd}`); 
}

// --- 4. STARTUP ZONE ---
switchCamera('user'); // App khulte hi front camera chalu hoga
setInterval(sendFrame, 2000); // Har 2 second mein cloud ko frame bhejega
