import React from 'react';
const { useState, useEffect, useRef, useCallback, useMemo } = React;

import { Plane } from '@react-three/drei';
import * as THREE from 'three';
const { MeshStandardMaterial } = THREE;
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import * as d3 from 'd3';



// Reuseable geometry for the image frame
const frameGeometry = new RoundedBoxGeometry(1, 1, 0.01, 1);
const frameMaterial = new MeshStandardMaterial({ color: '#E0E0E0', metalness: 0.2, roughness: 0.5 });



export function D3Visualization({ d3Spec, d3Dataset }) {
    const canvas = useRef(document.createElement('canvas'));
    const context = useRef(canvas.current.getContext('2d'));

    const [aspectRatio, setAspectRatio] = useState(1);
    const [textureHash, setTextureHash] = useState();

    useEffect(() => {
        if (d3Spec && d3Dataset) {
            context.current.fillStyle = 'white';
            context.current.fillRect(0, 0, canvas.current.width, canvas.current.height);
            try {
                d3Spec.fragment.require().then((result) => {
                    result.renderVisualization(d3, d3Dataset, canvas.current);
                    setAspectRatio(canvas.current.width / canvas.current.height);
                    setTextureHash(crypto.randomUUID());
                });
            } catch (e) {
                console.warn('Could not render D3 visualization', e);
                setAspectRatio(1);
                setTextureHash(crypto.randomUUID());
            }
        } else {
            context.current.fillStyle = 'white';
            context.current.fillRect(0, 0, canvas.current.width, canvas.current.height);
            setAspectRatio(1);
            setTextureHash(crypto.randomUUID());
        }
    }, [d3Spec, d3Dataset]);

    const texture = useMemo(() => <canvasTexture attach="map" image={canvas.current} key={textureHash} />, [textureHash]);

    return <>
        <mesh geometry={frameGeometry} material={frameMaterial}
            scale={[0.5 + 0.02, (0.5 / aspectRatio) + 0.02, 1]} position={[0.5, (0.25 / aspectRatio), -0.0051]} autoUpdateMatrix={false} />
        <Plane args={[0.5, 0.5 / aspectRatio]} position={[0.5, 0.25 / aspectRatio, 0]}>
            <meshBasicMaterial toneMapped={false} color="white">
                {texture}
            </meshBasicMaterial>
        </Plane>
    </>;
}
