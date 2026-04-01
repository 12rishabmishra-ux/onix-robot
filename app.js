// 1. Apni details yahan bharein
const CLOUD_URL = "https://Onix-Labs-ONIX-ROBOT-BRAIN.hf.space"; 
const HF_TOKEN = "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"; 

let currentStream;
const video = document.getElementById('videoFeed');

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
                    "Authorization": `Bearer ${HF_TOKEN}` // <--- YEHI HAI WO MAIN BADLAAV
                }
            });
            const data = await response.json();
            console.log("Cloud Response:", data);
        } catch (e) { console.log("Connecting..."); }
    }, 'image/jpeg', 0.5);
}

// Power Commands (ESP32 ke liye)
function sendCommand(cmd) {
    console.log("Action: " + cmd);
    // Yahan hum ESP32 ko local network pe hit karenge
    // fetch(`http://192.168.x.x/${cmd}`); 
}

// Start everything
switchCamera('user');
setInterval(sendFrame, 2000);