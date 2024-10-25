import React from 'react';
let { useState, useEffect } = React;

import { createPortal } from '@react-three/fiber';
import { Interactive, useXR } from '@react-three/xr';
import { Text } from '@react-three/drei';

import { useProperty } from '#VarvReact';
import { Icon } from "#components [name='Icon']";



// Individual buttons in the menu
function ControllerMenuButton({ position, name, icon, theme = 'button', callback }) {
    const [hovered, setHovered] = useState();

    return <group position={position} scale={hovered ? 1.1 : 1} autoUpdateMatrix={false}>
        <Interactive onSelectEnd={callback} onHover={() => setHovered(true)} onBlur={() => setHovered(false)}>
            <Icon theme={theme + (hovered ? ':hovered' : '')} model={icon} />
        </Interactive>
        <Text
            position={[0, 0, 0.006]} autoUpdateMatrix={false}
            maxWidth={0.045}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="black"
            outlineWidth="5%"
            outlineColor="white"
            fontSize={0.007}>
            {name}
        </Text>
    </group>;
}

/**
 * A floating menu attached to your left controller or hand.
 */
export function ControllerMenu() {
    const [presentationMode, setPresentationMode] = useProperty('presentationMode');
    const [multiSelect, setMultiSelect] = useProperty('multiSelect');
    const [showMenu, setShowMenu] = useState(false);

    const {
        controllers,
        isHandTracking
    } = useXR()
    const [parent, setParent] = useState();

    useEffect(() => {
        const parentController = controllers.find((controller) => {
            if (!controller.inputSource) return false;
            return controller.inputSource.handedness === 'left';
        });
        if (isHandTracking) {
            setParent(parentController ? parentController.hand.children[0] : null);
        } else {
            setParent(parentController ? parentController.grip : null);
        }
    }, [controllers, isHandTracking]);

    const buttonIcon = dashSpaceMeshCache.load('button.glb');

    return <>
        {parent ? createPortal(<group position={isHandTracking ? [0, 0.02, -0.1] : [0, 0.05, -0.1]} rotation={isHandTracking ? [-Math.PI / 2, 0.2, 0.2] : [-Math.PI / 2, 0, 0]}>
            <ControllerMenuButton icon={buttonIcon} position={[0, -0.06, 0]} name={'Show Menu'} callback={() => setShowMenu(!showMenu)} theme={showMenu ? 'button:toggled' : 'button'} />

            {showMenu ? <>
                <ControllerMenuButton icon={buttonIcon} position={[-0.04, 0.12, 0]} name={'Merge Components'} callback={() => CustomJSTrigger.trigger('mergeComponents', { device: 'camera' })} />
                <ControllerMenuButton icon={buttonIcon} position={[-0.04, 0.06, 0]} name={'Clone'} callback={() => CustomJSTrigger.trigger('cloneMovable')} />
                <ControllerMenuButton icon={buttonIcon} position={[-0.04, 0, 0]} name={'Delete'} theme="deleteButton" callback={() => CustomJSTrigger.trigger('deleteMovable')} />

                <ControllerMenuButton icon={buttonIcon} position={[0.12, 0.06, 0]} name={'Start Audio'} callback={window.shareMyAudio} />
                <ControllerMenuButton icon={buttonIcon} position={[0.12, 0, 0]} name={'Stop Audio'} callback={window.stopSharingMyAudio} />

                <ControllerMenuButton icon={buttonIcon} position={[0.04, 0.12, 0]} name={'New Bookshelf'} callback={() => CustomJSTrigger.trigger('createObject', { concept: 'VisShelf', device: 'camera' })} />
                <ControllerMenuButton icon={buttonIcon} position={[0.04, 0.06, 0]} name={'New Trashcan'} callback={() => CustomJSTrigger.trigger('createObject', { concept: 'Trashcan', device: 'camera' })} />
                <ControllerMenuButton icon={buttonIcon} position={[0.04, 0, 0]} name={'New Sticky Note'} callback={() => CustomJSTrigger.trigger('createObject', { concept: 'StickyNote', device: 'camera' })} />

                <ControllerMenuButton icon={buttonIcon} position={[-0.12, 0.12, 0]} name={'Toggle Present Mode'} theme={presentationMode ? 'button:toggled' : null} callback={() => setPresentationMode(!presentationMode)} />
                <ControllerMenuButton icon={buttonIcon} position={[-0.12, 0, 0]} name={'Deselect All'} callback={() => CustomJSTrigger.trigger('unselectMovable')} />
                <ControllerMenuButton icon={buttonIcon} position={[-0.12, 0.06, 0]} name={'Toggle Multi-Select'} theme={multiSelect ? 'button:toggled' : null} callback={() => setMultiSelect(!multiSelect)} />
            </> : null}
        </group>, parent) : null}
    </>;
}
