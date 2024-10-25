import * as THREE from "three";



const DEBUG = false;



let interactionDeviceStates = {};
window.VarvInteractionDeviceStates = interactionDeviceStates;

class DevicePositionAction extends Action {
    constructor(name, options, concept) {
        super(name, options, concept);
    }

    async apply(contexts, actionArguments) {
        return this.forEachContext(contexts, actionArguments, async (context, options) => {
            const device = interactionDeviceStates[options.device];

            let x = 0;
            let y = 0;
            let z = 0;

            if (device) {
                let position = device.position;

                const distance = options.distance ? options.distance : 0;
                if (distance != 0) {
                    const direction = new THREE.Vector3(0, 0, -1);
                    direction.normalize();
                    direction.applyQuaternion(device.quaternion);

                    position = new THREE.Vector3();
                    position.copy(device.position).add(direction.multiplyScalar(distance));
                }

                x = position.x;
                y = position.y;
                z = position.z;
            }

            Action.setVariable(context, 'devPosX', x);
            Action.setVariable(context, 'devPosY', y);
            Action.setVariable(context, 'devPosZ', z);

            if (DEBUG) console.log('DevicePosition', camera, position);

            return context;
        });
    }
}
Action.registerPrimitiveAction('devicePosition', DevicePositionAction);
window.DevicePositionAction = DevicePositionAction;



class DeviceDistanceAction extends Action {
    constructor(name, options, concept) {
        super(name, options, concept);
    }

    async apply(contexts, actionArguments) {
        return this.forEachContext(contexts, actionArguments, async (context, options) => {
            const device = interactionDeviceStates[options.device];

            const devicePosition = device.position;
            let x = devicePosition.x-options.x;
            let y = devicePosition.y-options.y;
            let z = devicePosition.z-options.z;
            const distance = Math.sqrt(x*x+y*y+z*z);

            Action.setVariable(context, 'devDist', distance);

            if (DEBUG) console.log('DeviceDistance', device, distance);

            return context;
        });
    }
}
Action.registerPrimitiveAction('deviceDistance', DeviceDistanceAction);
window.DeviceDistanceAction = DeviceDistanceAction;



class DeviceRotationAction extends Action {
    constructor(name, options, concept) {
        super(name, options, concept);
    }

    async apply(contexts, actionArguments) {
        return this.forEachContext(contexts, actionArguments, async (context, options) => {
            const device = interactionDeviceStates[options.device];
            let x = 0;
            let y = 0;
            let z = 0;

            if (device) {
                x = device.rotation._x;
                y = device.rotation._y;
                z = device.rotation._z;
            }

            Action.setVariable(context, 'devRotX', x);
            Action.setVariable(context, 'devRotY', y);
            Action.setVariable(context, 'devRotZ', z);

            if (DEBUG) console.log('DeviceRotation', device, x, y, z);
            return context;
        });
    }
}
Action.registerPrimitiveAction('deviceRotation', DeviceRotationAction);
window.DeviceRotationAction = DeviceRotationAction;
