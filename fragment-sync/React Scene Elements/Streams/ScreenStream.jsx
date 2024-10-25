import React from 'react';
const { useState, useEffect, useMemo } = React;

import * as THREE from 'three';
import { MeshStandardMaterial } from 'three';
import { Plane } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { useProperty } from '#VarvReact';
import { Movable, SELECTED_COLOR_PRIMARY, HOVERED_SELECTED_COLOR_PRIMARY } from '#elements [name="Movable"]';
const { doIfClicked } = modules.streamManager;
const { QUERY_PREFIX, streamShare } = modules.screenStreams;



const MAX_SIZE = 0.75;

const frameGeometry = new RoundedBoxGeometry(1, 1, 0.005, 1);
const frameMaterial = new MeshStandardMaterial({ color: '#E0E0E0', metalness: 0.2, roughness: 0.5 });
const frameMaterialHovered = new MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.2, roughness: 0.5 });
const frameMaterialSelected = new MeshStandardMaterial({ color: SELECTED_COLOR_PRIMARY, metalness: 0.2, roughness: 0.5 });
const frameMaterialHoveredSelected = new MeshStandardMaterial({ color: HOVERED_SELECTED_COLOR_PRIMARY, metalness: 0.2, roughness: 0.5 });



export function ScreenStream() {
    const [client] = useProperty('client');

    const [screen, setScreen] = useState(document.querySelector(QUERY_PREFIX + client));
    const [width, setWidth] = useState(MAX_SIZE);
    const [height, setHeight] = useState(MAX_SIZE);

    const [selected] = useProperty('selected');
    const [hovered] = useProperty('hovered');

    const updateSize = (aspectRatio) => {
        if (aspectRatio > 1) {
            setWidth(MAX_SIZE);
            setHeight(MAX_SIZE / aspectRatio);
        } else {
            setWidth(MAX_SIZE * aspectRatio);
            setHeight(MAX_SIZE);
        }
    };

    useEffect(() => {
        if (screen) {
            // Playing immediately may fail, wait for interaction in that case
            doIfClicked(() => {
                updateSize(screen.videoWidth / screen.videoHeight || 1);
                screen.addEventListener('resize', () => {
                    updateSize(screen.videoWidth / screen.videoHeight || 1);
                })
            });
        }

        // Make sure to catch stream updates
        let listener = function (newStreamId) {
            if (newStreamId == client) setScreen(document.querySelector(QUERY_PREFIX + client));
        };
        streamShare.addStreamAddedListener(listener);

        return () => {
            streamShare.removeStreamAddedListener(listener);
        }
    }, [screen, client]);

    const texture = useMemo(() => screen ? <videoTexture attach='map' args={[screen]} anisoptry={16} generateMipmaps={true} minFilter={THREE.LinearMipmapLinearFilter} colorSpace={THREE.SRGBColorSpace} /> : null, [screen]);

    const handle = useMemo(() => <mesh
        geometry={frameGeometry}
        material={selected ? (hovered ? frameMaterialHoveredSelected : frameMaterialSelected) : (hovered ? frameMaterialHovered : frameMaterial)}
        scale={[width + 0.02, height + 0.02, 1]}
        position={[0, 0.125 - 0.0125, -0.0051]}
        autoUpdateMatrix={false}>
    </mesh>, [width, height, selected, hovered]);

    return <Movable handle={handle} upright={false}>
        <Plane args={[width, height]} position={[0, 0.125 - 0.0125, 0]}>
            <meshBasicMaterial toneMapped={false} color={screen ? 'white' : 'darkgrey'}>
                {texture}
            </meshBasicMaterial>
        </Plane>
    </Movable>;
}
