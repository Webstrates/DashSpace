import React from 'react';
import { toggleSession } from '@react-three/xr';
import { Varv, useProperty } from '#VarvReact';



function ComponentMenu() {
    const [multiSelect, setMultiSelect] = useProperty('multiSelect');
    const [presentationMode, setPresentationMode] = useProperty('presentationMode');

    return <div className="floating-menu">
        <div className="title">Menu</div>
        <button onClick={() => CustomJSTrigger.trigger('createObject', { concept: 'VisShelf', device: 'camera'})}>New Bookshelf</button>
        <button onClick={() => CustomJSTrigger.trigger('createObject', { concept: 'Trashcan', device: 'camera'})}>New Trashcan</button>
        <button onClick={() => CustomJSTrigger.trigger('createObject', { concept: 'StickyNote', device: 'camera'})}>New Sticky Note</button>
        <div className="spacer"></div>
        <button onClick={() => CustomJSTrigger.trigger('mergeComponents', { device: 'camera' })}>Merge Components</button>
        <button onClick={() => CustomJSTrigger.trigger('cloneMovable')}>Clone</button>
        <button onClick={() => CustomJSTrigger.trigger('deleteMovable')} className="red">Delete</button>
        <button onClick={() => {
            if (window.confirm('Are you sure you want to delete all objects?')) {
                CustomJSTrigger.trigger('deleteAllMovables');
            }
        }} className="red">Delete All Objects</button>
        <div className="spacer"></div>
        <button onClick={() => setPresentationMode(!presentationMode)} toggled={presentationMode ? 'true' : null}>Presentation Mode</button>
        <button onClick={() => setMultiSelect(!multiSelect)} toggled={multiSelect ? 'true' : null}>Toggle Multi-Select</button>
        <button onClick={() => CustomJSTrigger.trigger('unselectMovable')}>Deselect Objects</button>
        <div className="spacer"></div>
        <button onClick={window.captureScreenshot}>Capture Screenshot</button>
    </div>;
}

/**
 * A heads-up display with buttons
 */
export function GUIOverlay() {
    const toggleAR = async () => {
        if (!navigator?.xr) {
            alert('WebXR is not supported by your browser.');
            return;
        }

        const sessionMode = 'immersive-ar';
        if (!await navigator.xr.isSessionSupported(sessionMode)) {
            alert('AR sessions are not supported by your browser.');
            return;
        }

        const sessionInit = { sessionInit: {
            domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined,
            optionalFeatures: [
                'hit-test',
                'dom-overlay',
                'hand-tracking'
            ]
        }};

        toggleSession(sessionMode, sessionInit);
    };

    const toggleVR = async () => {
        if (!navigator?.xr) {
            alert('WebXR is not supported by your browser.');
            return;
        }

        const sessionMode = 'immersive-vr';
        if (!await navigator.xr.isSessionSupported(sessionMode)) {
            alert('VR sessions are not supported by your browser.');
            return;
        }

        const sessionInit = { sessionInit: {
            domOverlay: typeof document !== 'undefined' ? { root: document.body } : undefined,
            optionalFeatures: [
                'hit-test',
                'dom-overlay',
                'hand-tracking'
            ]
        }};

        toggleSession(sessionMode, sessionInit);
    };

    const shareLink = () => {
        let sendToQuestUrl = new URL('https://oculus.com/open_url/');
        sendToQuestUrl.searchParams.set('url', location.protocol + '//' + location.host + location.pathname + '?lrs=false&dud=true');
        window.open(sendToQuestUrl, '_blank');
    };

    return <div className="floating-menus">
        <Varv concept="MovableManager">
            <ComponentMenu />
        </Varv>

        <div className="floating-menu">
            <div className="title">Upload Files</div>
            <div className="upload-drop-zone" id="vega-lite-spec-upload-drop-zone">Upload Vega-Lite Spec</div>
            <div className="upload-drop-zone" id="dataset-upload-drop-zone">Upload Dataset</div>
            <div className="upload-drop-zone" id="d3-spec-upload-drop-zone">Upload D3 Spec</div>
            <div className="spacer"></div>
            <div className="upload-drop-zone" id="image-upload-drop-zone">Upload Image</div>
        </div>

        <div className="floating-menu">
            <div className="title">Media Sharing</div>
            <button onClick={window.shareMyScreen}>Start Screenshare</button>
            <button onClick={window.stopSharingMyScreen}>Stop Screenshare</button>
            <div className="spacer"></div>
            <button onClick={window.shareMyVideo}>Start Video</button>
            <button onClick={window.stopSharingMyVideo}>Stop Video</button>
            <div className="spacer"></div>
            <button onClick={window.shareMyAudio}>Start Audio</button>
            <button onClick={window.stopSharingMyAudio}>Stop Audio</button>
            <div className="spacer"></div>
            <button onClick={shareLink}>Send to Quest</button>
        </div>

        <div className="floating-menu always-visible">
            <button className="mouse-lock">Move Camera</button>
            <div className="spacer"></div>
            <button onClick={toggleAR}>Toggle AR</button>
            <button onClick={toggleVR}>Toggle VR</button>
        </div>
    </div>;
}
