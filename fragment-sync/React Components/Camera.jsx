import React from 'react';
const { useRef, useEffect } = React;

import { useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Vector3 } from 'three';



const SPEED = 1.4;



export function CustomCamera() {
    const controls = useRef();
    const crosshair = useRef(document.querySelector('.crosshair'));
    const moveDirection = useRef(new Vector3());

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!controls.current.isLocked) return;
            switch (event.code) {
                case 'KeyW':
                    moveDirection.current.z = -1;
                    break;
                case 'KeyS':
                    moveDirection.current.z = 1;
                    break;
                case 'KeyA':
                    moveDirection.current.x = -1;
                    break;
                case 'KeyD':
                    moveDirection.current.x = 1;
                    break;
                case 'Space':
                    moveDirection.current.y = 1;
                    break;
                case 'ShiftLeft':
                    moveDirection.current.y = -1;
                    break;
                case 'KeyE':
                    CustomJSTrigger.trigger('unselectMovable');
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'KeyS':
                    moveDirection.current.z = 0;
                    break;
                case 'KeyA':
                case 'KeyD':
                    moveDirection.current.x = 0;
                    break;
                case 'Space':
                case 'ShiftLeft':
                    moveDirection.current.y = 0;
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        controls.current.camera.position.set(0, 1.5, 1);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        if (moveDirection.current.x != 0 || moveDirection.current.y != 0 || moveDirection.current.z != 0) {
            const timeBasedSpeed = SPEED * delta;
            controls.current.getObject().translateX(moveDirection.current.x * timeBasedSpeed);
            controls.current.getObject().translateY(moveDirection.current.y * timeBasedSpeed * 0.5);
            controls.current.getObject().translateZ(moveDirection.current.z * timeBasedSpeed);
        }
        controls.current.getObject().updateMatrix();
        controls.current.getObject().updateMatrixWorld();
    });

    const handleOnLock = (e) => { crosshair.current.style.display = 'block'; };
    const handleOnUnlock = (e) => { crosshair.current.style.display = 'none'; };

    return <PointerLockControls ref={controls} selector={'.mouse-lock'} onLock={handleOnLock} onUnlock={handleOnUnlock} />;
}
