import React from 'react';
const { useState, useMemo } = React;

import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Text } from '@react-three/drei';
import { MeshStandardMaterial, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { useProperty } from '#VarvReact';
import { transcribeAudio } from '#helpers';
import { Icon } from '#components [name="Icon"]';
import { Movable, SELECTED_COLOR_PRIMARY, HOVERED_SELECTED_COLOR_PRIMARY } from '#elements [name="Movable"]';



const frameGeometry = new RoundedBoxGeometry(0.15, 0.15, 0.005, 1);
const frameMaterial = new MeshStandardMaterial({ color: '#FDD835', metalness: 0.2, roughness: 0.5 });
const frameMaterialHovered = new MeshStandardMaterial({ color: '#FFF176', metalness: 0.2, roughness: 0.5 });
const frameMaterialSelected = new MeshStandardMaterial({ color: SELECTED_COLOR_PRIMARY, metalness: 0.2, roughness: 0.5 });
const frameMaterialHoveredSelected = new MeshStandardMaterial({ color: HOVERED_SELECTED_COLOR_PRIMARY, metalness: 0.2, roughness: 0.5 });



/**
 * Render a movable post-it like note that updates its contents when clicked.
 */
export function StickyNote() {
    const [listening, setListening] = useState(false);
    const [micScale, setMicScale] = useState(new Vector3(0.5, 0.5, 0.5));
    const [text, setText] = useProperty('text');
    const [selected] = useProperty('selected');
    const [hovered] = useProperty('hovered');

    async function updateText() {
        if (listening) return;

        setListening(true);
        const newText = await transcribeAudio(5000, false, () => { setListening(false); });
        if (newText) setText(newText);
    }

    const handle = useMemo(() => <mesh
        geometry={frameGeometry}
        material={selected ? (hovered ? frameMaterialHoveredSelected : frameMaterialSelected) : (hovered ? frameMaterialHovered : frameMaterial)}
        position={[0, 0.025, 0]}
        autoUpdateMatrix={false}
    />, [hovered, selected]);

    const micIcon = useMemo(() => dashSpaceMeshCache.load('microphone.glb'), []);

    useFrame((state, delta) => {
        const scaleSpeed = 3;
        const minScale = 0.4;
        const maxScale = 0.6;
        const targetScale = listening ? minScale + (maxScale - minScale) * (Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5) : 0.5;
        const newScale = micScale.clone().lerp(new Vector3(targetScale, targetScale, targetScale), scaleSpeed * delta);
        setMicScale(newScale);
    });

    return <Movable handle={handle} upright={false}>
        <Text
            position={[0, 0.025, 0.003]} autoUpdateMatrix={false}
            maxWidth={0.13}
            textAlign='left'
            anchorX='center'
            anchorY='middle'
            color='black'
            outlineWidth='5%'
            outlineColor='white'
            fontSize={0.01}>
            {text}
        </Text>
        <Interactive onSelectEnd={updateText}>
            <Icon model={micIcon} rotation={[0, -Math.PI, 0]} scale={micScale} position={[0.1, 0.025, 0]} onClick={updateText} />
        </Interactive>
    </Movable>;
}
