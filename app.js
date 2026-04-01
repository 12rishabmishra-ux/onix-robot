const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; 
const HF_TOKEN = "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"; // Apna Token dalna mat bhulna

let currentStream;
const video = document.getElementById('videoFeed');
const faceContainer = document.querySelector('.face-container');

// Emotions set karne ka function
function setEmotion(emotionName) {
    faceContainer.className = 'face-container'; // Sab reset karo
    if (emotionName && emotionName !== 'neutral') {
        faceContainer.classList.add(emotionName);
    }
}

// ----------------------------------------------------
// THE NEURAL VOICE & LIP-SYNC ENGINE
// ----------------------------------------------------
function speakVoice(text, emotionStr) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Robot ki aawaz thodi smooth aur pitch adjust karne ke liye
        utterance.pitch = 1.2; 
        utterance.rate = 1.0;  
        
        // Emotion set karo bolne se pehle
        setEmotion(emotionStr);

        // Jab naya word bole, tabhi munh hile (Lip Sync)
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                faceContainer.classList.add('talking');
                // Word khatam hone par munh band
                setTimeout(() => faceContainer.classList.remove('talking'), 150); 
            }
        };

        // Jab bolna khatam ho jaye
        utterance.onend = () => {
            faceContainer.classList.remove('talking');
            setTimeout(() => setEmotion('neutral'), 1000); // 1 sec baad neutral
        };

        window.speechSynthesis.speak(utterance);
    }
}
// ----------------------------------------------------

// Camera Logic
async function switchCamera(mode) {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());
    currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
    video.srcObject = currentStream;
}

// Cloud se process karna
async function sendFrame() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
        const formData = new FormData(); formData.append('file', blob);

        try {
            const response = await fetch(`${CLOUD_URL}/process_frame`, {
                method: 'POST', body: formData,
                headers: { "Authorization": `Bearer ${HF_TOKEN}` }
            });
            const data = await response.json();
            
            // YAHAN MAGIC HOGA: Cloud se text aur emotion aayega
            if(data.message) {
                // Pehle "Thinking" mode hatao
                speakVoice(data.message, data.emotion);
            }
        } catch (e) { 
            console.log("Processing..."); 
            // setEmotion('confused'); // Agar connection tute toh confuse ho jaye
        }
    }, 'image/jpeg', 0.5);
}

function togglePanel() { document.getElementById('control-panel').classList.toggle('panel-active'); }

function sendCommand(cmd) {
    console.log("CMD: " + cmd);
    // Testing the voice directly from buttons
    if(cmd === 'ON') speakVoice("System online and ready.", "happy");
    if(cmd === 'SLEEP') speakVoice("Going to sleep now.", "sleepy");
    if(cmd === 'WAKE') speakVoice("I am awake.", "surprised");
}

switchCamera('user');
// setInterval(sendFrame, 3000); // Har 3 sec frame bhejega (Abhi comment rakha hai testing ke liye)
