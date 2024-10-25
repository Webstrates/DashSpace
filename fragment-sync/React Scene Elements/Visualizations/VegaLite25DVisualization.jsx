import React from 'react';
const { useState, useEffect, useRef } = React;

import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
const { MeshStandardMaterial, BoxGeometry } = THREE;
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import embed from 'vega-embed';



const DEBUG = false;

const VIS_SIZE = 200;
const SCALE = 1 / VIS_SIZE;
const DEPTH = 0.02
const VIS_OFFSET = 0.001;

const metalnessValue = 0.4;
const roughnessValue = 0.5;
const defaultGraphMaterial = new MeshStandardMaterial({ metalness: metalnessValue, roughness: roughnessValue });
const defaultGraphBoxGeometry = new BoxGeometry();



// Helpers to get the sizes right
const getItemX = (item) => {
    return item.hasOwnProperty('x2') ? Math.min(item.x, item.x2) * SCALE : item.x * SCALE;
};
const getItemY = (item) => {
    return item.hasOwnProperty('y2') ? Math.min(item.y, item.y2) * SCALE : item.y * SCALE;
};

const getItemSize = (item) => {
    return item.hasOwnProperty('size') ? (item.size / 18) * SCALE : 0.0025;
};
const getItemWidth = (item) => {
    return item.hasOwnProperty('width') ? item.width * SCALE : getItemWidthBounds(item);
};
const getItemHeight = (item) => {
    return item.hasOwnProperty('height') ? item.height * SCALE : getItemHeightBounds(item);
};

const getItemWidthBounds = (item) => {
    return item.hasOwnProperty('x2') ? Math.abs(item.x2 - item.x) * SCALE : 0.0025;
};
const getItemHeightBounds = (item) => {
    return item.hasOwnProperty('y2') ? Math.abs(item.y2 - item.y) * SCALE : 0.0025;
};

const getLineLength = (item, nextItem) => {
    if (!nextItem) nextItem = item;
    return (Math.sqrt(Math.pow(nextItem.x - item.x, 2) + Math.pow(nextItem.y - item.y, 2)) * SCALE);
};
const getLineHeight = (item, nextItem) => {
    if (!nextItem) nextItem = item;
    const lineLength = getLineLength(item, nextItem);
    const rotationAngle = Math.atan2(nextItem.y - item.y, nextItem.x - item.x);
    return lineLength * Math.sin(rotationAngle);
};
const getLineWidth = (item, nextItem) => {
    if (!nextItem) nextItem = item;
    const lineLength = getLineLength(item, nextItem);
    const rotationAngle = Math.atan2(nextItem.y - item.y, nextItem.x - item.x);
    return lineLength * Math.cos(rotationAngle);
};
const getLineRotation = (item, nextItem) => {
    if (!nextItem) nextItem = item;
    return [0, 0, -Math.atan2(nextItem.y - item.y, nextItem.x - item.x)];
};



// Used for area drawings in Vega Lite
function Trapezoid({ points, depth, color }) {
    const [geometry, setGeometry] = useState();

    useEffect(() => {
        const allPoints = [
            ...points,
            [points[0][0], points[0][1], points[0][2] - depth],
            [points[1][0], points[1][1], points[1][2] - depth],
            [points[2][0], points[2][1], points[2][2] - depth],
            [points[3][0], points[3][1], points[3][2] - depth]
        ].map(point => new THREE.Vector3(...point));

        try {
            const newGeometry = new ConvexGeometry(allPoints);
            setGeometry(newGeometry);
        } catch (e) {
            console.error('Error creating trapezoid geometry', e);
        }
    }, [points, depth]);

    return <mesh geometry={geometry}>
        <meshStandardMaterial metalness={metalnessValue} roughness={roughnessValue} color={color} />
    </mesh>;
}

const collectBoxes = (items, state) => {
    let boxes = [];

    if (!items) return boxes;

    items.forEach((item) => {
        switch (item.marktype) {
            case 'rect':
                item.items.forEach((innerItem) => {
                    boxes.push({
                        color: innerItem.fill ? innerItem.fill : 'black',
                        scale: [getItemWidth(innerItem), getItemHeight(innerItem), DEPTH + VIS_OFFSET],
                        position: [state.position[0] + getItemX(innerItem) + (getItemWidth(innerItem) * 0.5), 1 - (state.position[1] + getItemY(innerItem) + (getItemHeight(innerItem) * 0.5)), -VIS_OFFSET]
                    })
                });
                break;
            case 'line':
                item.items.forEach((innerItem, index) => {
                    boxes.push({
                        color: innerItem.stroke ? innerItem.stroke : 'black',
                        scale: [getLineLength(innerItem, item.items[index + 1]), innerItem.strokeWidth * SCALE, DEPTH + VIS_OFFSET],
                        position: [state.position[0] + getItemX(innerItem) + (getLineWidth(innerItem, item.items[index + 1]) * 0.5), 1 - (state.position[1] + getItemY(innerItem) + getLineHeight(innerItem, item.items[index + 1]) * 0.5), -VIS_OFFSET],
                        rotation: getLineRotation(innerItem, item.items[index + 1])
                    })
                });
                break;
            case 'rule':
                item.items.forEach((innerItem) => {
                    boxes.push({
                        color: innerItem.stroke ? innerItem.stroke : 'black',
                        scale: [getItemWidth(innerItem), getItemHeight(innerItem), DEPTH],
                        position: [state.position[0] + getItemX(innerItem) + (getItemWidthBounds(innerItem) * 0.5), 1 - (state.position[1] + getItemY(innerItem) + (getItemHeightBounds(innerItem) * 0.5)), -VIS_OFFSET]
                    });
                });
                break;
            default:
                let newState = structuredClone(state);
                if (item.x) newState.position[0] += getItemX(item);
                if (item.y) newState.position[1] += getItemY(item);
                let childBoxes = collectBoxes(item.items, newState);
                boxes = [...boxes, ...childBoxes];
        }
    });

    return boxes;
};

const generateNonInstanced = (items, key) => {
    const itemComponents = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemKey = key + '.' + i;
        const marktype = item.marktype ? item.marktype : '';

        switch (marktype) {
            case '':
                let childComponents = [];
                let itemComponent;
                if (item.items) {
                    childComponents = generateNonInstanced(item.items, itemKey)
                }
                if (item.x && item.y) {
                    itemComponent = <group key={itemKey} position={[getItemX(item), 0 - getItemY(item), 0]}>{childComponents}</group>
                } else if (item.x) {
                    itemComponent = <group key={itemKey} position={[getItemX(item), 0, 0]}>{childComponents}</group>
                } else if (item.y) {
                    itemComponent = <group key={itemKey} position={[0, 0 - getItemY(item), 0]}>{childComponents}</group>
                } else {
                    itemComponent = <group key={itemKey}>{childComponents}</group>
                }
                if (childComponents.length > 0) {
                    itemComponents.push(itemComponent);
                }
                break;
            case 'arc':
                console.warn('Missing marktype:', marktype, item);
                break;
            case 'group':
                itemComponents.push(<group key={itemKey}>{generateNonInstanced(item.items, itemKey)}</group>);
                break;
            case 'image':
                console.warn('Missing marktype:', marktype, item);
                break;
            case 'path':
                console.warn('Missing marktype:', marktype, item);
                break;
            case 'area':
                const areas = item.items.map((innerItem, index) =>
                    <Trapezoid key={itemKey + '-' + index}
                        points={[
                            [
                                getItemX(innerItem),
                                1 - getItemY(innerItem) - getItemHeightBounds(innerItem),
                                VIS_OFFSET + (DEPTH / 2)
                            ],
                            [
                                getItemX(innerItem),
                                1 - getItemY(innerItem) + getItemHeight(innerItem) - getItemHeightBounds(innerItem),
                                VIS_OFFSET + (DEPTH / 2)
                            ],
                            [
                                getItemX(item.items[index + 1] || innerItem),
                                1 - getItemY(item.items[index + 1] || innerItem) + getItemHeight(item.items[index + 1] || innerItem) - getItemHeightBounds(item.items[index + 1] || innerItem),
                                VIS_OFFSET + (DEPTH / 2)
                            ],
                            [
                                getItemX(item.items[index + 1] || innerItem),
                                1 - getItemY(item.items[index + 1] || innerItem) - getItemHeightBounds(item.items[index + 1] || innerItem),
                                VIS_OFFSET + (DEPTH / 2)
                            ]
                        ]}
                        depth={DEPTH + VIS_OFFSET}
                        color={innerItem.fill ? innerItem.fill : 'black'} />
                );
                itemComponents.push(areas);
                break;
            case 'symbol':
                // This only does do spheres so far
                const symbols = item.items.map((innerItem, index) =>
                    <Sphere key={itemKey + '-' + index}
                        args={[getItemSize(innerItem)]}
                        position={[getItemX(innerItem) + (getItemSize(innerItem) * 0.5), 1 - (getItemY(innerItem) + (getItemSize(innerItem) * 0)), -VIS_OFFSET]}>
                        <meshStandardMaterial metalness={metalnessValue} roughness={roughnessValue} color={innerItem.stroke ? innerItem.stroke : innerItem.fill ? innerItem.fill : 'black'} />
                    </Sphere>
                );
                itemComponents.push(symbols);
                break;
            case 'trail':
                console.warn('Missing marktype:', marktype, item);
                break;
        }
    }

    return itemComponents;
};

const generateText = (items, key) => {
    const itemComponents = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemKey = key + '.' + i;
        const marktype = item.marktype ? item.marktype : '';

        switch (marktype) {
            case '':
                let childComponents = [];
                let itemComponent;
                if (item.items) {
                    childComponents = generateText(item.items, itemKey)
                }
                if (item.x && item.y) {
                    itemComponent = <group key={itemKey} position={[getItemX(item), 0 - getItemY(item), 0]}>{childComponents}</group>
                } else if (item.x) {
                    itemComponent = <group key={itemKey} position={[getItemX(item), 0, 0]}>{childComponents}</group>
                } else if (item.y) {
                    itemComponent = <group key={itemKey} position={[0, 0 - getItemY(item), 0]}>{childComponents}</group>
                } else {
                    itemComponent = <group key={itemKey}>{childComponents}</group>
                }
                if (childComponents.length > 0) {
                    itemComponents.push(itemComponent);
                }
                break;
            case 'group':
                itemComponents.push(<group key={itemKey}>{generateText(item.items, itemKey)}</group>);
                break;
            case 'text':
                const texts = item.items.map((innerItem, index) =>
                    <Text key={itemKey + '-' + index}
                        position={[getItemX(innerItem), 1 - getItemY(innerItem), -VIS_OFFSET]}
                        textAlign={innerItem.align ? innerItem.align : 'center'}
                        anchorX={innerItem.align ? innerItem.align : 'center'}
                        anchorY={innerItem.baseline ? innerItem.baseline : 'middle'}
                        color={innerItem.fill ? innerItem.fill : 'black'}
                        outlineWidth="2%"
                        outlineColor="white"
                        fontSize={innerItem.fontSize * SCALE}
                        rotation={[0, 0, innerItem.angle ? -(innerItem.angle / 180) * Math.PI : 0]}>
                        {innerItem.text ? innerItem.text : null}
                    </Text>);
                itemComponents.push(texts);
                break;
        }
    }

    return itemComponents;
};

/**
 * Turn Vega-based specs into 3D visualizations.
 */
const matrixProvider = new THREE.Object3D();
export function VegaLite25DVisualization({ mergedSpec }) {
    const [instancedMeshes, setInstancedMeshes] = useState([]);
    const [nonInstancedMeshes, setNonInstancedMeshes] = useState([]);
    const [textMeshes, setTextMeshes] = useState([]);
    const boxRefs = useRef();

    // When the mergedSpec changes, have Vega render it and convert to fiber when it is done
    useEffect(() => {
        if (mergedSpec) {
            if (DEBUG) console.log('Updating vega scene', mergedSpec);
            mergedSpec.width = VIS_SIZE;
            mergedSpec.height = VIS_SIZE;

            const temp = document.createElement('div');
            embed(temp, mergedSpec).then((result) => {
                setInstancedMeshes(collectBoxes(result.view._scenegraph.root.items, { position: [0, 0, 0], scale: [1, 1, 1], color: 'black' }));
                setNonInstancedMeshes(generateNonInstanced(result.view._scenegraph.root.items));
                setTextMeshes(generateText(result.view._scenegraph.root.items));
                result.finalize();
            });
        }
    }, [mergedSpec]);

    // A bug in the Instancing component means we have to manually recompute the bounding box
    let needsBoundingUpdates = false;
    useFrame(() => {
        if (instancedMeshes && needsBoundingUpdates) {
            boxRefs.current.computeBoundingSphere();
            needsBoundingUpdates = false;
        }
    });
    useEffect(() => {
        if (instancedMeshes) {
            for (let i = 0; i < instancedMeshes.length; i++) {
                let box = instancedMeshes[i];
                if (box.position) matrixProvider.position.set(box.position[0], box.position[1], box.position[2]);
                if (box.rotation) matrixProvider.rotation.set(box.rotation[0], box.rotation[1], box.rotation[2]);
                if (box.scale) matrixProvider.scale.set(box.scale[0], box.scale[1], box.scale[2]);
                matrixProvider.updateMatrix();
                boxRefs.current.setMatrixAt(i, matrixProvider.matrix)
                boxRefs.current.setColorAt(i, new THREE.Color(box.color));
            };
        }
        boxRefs.current.instanceMatrix.needsUpdate = true;
        if (boxRefs.current.instanceColor) boxRefs.current.instanceColor.needsUpdate = true;
        needsBoundingUpdates = true;
    }, [instancedMeshes]);

    return <group scale={0.5} position={[0.25, 0.1, 0]}>
        <instancedMesh ref={boxRefs} geometry={defaultGraphBoxGeometry} material={defaultGraphMaterial} args={[null, null, instancedMeshes ? instancedMeshes.length : 0]} />
        {nonInstancedMeshes}
        {textMeshes}
    </group>;
}
