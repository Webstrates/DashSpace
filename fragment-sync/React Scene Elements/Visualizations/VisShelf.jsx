import React from 'react';
const { useState, useEffect, useRef, useMemo } = React;

import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
const { MeshStandardMaterial, InstancedMesh } = THREE;
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { useProperty } from '#VarvReact';
import { Movable } from '#elements [name="Movable"]';
import { Interactive } from '@react-three/xr';
import { HandleIcon, Icon, themes } from '#components [name="Icon"]';
const {
    getVisComponentById,
    getVegaLiteSpecComponents,
    getDatasetComponents,
    getD3SpecComponents,
    addVisComponentAddedListener,
    removeVisComponentAddedListener,
    addVisComponentRemovedListener,
    removeVisComponentRemovedListener
} = modules.visComponentManager;
const { defaultVisSnippetTypes, getVisSnippetsFromComponent, getVisSnippetsFromParent, } = modules.visSnippetManager;



const DEBUG = false;

const metalnessValue = 0.5;
const roughnessValue = 0.5;
const indicatorMaterials = {
    'visualizations': new MeshStandardMaterial({ color: themes['visualization'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'visualizations:hovered': new MeshStandardMaterial({ color: themes['visualization:hovered'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'spec': new MeshStandardMaterial({ color: themes['spec'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'spec:hovered': new MeshStandardMaterial({ color: themes['spec:hovered'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'dataset': new MeshStandardMaterial({ color: themes['dataset'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'dataset:hovered': new MeshStandardMaterial({ color: themes['dataset:hovered'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'd3Spec': new MeshStandardMaterial({ color: themes['d3Spec'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'd3Spec:hovered': new MeshStandardMaterial({ color: themes['d3Spec:hovered'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'specSnippet': new MeshStandardMaterial({ color: themes['specSnippet'].primary, metalness: metalnessValue, roughness: roughnessValue }),
    'specSnippet:hovered': new MeshStandardMaterial({ color: themes['specSnippet:hovered'].primary, metalness: metalnessValue, roughness: roughnessValue })
};

const icons = {
    'vegaLite_2D' : dashSpaceMeshCache.load('visualizations_2d.glb'),
    'vegaLite_25D' : dashSpaceMeshCache.load('visualizations_25d.glb'),
    'optomancy' : dashSpaceMeshCache.load('visualizations_3d.glb'),
    'd3' : dashSpaceMeshCache.load('visualizations_d3.glb'),
    'spec': dashSpaceMeshCache.load('components_specs.glb'),
    'dataset': dashSpaceMeshCache.load('components_dataset.glb'),
    'd3Spec': dashSpaceMeshCache.load('components_specs_d3.glb'),
    'specSnippet': dashSpaceMeshCache.load('components_snippets.glb')
};

const defaultShelfMaterial = new MeshStandardMaterial({metalness: 0.7, roughness: 0.3});
const defaultGraphBoxGeometry = new RoundedBoxGeometry();
const defaultShelfBoxGeometry = new RoundedBoxGeometry(1, 1, 1, 10);
const defaultShelfColor = themes['bookshelf'].primary;

const SHELF_WIDTH = 0.5;
const SHELF_HEIGHT = 0.5;
const SHELF_BOARD_THICKNESS = 0.01;
const SHELF_DEPTH = 0.1;



const generateDummies = (columns, rows, shelfComponents, setTempTitle) => {
    const dummies = [];

    for (let i = 0; i < shelfComponents.length; i++) {
        const component = shelfComponents[i];
        const x = i % columns;
        const y = Math.floor(i / columns);
        const scale = Math.min(1.2 / columns, 0.8);
        dummies.push(<VisComponentDummy
            component={component}
            key={i}
            position={[(x + 0.5) * SHELF_WIDTH / columns, ((rows - y - 0.5) * SHELF_HEIGHT / rows) - 0.05 * scale, 0]}
            scale={[scale, scale, scale]}
            setTempTitle={setTempTitle}
        />);
    }

    return dummies;
};

function VisComponentDummy({ component, position, scale, setTempTitle }) {
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const meshRef = useRef();
    const iconModel = icons[type] ? icons[type] : icons[0];

    useEffect(() => {
        if (component.constructor.name === 'VisComponent') {
            setType(component.type);
            setTitle(component.id);
            component.addIdChangedListener(setTitle);
        } else if (component.constructor.name === 'VisSnippet') {
            setType('specSnippet');
            setTitle(component.content);
        } else {
            setType(component.type);
            setTitle(component.title);
        }
        return () => {
            if (component.constructor.name === 'VisComponent') {
                component.removeIdChangedListener(setTitle);
            }
        }
    }, [component]);

    const selectStartHandler = (device, e) => {
        if (e) e.stopPropagation();
        const positionX = meshRef.current.matrixWorld.elements[12];
        const positionY = meshRef.current.matrixWorld.elements[13];
        const positionZ = meshRef.current.matrixWorld.elements[14];
        if (component.constructor.name === 'VisComponent' || component.constructor.name === 'VisSnippet') {
            CustomJSTrigger.trigger('instantiateVisComponent', {
                componentType: type,
                fragmentId: type === 'specSnippet' ? '' : title,
                content: type === 'specSnippet' ? title : '',
                snippetType: component.type || '',
                device: device,
                positionX: positionX,
                positionY: positionY,
                positionZ: positionZ
            });
        } else {
            CustomJSTrigger.trigger('instantiateVisualization', {
                visualizationType: type,
                device: device,
                positionX: positionX,
                positionY: positionY,
                positionZ: positionZ
            });
        }
    };

    const [hovered, setHovered] = useState(false);
    const hoverCallback = () => {
        setTempTitle(title);
        setHovered(true);
    };
    const blurCallback = () => {
        setTempTitle('');
        setHovered(false);
    };

    const icon = useMemo(() => <Icon theme={type + (hovered ? ':hovered' : '')} model={iconModel} />, [type, hovered]);

    return <group position={position} scale={scale}>
        <Interactive
            onHover={hoverCallback}
            onBlur={blurCallback}
            onSelectStart={() => selectStartHandler('controllerRight')}>
            <group ref={meshRef}
                onPointerOver={hoverCallback}
                onPointerOut={blurCallback}
                onPointerDown={(e) => selectStartHandler('camera', e)}>
                {icon}
            </group>
        </Interactive>
        <Text position={[0, 0.1, 0]} autoUpdateMatrix={false}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="black"
            outlineWidth="5%"
            outlineColor="white"
            fontSize={0.03}>
            {title.length > 15 ? title.slice(0, 15) + '...' : title}
        </Text>
    </group>;
}

function ShelfTypeSelector({ shelfType, position }) {
    const [type, setType] = useProperty('type');

    const [hovered, setHovered] = useState(false);
    const hoverCallback = () => {
        setHovered(true);
    };
    const blurCallback = () => {
        setHovered(false);
    };

    return <Interactive
        onHover={hoverCallback}
        onBlur={blurCallback}
        onSelect={() => setType(shelfType)}>
        <mesh geometry={defaultGraphBoxGeometry}
            material={hovered ? indicatorMaterials[shelfType + ':hovered'] : indicatorMaterials[shelfType]}
            scale={type == shelfType ? [0.06, 0.06, 0.06] : [0.05, 0.05, 0.05]}
            position={position}
            onPointerOver={hoverCallback}
            onPointerOut={blurCallback}
            onClick={() => setType(shelfType)}>
        </mesh>
    </Interactive>;
}

function SnippetParentSelector({ snippetParent, type, position, setTempSnippetTitle }) {
    const [hovered, setHovered] = useState(false);
    const [selectedParent, setSelectedParent] = useProperty('selectedParent');
    const indicatorMaterial = useMemo(() => hovered ? indicatorMaterials[type + ':hovered'] : indicatorMaterials[type], [type, hovered]);

    const hoverCallback = () => {
        setTempSnippetTitle(snippetParent);
        setHovered(true);
    };
    const blurCallback = () => {
        setTempSnippetTitle('');
        setHovered(false);
    };

    return <Interactive
        onHover={hoverCallback}
        onBlur={blurCallback}
        onSelect={() => setSelectedParent(snippetParent)}>
        <mesh geometry={defaultGraphBoxGeometry}
            material={indicatorMaterial}
            scale={selectedParent == snippetParent ? [0.06, 0.06, 0.06] : [0.05, 0.05, 0.05]}
            position={position}
            onPointerOver={hoverCallback}
            onPointerOut={blurCallback}
            onClick={() => setSelectedParent(snippetParent)}>
        </mesh>
    </Interactive>;
}

const matrixProvider = new THREE.Object3D();
export function VisShelf() {
    const [type] = useProperty('type');
    const [selectedParent] = useProperty('selectedParent');

    const [shelf] = useState([]);
    const [dummies, setDummies] = useState([]);
    const [snippetSelectors, setSnippetSelectors] = useState([]);

    const [tempTitle, setTempTitle] = useState('');
    const [tempSnippetTitle, setTempSnippetTitle] = useState('');

    const maxMeshes = 50;
    const boxRefs = useMemo(()=>{
        const instancer = new InstancedMesh(defaultShelfBoxGeometry, defaultShelfMaterial, maxMeshes);

        // Clean up matrices to avoid flicker on initial grow
        const m = new THREE.Matrix4();
        m.set( 0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0 );
        for (let i = 0; i < maxMeshes; i++){
            instancer.setMatrixAt(i, m);
        }
        return instancer;
    },[]);

    const updateShelves = (columns, rows)=>{
        if (!boxRefs) return;
        let count = 0;
        for (let i = 1; i < columns; i++) {
            matrixProvider.position.set(i * SHELF_WIDTH / columns, 0.5 * SHELF_HEIGHT-0.5*SHELF_BOARD_THICKNESS, 0);
            matrixProvider.scale.set(SHELF_BOARD_THICKNESS, SHELF_HEIGHT + SHELF_BOARD_THICKNESS, SHELF_DEPTH*0.95);
            matrixProvider.updateMatrix();
            boxRefs.setMatrixAt(count, matrixProvider.matrix)
            boxRefs.setColorAt(count, new THREE.Color(defaultShelfColor));
            count++;
        };
        for (let i = 1; i < rows; i++) {
            matrixProvider.position.set(0.5 * SHELF_WIDTH,  i * SHELF_HEIGHT / rows, 0);
            matrixProvider.scale.set(SHELF_WIDTH + SHELF_BOARD_THICKNESS, SHELF_BOARD_THICKNESS, SHELF_DEPTH*0.9);
            matrixProvider.updateMatrix();
            boxRefs.setMatrixAt(count, matrixProvider.matrix)
            boxRefs.setColorAt(count, new THREE.Color(defaultShelfColor));
            count++;
        };

        boxRefs.instanceMatrix.needsUpdate = true;
        if (boxRefs.instanceColor) boxRefs.instanceColor.needsUpdate = true;
        needsBoundingUpdates = true;
        boxRefs.count = count;
    };

    const updateShelfComponents = () => {
        let shelfComponents = [];
        switch (type) {
            case 'visualizations':
                shelfComponents = [
                    { type: 'vegaLite_2D', title: 'Vega-Lite 2D' },
                    { type: 'vegaLite_25D', title: 'Vega-Lite 2.5D' },
                    { type: 'optomancy', title: 'Optomancy' },
                    { type: 'd3', title: 'D3' }
                ];
                break;
            case 'spec':
                shelfComponents = getVegaLiteSpecComponents();
                break;
            case 'dataset':
                shelfComponents = getDatasetComponents();
                break;
            case 'd3Spec':
                shelfComponents = getD3SpecComponents();
                break;
            case 'specSnippet':
                const component = getVisComponentById(selectedParent);
                if (component) {
                    shelfComponents = getVisSnippetsFromComponent(component);
                } else {
                    shelfComponents = getVisSnippetsFromParent(selectedParent);
                }
                break;
            default:
                if (DEBUG) console.log('Unknown VisShelf type: ' + type);
        }

        const rows = Math.max(Math.ceil(Math.sqrt(shelfComponents.length)), 2);
        const columns = Math.max(Math.ceil(shelfComponents.length / rows), 2);
        updateShelves(columns, rows);
        setDummies(generateDummies(columns, rows, shelfComponents, setTempTitle));
    };

    const updateSnippetSelectors = () => {
        const newSnippetSelectors = [];

        let visComponents = getDatasetComponents();
        visComponents = visComponents.concat(getVegaLiteSpecComponents());

        const rows = 6;

        for (let i = 0; i < defaultVisSnippetTypes.length; i++) {
            const x = Math.floor(i / rows);
            const y = i % rows;
            newSnippetSelectors.push(<SnippetParentSelector
                setTempSnippetTitle={setTempSnippetTitle}
                snippetParent={defaultVisSnippetTypes[i]}
                type={'specSnippet'}
                key={i}
                position={[(x * 0.08) + SHELF_WIDTH + 0.05, (-y * 0.08) + SHELF_HEIGHT - 0.05, 0]}
            />);
        }

        for (let i = 0; i < visComponents.length; i++) {
            const component = visComponents[i];
            const index = i + defaultVisSnippetTypes.length;
            const x = Math.floor(index / rows);
            const y = index % rows;
            newSnippetSelectors.push(<SnippetParentSelector
                setTempSnippetTitle={setTempSnippetTitle}
                snippetParent={component.id}
                type={component.type}
                key={index}
                position={[(x * 0.08) + SHELF_WIDTH + 0.05, (-y * 0.08) + SHELF_HEIGHT - 0.05, 0]}
            />);

        }

        setSnippetSelectors(newSnippetSelectors);
    };

    useEffect(() => {
        updateShelfComponents();

        addVisComponentAddedListener(updateShelfComponents);
        addVisComponentRemovedListener(updateShelfComponents);
        if (type === 'specSnippet') {
            updateSnippetSelectors();
            addVisComponentAddedListener(updateSnippetSelectors);
            addVisComponentRemovedListener(updateSnippetSelectors);
        }
        return () => {
            removeVisComponentAddedListener(updateShelfComponents);
            removeVisComponentRemovedListener(updateShelfComponents);
            if (type === 'specSnippet') {
                removeVisComponentAddedListener(updateSnippetSelectors);
                removeVisComponentRemovedListener(updateSnippetSelectors);
            }
        };
    }, [type]);

    useEffect(() => {
        if (type === 'specSnippet') updateShelfComponents();

        const selectedParentComponent = getVisComponentById(selectedParent);
        if (selectedParentComponent) {
            selectedParentComponent.addContentChangedListener(updateShelfComponents);
        }
        return () => {
            if (selectedParentComponent) {
                selectedParentComponent.removeContentChangedListener(updateShelfComponents);
            }
        };
    }, [selectedParent]);

    // A bug in the Instancing component means we have to manually recompute the bounding box
    let needsBoundingUpdates = false;
    useFrame(() => {
        if (shelf && needsBoundingUpdates && boxRefs) {
            boxRefs.computeBoundingSphere();
            needsBoundingUpdates = false;
        }
    });

    const frame = dashSpaceMeshCache.load('bookshelf.glb');
    const handle = <HandleIcon theme="bookshelf" model={frame} />;

    const title = useMemo(() => {
        switch (type) {
            case 'visualizations': return 'Visualizations';
            case 'spec': return 'Vega-Lite Specs';
            case 'dataset': return 'Datasets';
            case 'd3Spec': return 'D3 Specs';
            case 'specSnippet': return 'Spec Snippet' + (selectedParent ? ' (' + selectedParent + ')' : '');
            default: return 'Unknown';
        }
    }, [type, selectedParent]);

    return <Movable handle={handle}>
        <group position={[-0.5 * SHELF_WIDTH, SHELF_BOARD_THICKNESS * 1.5, 0]}>
        <Text position={[0.5 * SHELF_WIDTH, SHELF_HEIGHT + 0.1, 0]}
                font={tempTitle ? "font-mono.woff" : null}
                autoUpdateMatrix={false}
                maxWidth={SHELF_WIDTH}
                textAlign="center"
                anchorX="center"
                anchorY="bottom"
                color="black"
                outlineWidth="5%"
                outlineColor="white"
                fontSize={0.03}>
                {tempTitle ? tempTitle : title}
            </Text>
            {type === 'specSnippet' ? <Text position={[SHELF_WIDTH + 0.025, SHELF_HEIGHT, 0]}
                font={tempSnippetTitle ? "font-mono.woff" : null}
                autoUpdateMatrix={false}
                textAlign="left"
                anchorX="left"
                anchorY="bottom"
                color="black"
                outlineWidth="5%"
                outlineColor="white"
                fontSize={0.03}>
                {tempSnippetTitle ? tempSnippetTitle : 'Snippet Categories'}
            </Text> : null}

            <ShelfTypeSelector shelfType='visualizations' position={[0.16 * SHELF_WIDTH, SHELF_HEIGHT + 0.05, 0]} />
            <ShelfTypeSelector shelfType='dataset' position={[0.33 * SHELF_WIDTH, SHELF_HEIGHT + 0.05, 0]} />
            <ShelfTypeSelector shelfType='spec' position={[0.5 * SHELF_WIDTH, SHELF_HEIGHT + 0.05, 0]} />
            <ShelfTypeSelector shelfType='d3Spec' position={[0.66 * SHELF_WIDTH, SHELF_HEIGHT + 0.05, 0]} />
            <ShelfTypeSelector shelfType='specSnippet' position={[0.83 * SHELF_WIDTH, SHELF_HEIGHT + 0.05, 0]} />

            {type === 'specSnippet' ? snippetSelectors : null}

            <primitive object={boxRefs} />
            {dummies}
        </group>
    </Movable>;
}

export function Trashcan() {
    const icon = dashSpaceMeshCache.load('trash.glb');
    const handle = <HandleIcon theme="trash" model={icon} />
    return <Movable handle={handle} />;
}
