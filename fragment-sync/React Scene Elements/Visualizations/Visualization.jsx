import React from 'react';
const { useState, useEffect, useRef, useMemo } = React;

import { Line } from '@react-three/drei';

import { Varv, useProperty } from '#VarvReact';
import { Movable, useTransform } from '#elements [name="Movable"]';
import { VegaLite2DVisualization } from '#elements [name="VegaLite2DVisualization"]';
import { VegaLite25DVisualization } from '#elements [name="VegaLite25DVisualization"]';
import { OptomancyVisualization } from '#elements [name="OptomancyVisualization"]';
import { D3Visualization } from '#elements [name="D3Visualization"]';
import { HandleIcon, themes } from '#components [name="Icon"]';
const { getVisComponentById } = modules.visComponentManager;
const { VisSnippet } = modules.visSnippetManager;
const { mergeSpec, findD3Dataset, findD3Spec } = modules.decomposerMerger;



/**
 * Creates a line from the sourceTransform param to the transform of the currently selected Varv concept.
 */
function VisConnector({ sourceTransform }) {
    const [type] = useProperty('type');

    const color = useMemo(() => themes[type]?.line || 'black', [type]);

    const ourTransform = useTransform();
    const a = ourTransform.position;
    a[2] -= 0.01;
    const b = sourceTransform.position;
    b[1] -= 0.06;
    b[2] -= 0.01;

    return (a[0] != undefined && b[0] != undefined) ? <Line points={[...a, ...b]} color={color} lineWidth={3} /> : null;
}

/**
 * Fetches data from the Varv properties and updates the VisComponent with the new data.
 */
function VisDataFetcher({ onChanged }) {
    const [type] = useProperty('type');
    const [uuid] = useProperty('concept::uuid');
    const [positionY] = useProperty('positionY');

    const [fragmentId] = useProperty('fragmentId');
    const [snippetType] = useProperty('snippetType');
    const [content] = useProperty('content');

    const storedVisComponent = useRef();

    const updateVisComponent = (visComponent) => {
        if (visComponent) {
            storedVisComponent.current = visComponent;
            onChanged(uuid, visComponent, positionY);
        } else {
            console.warn('Could not find visComponent with fragment id ' + fragmentId);
            onChanged(uuid, null);
        }
    };

    useEffect(() => {
        if (type == 'spec' || type == 'dataset' || type == 'd3Spec') {
            const visComponent = getVisComponentById(fragmentId);
            visComponent.addContentChangedListener(updateVisComponent);
            updateVisComponent(visComponent);
        }

        return () => {
            if (type == 'spec' || type == 'dataset' || type == 'd3Spec') {
                const visComponent = getVisComponentById(fragmentId);
                visComponent.removeContentChangedListener(updateVisComponent);
            }
        };
    }, [fragmentId]);

    useEffect(() => {
        if (type == 'specSnippet') {
            if (snippetType && content) {
                const visSnippet = new VisSnippet('temp', snippetType, content);
                storedVisComponent.current = visSnippet;
                onChanged(uuid, visSnippet, positionY);
            } else {
                console.warn('Snippet is missing a type or content', uuid);
                onChanged(uuid, null);
            }
        }
    }, [content]);

    useEffect(() => {
        if (storedVisComponent.current) {
            onChanged(uuid, storedVisComponent.current, positionY);
        }
    }, [positionY]);

    // Also send a notification if this component is removed
    useEffect(() => {
        return () => {
            onChanged(uuid, null);
        }
    }, []);
}



export function Visualization() {
    const [reloadTimer, setReloadTimer] = useState();
    const transform = useTransform();
    const [type] = useProperty('type');
    const [visComponentUUIDs] = useProperty('visComponents');

    const visComponentMap = useRef(new Map());

    const [mergedSpec, setMergedSpec] = useState();
    const [d3Spec, setD3Spec] = useState();
    const [d3Dataset, setD3Dataset] = useState();

    // Custom icons based on type
    const icons = {
        'default': dashSpaceMeshCache.load('visualizations_2d.glb'),
        'vegaLite_25D': dashSpaceMeshCache.load('visualizations_25d.glb'),
        'optomancy': dashSpaceMeshCache.load('visualizations_3d.glb'),
        'd3': dashSpaceMeshCache.load('visualizations_d3.glb')
    };
    const icon = icons[type] ? icons[type] : icons.default;

    const updateData = () => {
        clearTimeout(reloadTimer);

        setReloadTimer(setTimeout(() => {
            if (!Array.isArray(visComponentUUIDs)) {
                console.warn('visComponents is not an array', visComponentUUIDs);
                return;
            }

            const visComponentsArrayWithHeightInfo = [];

            for (let i = 0; i < visComponentUUIDs.length; i++) {
                const mapEntry = visComponentMap.current.get(visComponentUUIDs[i]);
                if (mapEntry?.visComponent) {
                    visComponentsArrayWithHeightInfo.push(mapEntry);
                } else {
                    console.warn('Could not find visComponent with id ' + visComponentUUIDs[i]);
                }
            }

            visComponentsArrayWithHeightInfo.sort((a, b) => a.positionY - b.positionY);
            const visComponentsArray = visComponentsArrayWithHeightInfo.map((entry) => entry.visComponent);

            if (type == 'vegaLite_2D' || type == 'vegaLite_25D' || type == 'optomancy') {
                setMergedSpec(mergeSpec(visComponentsArray));
            } else if (type == 'd3') {
                setD3Spec(findD3Spec(visComponentsArray));
                setD3Dataset(findD3Dataset(visComponentsArray));
            } else {
                console.warn('Unknown visualization type', type);
            }
        }, 100));
    };

    const onChanged = (uuid, visComponent, positionY) => {
        if (visComponent) {
            visComponentMap.current.set(uuid, { visComponent: visComponent, positionY: positionY });
        } else {
            visComponentMap.current.delete(uuid);
        }
        updateData();
    };

    useEffect(() => {
        updateData();
    }, [type, visComponentUUIDs]);

    const [presentationMode] = useProperty('presentationMode');

    const handle = presentationMode ? null : <HandleIcon theme="visualization" model={icon} />;
    const graph = useMemo(() => {
        return <group name="visualization" position={[-0.25, 0.1, 0]} scale={0.5}>
            {type == 'vegaLite_2D' ? <VegaLite2DVisualization mergedSpec={mergedSpec} /> : null}
            {type == 'vegaLite_25D' ? <VegaLite25DVisualization mergedSpec={mergedSpec} /> : null}
            {type == 'optomancy' ? <OptomancyVisualization mergedSpec={mergedSpec} /> : null}
            {type == 'd3' ? <D3Visualization d3Spec={d3Spec} d3Dataset={d3Dataset} /> : null}
        </group>
    }, [mergedSpec, d3Dataset, type]);

    return <>
        <Varv property="visComponents">
            <VisDataFetcher onChanged={onChanged} />
            {presentationMode ? null : <VisConnector sourceTransform={transform} />}
        </Varv>
        <Movable transformRef={transform} handle={handle}>
            {graph}
        </Movable>
    </>;
}
