let clicked = false;
document.addEventListener('click', () => { clicked = true; });
const doIfClicked = (callback) => {
    if (clicked) {
        setTimeout(() => {
            callback();
        }, 200);
    } else {
        document.addEventListener('click', () => {
            callback();
        });
    }
};



const DEBUG = false;



/**
 * A generic stream sharing class for Webstrate servers with stream signalling support.
 */
class StreamShare {
    /**
     * Creates a streamshare using the given element to signal
     * addition and removal of streams. Up to one stream per client
     * is possible for each element.
     */
    constructor(element) {
        let self = this;
        this.clientStreams = new Map();
        this.addedListeners = [];
        if (!element) throw new Error('Must provide an actual DOM element for signalling, was ', element);
        if (element.parentElement === undefined) throw new Error('StreamShare element must be in DOM');
        this.supported = true;
        if (!(element.webstrate && element.webstrate.signalStream)) {
            this.supported = false;
            if (DEBUG) console.log('StreamShare: The webstrate implementation or element does not support webstrate stream signalling, stream sharing is disabled', element);
            return;
        }
        this.element = element;

        this.element.webstrate.on('signalStream', function onSignalStream(clientId, meta, accept) {
            let con = accept(function (stream) {
                if (self.clientStreams.get(clientId)) {
                    if (DEBUG) console.log('StreamShare: Warning: Only one stream per client is supported per element but ' + clientId + ' shared another one...');
                }
                self.clientStreams.set(clientId, stream);
                self._onStreamAdded(clientId, stream);
            });
        });
    }

    stopSharing() {
        if (this.currentSignallingFunction) {
            this.element.webstrate.stopStreamSignal(this.currentSignallingFunction);
            this.currentSignallingFunction = null;
        }
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
    }

    async shareStream(media, displayOptions = null) {
        let self = this;
        if (!this.supported) {
            console.log('Tried to share a stream on an unsupported StreamShare, see previous warnings');
            return;
        }

        // Get the stream
        if (!displayOptions) {
            console.error('displayOptions are required to share a stream.');
        }

        if (this.currentStream) {
            this.stopSharing();
        }
        if (media == 'displayMedia') {
            this.currentStream = await navigator.mediaDevices.getDisplayMedia(displayOptions);
        } else {
            this.currentStream = await navigator.mediaDevices.getUserMedia(displayOptions);
        }
        this.currentSignallingFunction = function signalStream(clientId, accept) {
            let con = accept(self.currentStream, {}, () => {
                if (DEBUG) console.log('StreamShare: client ' + clientId + ' started receiving our streamshare');
            });
            con.onclose(() => {
                if (DEBUG) console.log('StreamShare: client ' + clientId + ' stopped receiving our streamshare');
            });
        };

        // Register the stream on the element
        if (DEBUG) console.log('StreamShare: Starting streamshare');
        this._onStreamAdded(webstrate.clientId, this.currentStream);
        this.element.webstrate.signalStream(this.currentSignallingFunction);
        return this.currentStream;
    }

    _onStreamAdded(client, stream) {
        // Notify listeners
        this.clientStreams.set(client, stream);
        this.addedListeners.forEach(listener => {
            listener(client, stream);
        });
    }
    addStreamAddedListener(listener) {
        this.addedListeners.push(listener);

        // Backfill with current streams
        for (let [key, value] of this.clientStreams) {
            listener(key, value);
        }
    }
    removeStreamAddedListener(listener) {
        const index = this.addedListeners.indexOf(listener);
        if (index > -1) {
            this.addedListeners.splice(index, 1);
        }
    }
}



const cleanupConceptTypes = [];
const cleanup = async () => {
    // Remove screenshares when a client leaves or joins
    for (const conceptType in cleanupConceptTypes) {
        if (webstrate.clients.length < 1) return;
        let concept = VarvEngine.getConceptFromType(conceptType);
        let shares = await (VarvEngine.lookupInstances(conceptType));
        shares.filter(share => !webstrate.clients.includes(concept.getPropertyValue(share, 'client'))).forEach(share => { concept.delete(share); });
    }
};
webstrate.on('clientPart', cleanup);
webstrate.on('clientJoin', cleanup);



exports.doIfClicked = doIfClicked;
exports.StreamShare = StreamShare;
exports.cleanupConceptTypes = cleanupConceptTypes;
