import React from 'react';
let { useState, useEffect } = React;
import { Varv, useProperty } from '#VarvReact';
import { Text, Cone, Gltf } from '@react-three/drei';
import { useXR, Interactive } from '@react-three/xr';
import { VideoStream } from '#elements [name="VideoStream"]';
import { useFrame, useThree } from '@react-three/fiber';



const urlParams = new URLSearchParams(window.location.search);
const DISABLED = urlParams.get('dud') === 'true';
// To disable the interval in the Varv concepts
window.checkUserDevicesDisabled = (contexts) => {
    if (DISABLED) {
        throw new StopError('User devices are disabled.');
    } else {
        return contexts;
    }
};



const cameraModel = <Gltf src="model-camera.glb" scale={1} rotation={[0, Math.PI, 0]} />;
const phoneModel = <Gltf src="model-phone.glb" scale={0.01} />;
const headsetModel = <Gltf src="model-headset.glb" scale={0.9} rotation={[0, Math.PI, 0]} position={[0, 0.04, 0.11]} />;
const leftControllerModel = <Gltf src="model-controller-left.glb" scale={1} rotation={[Math.PI / 4, 0, 0]} />;
const rightControllerModel = <Gltf src="model-controller-right.glb" scale={1} rotation={[Math.PI / 4, 0, 0]} />;

const viewCone = <Cone args={[0.1, 0.1, 32]} position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
    <meshStandardMaterial color="skyblue" transparent={true} opacity={0.66} />
</Cone>;


// Remove other people's UserDevices when clients leave or join
const cleanup = async () => {
    if (webstrate.clients.length < 1) return;
    const concept = VarvEngine.getConceptFromType('UserDevice');
    const devices = await (VarvEngine.lookupInstances('UserDevice'));
    for (let device of devices) {
        if (!webstrate.clients.includes(await (concept.getPropertyValue(device, 'client')))) {
            concept.delete(device);
        }
    }
};

/**
 * Ensure that our devices are available in Varv and marked as isMine so they broadcast
 * their location.
 */
const updateDevices = async () => {
    if (DISABLED) return;
    const concept = VarvEngine.getConceptFromType('UserDevice');

    for (let deviceName of ['camera', 'controllerLeft', 'controllerRight']) {
        if (!VarvInteractionDeviceStates[deviceName]) continue; // We don't have this device, skip

        // Check if one exists already because we are just reloading Varv locally
        const device = await (VarvEngine.lookupInstances(
            'UserDevice',
            new FilterAnd([
                new FilterProperty('client', FilterOps.equals, webstrate.clientId),
                new FilterProperty('type', FilterOps.equals, deviceName),
            ])
        ));

        if (device.length > 0) {
            // Found an existing one, re-use it
            concept.setPropertyValue(device[0], 'isMine', true);
        } else {
            // Need to create a new one
            concept.create(null, {
                type: deviceName,
                userAgent: window.navigator.userAgent,
                client: webstrate.clientId,
                isMine: true,
            });
        }
    }
};



/**
 * Render a single user headset, camera or controller device.
 */
function UserDevice() {
    const [type] = useProperty('type');
    const [userAgent] = useProperty('userAgent');
    const [position] = useProperty('position');
    const [rotation] = useProperty('rotation');
    const [user] = useProperty('user');

    const [systemType, setSystemType] = useState('');

    const isPresenting = useXR((state) => state.isPresenting);
    const [remoteControlled, setRemoteControlled] = useProperty('remoteControlled');
    const [remoteControllingClient, setRemoteControllingClient] = useProperty('remoteControllingClient');

    const [model, setModel] = useState(cameraModel);

    useEffect(() => {
        switch (type) {
            case 'camera':
                if (userAgent.includes('OculusBrowser')) {
                    setModel(<> {headsetModel} {viewCone} </>);
                } else if (/(iPad|iPhone|iPod|Android)/i.test(userAgent)) {
                    setModel(<> {phoneModel} {viewCone} </>);
                } else {
                    setModel(<> {cameraModel} {viewCone} </>);
                }
                break;
            case 'controllerLeft':
                setModel(leftControllerModel);
                break;
            case 'controllerRight':
                setModel(rightControllerModel);
                break;
            default:
                setModel(cameraModel);
        }
    }, [type, userAgent]);

    useEffect(() => {
        if (!userAgent) return;

        if (userAgent.includes('OculusBrowser')) {
            setSystemType('oculus');
        } else if (/(iPad|iPhone|iPod|Android)/i.test(userAgent)) {
            setSystemType('mobile');
        } else {
            setSystemType('desktop');
        }
    }, [userAgent]);

    const remoteControlCallback = (newValue) => {
        setRemoteControlled(newValue);
        setRemoteControllingClient(newValue ? webstrate.clientId : '');
    };

    return <group position={position} rotation={rotation}>
        {(isPresenting && (type == 'camera') && (systemType == 'desktop')) ? <Interactive
            onSelectStart={() => remoteControlCallback(true)}
            onSelectMissed={() => remoteControlCallback(false)}>
            {model}
        </Interactive> : model}
        <Varv property="clientVideoStream">
            <VideoStream />
        </Varv>
        <Text
            position={[0, 0.11, 0]}
            rotation={[0, Math.PI, 0]}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="black"
            outlineWidth="5%"
            outlineColor="white"
            fontSize={0.05}>
            {user}
        </Text>
    </group >;
}

function UserDeviceRemoteController() {
    const [remoteControlled] = useProperty('remoteControlled');
    const [position] = useProperty('position');
    const [rotation] = useProperty('rotation');

    const camera = useThree(state => state.camera);

    useFrame(() => {
        if (remoteControlled) {
            camera.position.set(position[0], position[1], position[2]);
            camera.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
    });
}

/**
 * Show all currently connected userdevices as objects in the scene.
 */
export function UserDevices() {
    const isPresenting = useXR((state) => state.isPresenting);

    // Ensure that UserDevices are updated in the environement
    useEffect(() => {
        let reloadCallback = VarvEngine.registerEventCallback('engineReloaded', () => {
            setTimeout(() => { updateDevices(); }, 250)
        });
        webstrate.on('clientPart', cleanup);
        webstrate.on('clientJoin', cleanup);

        return () => {
            reloadCallback.delete()
            webstrate.off('clientPart', cleanup);
            webstrate.off('clientJoin', cleanup);
        };
    }, []);

    useEffect(() => {
        setTimeout(() => { updateDevices(); }, 3000);
    }, [isPresenting]);

    updateDevices();

    return <>
        <Varv concept="UserDevice" if="!isMine">
            <UserDevice />
        </Varv>
        <Varv concept="UserDevice" if="isMine">
            <UserDeviceRemoteController />
        </Varv>
    </>;
}
