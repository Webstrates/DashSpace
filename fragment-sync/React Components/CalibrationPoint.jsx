import React from 'react';
const { useRef } = React;

import { useFrame, useThree } from '@react-three/fiber';
import { Interactive, useXREvent } from '@react-three/xr';
import * as THREE from 'three';

import { Icon } from "#components [name='Icon']";



const urlParams = new URLSearchParams(window.location.search);
const LOCAL_REFERENCE_SPACE = urlParams.get('lrs') === 'true';



const questBrowser = window.navigator.userAgent.includes('OculusBrowser');

/**
 * Move the entire scene view based on a calibration marker or a cube that can be moved around.
 */
export function CalibrationPoint() {
    let offsetUpdate = false;
    const grabbingController = useRef();
    const previousTransform = React.useMemo(() => new THREE.Matrix4(), [])
    const dragRef = useRef();

    // If a new offset has been set, inform the XR manager
    useFrame((state) => {
        if (offsetUpdate) {
            const referenceSpace = state.gl.xr.getReferenceSpace()
            state.gl.xr.setReferenceSpace(referenceSpace.getOffsetReferenceSpace(offsetUpdate));
            offsetUpdate = false;
        }

        const controller = grabbingController.current;
        if (!controller) return;

        dragRef.current.applyMatrix4(previousTransform);
        dragRef.current.applyMatrix4(controller.matrixWorld);
        dragRef.current.rotation.reorder('YXZ');
        dragRef.current.rotation.x = 0;
        dragRef.current.rotation.z = 0;
        dragRef.current.updateMatrixWorld();
        previousTransform.copy(controller.matrixWorld).invert();
    });

    // When the reference has moved, store the offset and reset it back (but not in height)
    const calibrate = () => {
        if (!dragRef.current) return;
        dragRef.current.rotation.reorder('YXZ');
        dragRef.current.rotation.x = 0;
        dragRef.current.rotation.z = 0;
        offsetUpdate = new XRRigidTransform({
            x: dragRef.current.position.x,
            y: LOCAL_REFERENCE_SPACE ? dragRef.current.position.y : 0,
            z: dragRef.current.position.z
        }, dragRef.current.quaternion);
        dragRef.current.rotation.y = 0;
        dragRef.current.position.x = 0;
        if (LOCAL_REFERENCE_SPACE) dragRef.current.position.y = 0;
        dragRef.current.position.z = 0;
    };

    const calibrateIcon = dashSpaceMeshCache.load('calibration_point.glb');
    const { camera } = useThree();

    useXREvent('selectend', (e) => {
        if (e.target.controller === grabbingController.current) {
            grabbingController.current = undefined;
            calibrate();
        }
    });

    return <>
        {questBrowser ?
            <Interactive ref={dragRef} onSelectStart={(e) => {
                grabbingController.current = e.target.controller;
                previousTransform.copy(e.target.controller.matrixWorld).invert();
            }}>
                <Icon theme="calibrationPoint" model={calibrateIcon} />
            </Interactive>
            :
            <group ref={dragRef} onPointerDown={() => {
                grabbingController.current = camera;
                previousTransform.copy(camera.matrixWorld).invert();
            }}
                onPointerUp={() => {
                    if (camera === grabbingController.current) {
                        grabbingController.current = undefined;
                        calibrate();
                    }
                }}>
                <Icon theme="calibrationPoint" model={calibrateIcon} />
            </group>
        }
    </>;
}
