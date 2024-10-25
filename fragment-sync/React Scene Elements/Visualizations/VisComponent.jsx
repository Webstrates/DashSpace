import React from 'react';
const { useState, useEffect, useMemo } = React;

import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { Text, RenderTexture, OrthographicCamera } from '@react-three/drei';
import { MeshStandardMaterial, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { useProperty } from '#VarvReact';
import { transcribeAudio, sendGPTPrompt, getGPTContent } from '#helpers';
import { Movable } from '#elements [name="Movable"]';
import { HandleIcon, Icon } from "#components [name='Icon']";
const { getVisComponentById } = modules.visComponentManager;



const frameGeometry = new RoundedBoxGeometry(1, 1, 0.005, 1);
const frameMaterial = new MeshStandardMaterial({ color: 'hsl(200, 18%, 50%)', metalness: 0.5, roughness: 0.5 });



/**
 * A VisComponent corresponds to one of the building blocks used to feed
 * data into, or process data for, a Visualization.
 */
export function VisComponent() {
    const [type] = useProperty('type');
    const [fragmentId] = useProperty('fragmentId');
    const [content] = useProperty('content');

    const [title, setTitle] = useState();
    const [fullTitle, setFullTitle] = useState();
    const [contents, setContents] = useState();
    const [showContents, setShowContents] = useState(false);

    // Different icons based on type of fragment
    const icons = {
        'spec': dashSpaceMeshCache.load('components_specs.glb'),
        'dataset': dashSpaceMeshCache.load('components_dataset.glb'),
        'd3Spec': dashSpaceMeshCache.load('components_specs_d3.glb'),
        'specSnippet': dashSpaceMeshCache.load('components_snippets.glb')
    };
    const icon = icons[type] ? icons[type] : icons[0];

    const micIcon = useMemo(() => dashSpaceMeshCache.load('microphone.glb'), []);
    const [listening, setListening] = useState(false);
    const [micScale, setMicScale] = useState(new Vector3(0.5, 0.5, 0.5));

    useFrame((state, delta) => {
        const scaleSpeed = 3;
        const minScale = 0.4;
        const maxScale = 0.6;
        const targetScale = listening ? minScale + (maxScale - minScale) * (Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5) : 0.5;
        const newScale = micScale.clone().lerp(new Vector3(targetScale, targetScale, targetScale), scaleSpeed * delta);
        setMicScale(newScale);
    });

    // Speech transcription
    const speechToSpec = async (e) => {
        if (e) e.stopPropagation();
        if (type != 'spec') return;

        setListening(true);
        const text = await transcribeAudio(5000, false, () => { setListening(false); });
        const visComponent = getVisComponentById(fragmentId);
        const spec = visComponent.getContentRaw();
        const gptData = await sendGPTPrompt({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: `You help users to change their Vega Lite specifications. You are always only responding with the final updated Vega Spec.` },
                { role: 'user', content: `My current Vega-Lite spec is this: ${spec}` },
                { role: 'user', content: text }
            ],
            temperature: 0.05,
            max_tokens: 1000,
            response_format: { 'type': 'json_object' }
        });
        visComponent.fragment.raw = getGPTContent(gptData);
    };

    useEffect(() => {
        let newTitle = type == 'specSnippet' ? content : fragmentId;
        setFullTitle(newTitle);
        if (newTitle) {
            newTitle = newTitle.length > 15 ? newTitle.slice(0, 15) + '...' : newTitle;
            setTitle(newTitle);
        } else {
            setTitle('');
        }
    }, [type, content, fragmentId]);

    const setTrimmedContents = (newContents) => {
        // trim to maximum of 18 lines and each line to a maximum of 40 characters
        const lines = newContents.split('\n');
        const trimmedLines = lines.slice(0, 21).map(line => line.slice(0, 40));
        setContents(trimmedLines.join('\n'));
    };

    const contentChangedCallback = (visComponent) => {
        setTrimmedContents(visComponent.getContentRaw());
    };

    useEffect(() => {
        if (type == 'spec' || type == 'dataset' || type == 'd3Spec') {
            const visComponent = getVisComponentById(fragmentId);
            if (visComponent) {
                setTrimmedContents(visComponent.getContentRaw());
                visComponent.addContentChangedListener(contentChangedCallback);
            } else {
                console.warn('Could not find visComponent with id ' + fragmentId);
                setContents(null);
            }
        }

        return () => {
            if (type == 'spec' || type == 'dataset' || type == 'd3Spec') {
                const visComponent = getVisComponentById(fragmentId);
                if (visComponent) {
                    visComponent.removeContentChangedListener(contentChangedCallback);
                }
            }
        };
    }, [fragmentId]);

    useEffect(() => {
        if (type == 'specSnippet') {
            setTrimmedContents(content);
        }
    }, [content]);
    const handle = <HandleIcon theme={type} model={icon} />

    return <Movable handle={handle}>
        <Interactive onSelect={() => setShowContents(!showContents)}>
            <Text position={[0, -0.08, 0]} autoUpdateMatrix={false}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                color="black"
                outlineWidth="5%"
                outlineColor="white"
                fontSize={0.03}
                onClick={() => setShowContents(!showContents)}>
                {showContents ? fullTitle : title}
            </Text>
        </Interactive>

        {type === 'spec' ? <Interactive onSelectEnd={speechToSpec}>
            <Icon model={micIcon} rotation={[0, -Math.PI, 0]} scale={micScale} position={[0.08, -0.00, 0]} onClick={speechToSpec} />
        </Interactive> : null}

        {showContents && type != 'specSnippet' ? <>
            <mesh geometry={frameGeometry}
                material={frameMaterial}
                scale={[0.3, 0.3, 1]}
                position={[0, 0.25, -0.0026]}
                autoUpdateMatrix={false}>
            </mesh>
            <Text
                position={[-0.125, 0.135 + 0.25, 0]} autoUpdateMatrix={false}
                maxWidth={0.35}
                textAlign="left"
                anchorX="left"
                anchorY="top"
                color="white"
                font="font-mono.woff"
                fontSize={0.01}>
                {contents}
            </Text>
        </> : null}
    </Movable>;
}
