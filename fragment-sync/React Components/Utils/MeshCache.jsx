import { useGLTF } from '@react-three/drei';



const DEBUG = false;



// Cache all ressources on window since they take a lot of time to load
if (!window.dashSpaceMeshCache) {
    window.dashSpaceMeshCache = {
        preloaded: {},
        cache: {},
        load: function load(name) {
            if (this.cache[name]) return this.cache[name];
            let model = useGLTF(name);
            if (model) {
                this.cache[name] = model;
                return model;
            } else {
                console.log('Missing model ' + name);
            }
        }
    };
}

export function preloadMeshes() {
    webstrate.assets.filter((asset) => { return (!asset.deletedAt) && (asset.fileName.endsWith('.glb') || asset.fileName.endsWith('.gltf')) }).forEach((asset) => {
        let model = asset.fileName;
        if (!window.dashSpaceMeshCache.preloaded[model]) {
            if (DEBUG) console.log('Preloading model ' + model);
            useGLTF.preload(model);
            window.dashSpaceMeshCache.preloaded[model] = true;
            if (DEBUG) console.log('Done loading model ' + model);
        }
    });
}
