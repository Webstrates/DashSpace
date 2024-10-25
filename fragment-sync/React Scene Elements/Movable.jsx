import React from 'react';
const { useRef, useState, useEffect } = React;
import { useFrame } from '@react-three/fiber';
import { Interactive, useXREvent } from '@react-three/xr';
import * as THREE from 'three';
import { useProperty, useAction } from '#VarvReact';



const FAST_WRITEBACK_TIMEOUT = 33;
const SLOW_WRITEBACK_TIMEOUT = 500;

export const SELECTED_COLOR_PRIMARY = 'hsl(14, 100%, 50%)';
export const SELECTED_COLOR_SECONDARY = 'hsl(26, 100%, 60%)';
export const HOVERED_SELECTED_COLOR_PRIMARY = 'hsl(14, 100%, 65%)';
export const HOVERED_SELECTED_COLOR_SECONDARY = 'hsl(26, 100%, 75%)';



// Generic wrapper for Movable concept properties into ThreeJS transform properties
export function useTransform() {
    const [x, setX] = useProperty('positionX');
    const [y, setY] = useProperty('positionY');
    const [z, setZ] = useProperty('positionZ');

    const [rotX, setRotX] = useProperty('rotationX');
    const [rotY, setRotY] = useProperty('rotationY');
    const [rotZ, setRotZ] = useProperty('rotationZ');

    const [scale, setScale] = useProperty('scale');

    const transform = {
        get position() { return [x, y, z] },
        set position(pos) { setX(pos.x); setY(pos.y); setZ(pos.z) },
        get rotation() { return [rotX, rotY, rotZ] },
        set rotation(rot) { setRotX(rot.x); setRotY(rot.y); setRotZ(rot.z) },
        get scale() { return scale }
    }
    return transform;
}

/**
 * Make a group of children moveable with a handle that allows
 * selecting them and dragging them around.
 */
export function Movable({ children, transformRef, handle, upright = true }) {
    const transform = transformRef ? transformRef : useTransform(); // Optionally receive the transform from parent or create our own

    // Colour the handle based on selection/drag state
    const [beingDragged] = useProperty('beingDragged');
    const [hovered, setHovered] = useProperty('hovered');

    // Forward handle clicks and XR selection to Varv with the current uuid on it
    const [conceptUUID] = useProperty('concept::uuid');
    const selectMovable = (device, e) => {
        if (e) e.stopPropagation();
        if (conceptUUID) CustomJSTrigger.trigger('selectMovable', { uuid: conceptUUID });
        setTimeout(() => { CustomJSTrigger.trigger('dragStart', { device: device }); }, 0);
    };
    const deselectMovable = (e) => {
        if (e) e.stopPropagation();
        CustomJSTrigger.trigger('dragEnd');
    };
    const hoveredCallback = (e) => {
        if (e) e.stopPropagation();
        setHovered(true);
    };
    const blurCallback = () => {
        setHovered(false);
    };

    // Handle XR grabs
    const grabbingController = useRef();
    const dragRef = useRef();
    const dragIconRef = useRef();
    const previousTransform = React.useMemo(() => new THREE.Matrix4(), []);

    const [fastWritebackTimeout, setFastWritebackTimeout] = useState();
    const [slowWritebackTimeout, setSlowWritebackTimeout] = useState();
    const onMoved = useAction('onMoved');

    useFrame(() => {
        const controller = grabbingController.current;
        if (!controller) return;

        dragRef.current.applyMatrix4(previousTransform);
        dragRef.current.applyMatrix4(controller.matrixWorld);
        if (upright) {
            dragRef.current.rotation.reorder('YXZ');
            dragRef.current.rotation.x = 0;
            dragRef.current.rotation.z = 0;
        }
        dragRef.current.updateMatrixWorld();
        previousTransform.copy(controller.matrixWorld).invert();

        // Update the Varv state
        if (!fastWritebackTimeout) {
            transform.position = dragRef.current.position;
            setFastWritebackTimeout(setTimeout(() => {
                setFastWritebackTimeout(null);
            }, FAST_WRITEBACK_TIMEOUT));
        }
        if (!slowWritebackTimeout) {
            transform.rotation = dragRef.current.rotation;
            onMoved();
            setSlowWritebackTimeout(setTimeout(() => {
                setSlowWritebackTimeout(null);
            }, SLOW_WRITEBACK_TIMEOUT));
        }
    });

    // Update Three.js matrix manually when transform is done loading to save CPU
    useEffect(() => {
        if (dragIconRef.current) {
            dragIconRef.current.updateMatrix();
        }
        if (dragRef.current) {
            dragRef.current.updateMatrix();
            dragRef.current.updateMatrixWorld();
            dragRef.current.updateWorldMatrix(false, true);
        }
    }, [transform]);

    // Control dragged state from Varv
    const [draggingDevice] = useProperty('draggingDevice');
    useEffect(() => {
        if (dragRef && dragRef.current && beingDragged != undefined) {
            if (beingDragged) {
                grabbingController.current = VarvInteractionDeviceStates[draggingDevice];
                if (grabbingController.current) {
                    previousTransform.copy(grabbingController.current.matrixWorld).invert();
                }
            } else {
                grabbingController.current = undefined;
                transform.position = dragRef.current.position;
            }
        }
    }, [beingDragged]);

    // Always stop dragging when anything lets go
    function stopDrag() {
        if (grabbingController.current) deselectMovable();
    }
    useXREvent('selectend', stopDrag);
    useEffect(() => {
        document.body.addEventListener('pointerup', stopDrag);
        return () => {
            document.body.removeEventListener('pointerup', stopDrag);
        };
    }, []);

    return <group ref={dragRef} {...transform} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>
        <Interactive
            onSelectStart={() => selectMovable('controllerRight')}
            onHover={() => hoveredCallback()}
            onBlur={() => blurCallback()}>
            <group
                onPointerDown={(e) => selectMovable('camera', e)}
                onPointerUp={(e) => deselectMovable(e)}
                onPointerOver={(e) => hoveredCallback(e)}
                onPointerOut={blurCallback}>
                {handle}
            </group>
        </Interactive>
        {children}
    </group>;
}
