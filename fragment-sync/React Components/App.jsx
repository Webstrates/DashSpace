import React from 'react';

import { Canvas, useFrame } from '@react-three/fiber';
import { XR, Controllers, Hands, useXR } from '@react-three/xr';
import { Stats, Environment, Stage } from '@react-three/drei';
import { BackSide } from 'three';

import { Varv } from '#VarvReact';
import { preloadMeshes } from '#components [name="MeshCache"]';
preloadMeshes();

import { Login } from '#components [name="Login"]';
import { GUIOverlay } from '#components [name="GUIOverlay"]';
import { CustomCamera } from '#components [name="Camera"]';
import { ControllerMenu } from '#components [name="ControllerMenu"]';
import { CalibrationPoint } from '#components [name="CalibrationPoint"]';

import { StickyNote } from '#elements [name="StickyNote"]';
import { CustomImage } from '#elements [name="Image"]';

import { VisComponent } from '#elements [name="VisComponent"]';
import { Visualization } from '#elements [name="Visualization"]';
import { VisShelf, Trashcan } from '#elements [name="VisShelf"]';

import { UserDevices } from '#elements [name="UserDevices"]';

import { ScreenStream } from '#elements [name="ScreenStream"]';
import { AudioStream } from '#elements [name="AudioStream"]';



const urlParams = new URLSearchParams(window.location.search);
const LOCAL_REFERENCE_SPACE = urlParams.get('lrs') === 'true';



function VarvScene() {
    return <>
        <Varv concept="MovableManager">
            <Varv concept="StickyNote"><StickyNote /></Varv>
            <Varv concept="Image"><CustomImage /></Varv>

            <Varv concept="Visualization"><Visualization /></Varv>
            <Varv concept="VisComponent" if="!presentationMode"><VisComponent /></Varv>
            <Varv concept="VisShelf" if="!presentationMode"><VisShelf /></Varv>
            <Varv concept="Trashcan" if="!presentationMode"><Trashcan /></Varv>

            <Varv concept="ScreenStream"><ScreenStream /></Varv>
            <Varv concept="AudioStream"><AudioStream /></Varv>
        </Varv>
        <UserDevices />
    </>;
}

function View3D() {
    const {
        controllers,
        isPresenting,
        isHandTracking,
    } = useXR();

    // Positional hooks
    useFrame((state) => {
        VarvInteractionDeviceStates['camera'] = state.camera;
        controllers.forEach((controller) => {
            if (controller.inputSource && controller.inputSource.handedness) {
                if (controller.inputSource.handedness === 'left') {
                    VarvInteractionDeviceStates['controllerLeft'] = isHandTracking ? controller.hand.children[0] : controller.grip;
                } else {
                    VarvInteractionDeviceStates['controllerRight'] = isHandTracking ? controller.hand.children[0] : controller.grip;
                }
            }
        });
    });

    // Render the scene
    return <>
        {isPresenting ? // Use a slightly different setup in VR as opposed to normal browser
            <>{/** XR **/}
                <CalibrationPoint />
                <Controllers />
                <Hands />
                <Varv concept="MovableManager">
                    <ControllerMenu />
                </Varv>
                <Environment preset="city" />
                <VarvScene />
            </>
            :
            <>{/** Normal Browser **/}
                <gridHelper />
                <CustomCamera />
                <Stats />
                <color attach="background" args={[0xE5E4E2]} />
                <mesh scale={200}>
                    <sphereGeometry />
                    <meshStandardMaterial color="#E5E4E2" side={BackSide} transparent={true} opacity={0.4} />
                </mesh>
                <Stage preset="soft" adjustCamera={false} environment="city" intensity={0.5} center={{ disable: true }}>
                    <VarvScene />
                </Stage>
            </>
        }
    </>;
}



export function App() {
    return <>
        <div className="crosshair"></div>
        <Varv concept="UserManager" if="!loggedIn"><Login /></Varv>
        <GUIOverlay />
        <Canvas dpr={2} gl={{ preserveDrawingBuffer: true }}>
            <XR referenceSpace={LOCAL_REFERENCE_SPACE ? 'local' : 'local-floor'}>
                <View3D />
            </XR>
        </Canvas>
    </>;
}
