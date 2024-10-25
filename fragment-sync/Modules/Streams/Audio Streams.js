const { doIfClicked, StreamShare, cleanupConceptTypes } = modules.streamManager;



const DOM_ELEMENT = document.querySelector('#audio-streams-module');
const CONCEPT_NAME = 'AudioStream';
const ID_PREFIX = CONCEPT_NAME + '-';
const QUERY_PREFIX = '#' + ID_PREFIX;



// Hook up new streams with a video element
cleanupConceptTypes.push(CONCEPT_NAME);
const streamShare = new StreamShare(DOM_ELEMENT);
streamShare.addStreamAddedListener((client, stream) => {
    console.log('Got audioStream from ' + client);

    // Find or create their element
    let element = document.querySelector(QUERY_PREFIX + client);
    if (!element) {
        element = document.createElement('video');
        element.style.position = 'fixed';
        element.style.width = '0px';
        element.id = ID_PREFIX + client;
        element.muted = client == webstrate.clientId;
        document.body.appendChild(element);
    }
    element.srcObject = stream;
    doIfClicked(() => { element.play(); });
});

// Convenience functions for managing Varv spawning and despawning
window.stopSharingMyAudio = async () => {
    streamShare.stopSharing();
    const concept = VarvEngine.getConceptFromType(CONCEPT_NAME);
    const instances = await VarvEngine.lookupInstances(CONCEPT_NAME, new FilterProperty('client', FilterOps.equals, webstrate.clientId));
    instances.forEach(instance => concept.delete(instance));
};
window.shareMyAudio = async () => {
    const instances = await VarvEngine.lookupInstances(CONCEPT_NAME, new FilterProperty('client', FilterOps.equals, webstrate.clientId));
    if (instances.length > 0) {
        console.log('Already sharing audio');
        return;
    }
    const stream = await streamShare.shareStream('userMedia', {
        video: false,
        audio: true
    });
    if (stream) {
        stream.getAudioTracks()[0].addEventListener('ended', () => {
            window.stopSharingMyAudio();
        });
        return VarvEngine.getConceptFromType(CONCEPT_NAME).create(null, { client: webstrate.clientId });
    }
};



exports.QUERY_PREFIX = QUERY_PREFIX;
exports.streamShare = streamShare;
