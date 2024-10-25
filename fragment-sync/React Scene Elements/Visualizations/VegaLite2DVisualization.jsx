import React from 'react';
const { useState, useEffect, useRef, useCallback, useMemo } = React;

import { Plane } from '@react-three/drei';
import * as THREE from 'three';
const { MeshStandardMaterial } = THREE;
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import embed from 'vega-embed';



const VIS_SIZE = 200;

const frameGeometry = new RoundedBoxGeometry(1, 1, 0.01, 1);
const frameMaterial = new MeshStandardMaterial({ color: '#E0E0E0', metalness: 0.2, roughness: 0.5 });



const createStringHash = (string) => {
    return crypto.subtle.digest('SHA-1', new TextEncoder().encode(string)).then(hashBuffer => {
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    });
}

export function VegaLite2DVisualization({ mergedSpec }) {
    const canvas = useRef(document.createElement('canvas'));
    const context = useRef(canvas.current.getContext('2d'));

    const [aspectRatio, setAspectRatio] = useState(1);
    const [textureHash, setTextureHash] = useState();

    const [specHash, setSpecHash] = useState('');

    const updateVisualization = useCallback((tempDiv) => {
        const tempCanvas = tempDiv.querySelector('canvas');

        canvas.current.width = tempCanvas.width;
        canvas.current.height = tempCanvas.height;

        context.current.fillStyle = 'white';
        context.current.fillRect(0, 0, canvas.current.width, canvas.current.height);
        context.current.drawImage(tempCanvas, 0, 0);

        setAspectRatio(canvas.current.width / canvas.current.height);
        setTextureHash(crypto.randomUUID());
    }, [canvas, context]);

    useEffect(() => {
        if (mergedSpec) {
            const newHash = createStringHash(JSON.stringify(mergedSpec));
            if (newHash !== specHash) {
                setSpecHash(newHash);

                mergedSpec.width = VIS_SIZE;
                mergedSpec.height = VIS_SIZE;

                const tempDiv = document.createElement('div');
                embed(tempDiv, mergedSpec, { renderer: 'canvas' }).then((result) => {
                    updateVisualization(tempDiv);
                    result.finalize();
                });
            }
        } else {
            context.current.fillStyle = 'white';
            context.current.fillRect(0, 0, canvas.current.width, canvas.current.height);
            setAspectRatio(1);
            setTextureHash(crypto.randomUUID());
        }
    }, [mergedSpec]);

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
