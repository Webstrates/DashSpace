import React from 'react';
const { useRef, useState, useEffect, useMemo } = React;

import { Image } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ErrorBoundary } from 'react-error-boundary';

import { useProperty } from '#VarvReact';
import { Movable, SELECTED_COLOR_PRIMARY, HOVERED_SELECTED_COLOR_PRIMARY } from '#elements [name="Movable"]';



const MAX_SIZE = 0.4;

// Reuseable geometry for the image frame
const frameGeometry = new RoundedBoxGeometry(1, 1, 0.005, 1);
const frameMaterial = new MeshStandardMaterial({ color: '#E0E0E0', metalness: 0.2, roughness: 0.5 });
const frameMaterialHovered = new MeshStandardMaterial({ color: '#FFFFFF', metalness: 0.2, roughness: 0.5 });
const frameMaterialSelected = new MeshStandardMaterial({ color: SELECTED_COLOR_PRIMARY, metalness: 0.2, roughness: 0.5 });
const frameMaterialHoveredSelected = new MeshStandardMaterial({ color: HOVERED_SELECTED_COLOR_PRIMARY, metalness: 0.2, roughness: 0.5 });



/**
 * Show a movable image with a nice border around it.
 */
export function CustomImage() {
    const boundaryRef = useRef();
    const imageRef = useRef();
    const [width, setWidth] = useState(1);
    const [height, setHeight] = useState(1);
    const [url] = useProperty('url');

    const [selected] = useProperty('selected');
    const [hovered] = useProperty('hovered');

    // Update the aspect ratio on changes
    useEffect(() => {
        if (boundaryRef.current) boundaryRef.current.resetErrorBoundary();
        if (imageRef.current) {
            const aspectRatio = imageRef.current.material.__r3f.memoizedProps.imageBounds[0] / imageRef.current.material.__r3f.memoizedProps.imageBounds[1] || 1;
            if (aspectRatio > 1) {
                setWidth(MAX_SIZE);
                setHeight(MAX_SIZE / aspectRatio);
            } else {
                setWidth(MAX_SIZE * aspectRatio);
                setHeight(MAX_SIZE);
            }
        }
    }, [url, imageRef]);

    const handle = useMemo(() => <mesh
        geometry={frameGeometry}
        material={selected ? (hovered ? frameMaterialHoveredSelected : frameMaterialSelected) : (hovered ? frameMaterialHovered : frameMaterial)}
        scale={[width + 0.02, height + 0.02, 1]}
        position={[0, 0.125 - 0.025, -0.0026]}
        autoUpdateMatrix={false}>
    </mesh>, [width, height, selected, hovered]);

    return <Movable handle={handle} upright={false}>
        <ErrorBoundary ref={boundaryRef} fallback={null}>
            <Image ref={imageRef} url={url} position={[0, 0.125 - 0.025, 0]} scale={[width, height, 1]} autoUpdateMatrix={false}>
                <planeGeometry args={[1, 1]} />
            </Image>
        </ErrorBoundary>
    </Movable>;
}
