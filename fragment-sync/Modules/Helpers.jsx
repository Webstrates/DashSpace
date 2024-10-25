export const recordAudio = (duration) => {
    return new Promise((resolve, reject) => {
        let chunks = [];

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                resolve(audioBlob);
            };

            mediaRecorder.start();

            setTimeout(() => {
                mediaRecorder.stop();
            }, duration);
        }).catch(error => {
            reject(error);
        });
    });
};

export const transcribeAudio = async (duration, audioBlob = false, recordingEndedCallback = false) => {
    if (!window.API_KEY) {
        window.API_KEY = prompt('Please enter your OpenAI API key:');
        if (!window.API_KEY) {
            if (recordingEndedCallback) recordingEndedCallback();
            console.error('An API_KEY is required to transcribe audio.');
            return;
        }
    }

    let audioBlobToTranscribe = audioBlob;
    if (!audioBlobToTranscribe) {
        audioBlobToTranscribe = await recordAudio(duration);
    }

    if (recordingEndedCallback) recordingEndedCallback();

    const formData = new FormData();
    formData.append('file', audioBlobToTranscribe, 'recording.wav');
    formData.append('model', 'whisper-1');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Authorization': `Bearer ${API_KEY}` },
        body: formData,
    });
    const whisperData = await whisperResponse.json();

    return whisperData.text;
};

export const sendGPTPrompt = async (body) => {
    if (!window.API_KEY) {
        window.API_KEY = prompt('Please enter your OpenAI API key:');
        if (!window.API_KEY) {
            console.error('An API_KEY is required to transcribe audio.');
            return;
        }
    }

    const options = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(body)
    };
    console.log('OpenAI API call options:', options);

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', options);
    const gptData = await gptResponse.json();
    return gptData;
};

export const getGPTContent = (gptData) => gptData.choices[0].message.content;
