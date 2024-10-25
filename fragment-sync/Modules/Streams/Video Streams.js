const { doIfClicked, StreamShare, cleanupConceptTypes } = modules.streamManager;



const DOM_ELEMENT = document.querySelector('#video-streams-module');
const CONCEPT_NAME = 'VideoStream';
const ID_PREFIX = CONCEPT_NAME + '-';
const QUERY_PREFIX = '#' + ID_PREFIX;



// Hook up new streams with a video element
cleanupConceptTypes.push(CONCEPT_NAME);
const streamShare = new StreamShare(DOM_ELEMENT);
streamShare.addStreamAddedListener((client, stream) => {
    console.log('Got videoStream from ' + client);

    // Find or create their element
    let element = document.querySelector(QUERY_PREFIX + client);
    if (!element) {
        element = document.createElement('video');
        element.style.position = 'fixed';
        element.style.width = '0px';
        element.id = ID_PREFIX + client;
        element.muted = true;
        document.body.appendChild(element);
    }
    element.srcObject = stream;
    doIfClicked(() => { element.play(); });
});

// Convenience functions for managing Varv spawning and despawning
window.stopSharingMyVideo = async () => {
    streamShare.stopSharing();
    const concept = VarvEngine.getConceptFromType(CONCEPT_NAME);
    const instances = await VarvEngine.lookupInstances(CONCEPT_NAME, new FilterProperty('client', FilterOps.equals, webstrate.clientId));
    instances.forEach(instance => concept.delete(instance));
};
window.shareMyVideo = async () => {
    const instances = await VarvEngine.lookupInstances(CONCEPT_NAME, new FilterProperty('client', FilterOps.equals, webstrate.clientId));
    if (instances.length > 0) {
        console.log('Already sharing video');
        return;
    }
    const stream = await streamShare.shareStream('userMedia', {
        video: true,
        audio: false
    });
    if (stream) {
        stream.getVideoTracks()[0].addEventListener('ended', () => {
            window.stopSharingMyVideo();
        });
        return VarvEngine.getConceptFromType(CONCEPT_NAME).create(null, { client: webstrate.clientId });
    }
};



exports.QUERY_PREFIX = QUERY_PREFIX;
exports.streamShare = streamShare;
