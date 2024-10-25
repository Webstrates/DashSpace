import React from 'react';
const { useState, useEffect, useMemo } = React;

import * as THREE from 'three';
import { MeshStandardMaterial } from 'three';
import { Plane } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { useProperty } from '#VarvReact';
const { doIfClicked } = modules.streamManager;
const { QUERY_PREFIX, streamShare } = modules.videoStreams;



const frameGeometry = new RoundedBoxGeometry(1, 1, 0.005, 1);
const frameMaterial = new MeshStandardMaterial({ color: '#E0E0E0', metalness: 0.2, roughness: 0.5 });



export function VideoStream() {
    const [client] = useProperty('client');

    const [video, setVideo] = useState(document.querySelector(QUERY_PREFIX + client));
    const [aspectRatio, setAspectRatio] = useState(1);

    useEffect(() => {
        if (video) {
            // Playing immediately may fail, wait for interaction in that case
            doIfClicked(() => {
                setAspectRatio(video.videoWidth / video.videoHeight);
                video.addEventListener('resize', () => {
                    setAspectRatio(video.videoWidth / video.videoHeight);
                });
            });
        }

        // Make sure to catch stream updates
        let listener = function (newStreamId) {
            if (newStreamId == client) setVideo(document.querySelector(QUERY_PREFIX + client));
        };
        streamShare.addStreamAddedListener(listener);

        return () => {
            streamShare.removeStreamAddedListener(listener);
        }
    }, [video, client]);

    const texture = useMemo(() => video ? <videoTexture attach='map' args={[video]} colorSpace={THREE.SRGBColorSpace} /> : null, [video]);

    return <>
        <mesh geometry={frameGeometry} material={frameMaterial}
            scale={[0.25 + 0.02, (0.25 / aspectRatio) + 0.02, 1]} position={[0, (0.125 / aspectRatio) + 0.2, 0.0051]} autoUpdateMatrix={false} />
        <Plane args={[0.25, 0.25 / aspectRatio]} position={[0, (0.125 / aspectRatio) + 0.2, 0]} rotation={[0, Math.PI, 0]}>
            <meshBasicMaterial toneMapped={false} color={video ? 'white' : 'darkgrey'}>
                {texture}
            </meshBasicMaterial>
        </Plane>
    </>;
}
