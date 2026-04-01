const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; 
const HF_TOKEN = "hf_TERA_TOKEN_YAHAN_DAAL"; // Apna Token dalna mat bhulna

let currentStream;
const video = document.getElementById('videoFeed');
const faceContainer = document.querySelector('.face-container');

// ROBOT KA STATE MEMORY (Dimag)
let systemState = 'ACTIVE'; 
let isSpeaking = false;

// ----------------------------------------------------
// 1. EMOTION CONTROL LOGIC
// ----------------------------------------------------
function setEmotion(emotionName) {
    // Purane sabhi expressions hatao
    faceContainer.className = 'face-container'; 
    
    if (emotionName && emotionName !== 'neutral') {
        faceContainer.classList.add(emotionName);
    }
}

// ----------------------------------------------------
// 2. THE REALISTIC LIP-SYNC ENGINE (Asli Humanoid Feel)
// ----------------------------------------------------
function startLipSync() {
    isSpeaking = true;
    const mouth = document.querySelector('.mouth');
    mouth.classList.add('is-speaking'); // Fast CSS transition active
    
    function animateMouth() {
        if (!isSpeaking) {
            // Bolna band, munh wapas normal
            mouth.style.height = ''; 
            mouth.style.borderRadius = '';
            mouth.classList.remove('is-speaking');
            return;
        }
        
        // Random syllable logic (5vh se 20vh ke beech munh khulega)
        let h = Math.floor(Math.random() * 15) + 5; 
        mouth.style.height = `${h}vh`;
        mouth.style.borderRadius = `${h/2}vh`;
        
        // Har 150ms me munh ki shape badlegi (Natural sound waves ki tarah)
        setTimeout(animateMouth, 150); 
    }
    animateMouth();
}

function stopLipSync() {
    isSpeaking = false;
}

// ----------------------------------------------------
// 3. VOICE ENGINE WITH STATE AWARENESS
// ----------------------------------------------------
function speakVoice(text, emotionStr) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.2; 
        utterance.rate = 1.0;  
        
        setEmotion(emotionStr);

        // Jab bolna shuru kare toh munh hilaana shuru
        utterance.onstart = () => { startLipSync(); };

        // Jab bolna band kare (YAHAN MAGIC HAI)
        utterance.onend = () => {
            stopLipSync();
            
            // State ke hisaab se face set karo (Taaki wo apne aap na jage)
            if (systemState === 'ACTIVE') {
                setTimeout(() => setEmotion('neutral'), 1000);
            } else if (systemState === 'SLEEP') {
                setEmotion('sleepy'); // So gaya toh sota rahega
            } else if (systemState === 'SHUTDOWN') {
                setEmotion('shutdown'); // Screen kaali ho jayegi
            }
        };

        window.speechSynthesis.speak(utterance);
    }
}

// ----------------------------------------------------
// 4. COMMANDS & HARDWARE ACTIONS
// ----------------------------------------------------
function sendCommand(cmd) {
    console.log("Hardware CMD Sent: " + cmd);
    
    // Yahan buttons dabane par alag-alag states trigger hongi
    if(cmd === 'ON' || cmd === 'WAKE') {
        systemState = 'ACTIVE';
        speakVoice("System Online. I am ready.", "surprised");
    }
    else if(cmd === 'SLEEP') {
        systemState = 'SLEEP';
        speakVoice("Powering down to sleep mode.", "sleepy");
    }
    else if(cmd === 'OFF') {
        systemState = 'SHUTDOWN';
        speakVoice("Initiating emergency shutdown.", "sad");
    }

    // Hardware ko bhejna (ESP32 IP)
    // fetch(`http://192.168.x.x/${cmd}`); 
}

// ----------------------------------------------------
// 5. CAMERA & CLOUD LOGIC
// ----------------------------------------------------
async function switchCamera(mode) {
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());
    currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
    video.srcObject = currentStream;
}

function togglePanel() { 
    document.getElementById('control-panel').classList.toggle('panel-active'); 
}

switchCamera('user');
