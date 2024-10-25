import React from 'react';
let { useState, useEffect, useRef, useMemo } = React;

import { ErrorBoundary } from 'react-error-boundary';

import { OptomancyR3F } from '#optomancy-r3f-lib';



const DEBUG = false;
const VIS_SIZE = 0.5;



export function OptomancyVisualization({ mergedSpec }) {
    const boundaryRef = useRef();
    const [config, setConfig] = useState({
        datasets: [],
        workspaces: []
    });

    useEffect(() => {
        if (DEBUG) console.log('OptomancyVisualization -> mergedSpec', mergedSpec);
        if (mergedSpec && mergedSpec.data) {
            const copiedSpec = Object.assign({}, mergedSpec);
            copiedSpec.data = null;
            copiedSpec.width = VIS_SIZE;
            copiedSpec.height = VIS_SIZE;
            copiedSpec.depth = VIS_SIZE;

            const config = {
                datasets: [
                    {
                        name: 'default_dataset',
                        values: mergedSpec.data.values,
                    }
                ],
                workspaces: [
                    {
                        data: 'default_dataset',
                        views: [copiedSpec]
                    }
                ]
            };
            if (DEBUG) console.log('OptomancyVisualization -> config', config);
            setConfig(config);
            if (boundaryRef.current) boundaryRef.current.resetErrorBoundary();
        } else {
            setConfig({
                datasets: [],
                workspaces: []
            });
        }
    }, [mergedSpec]);

    const visualization = useMemo(() => <OptomancyR3F config={config} options={{ theme: 'light', renderText: true }} />, [config]);

    return <ErrorBoundary ref={boundaryRef} fallback={null}>
        <group position={[0.5, -0.3, 0.75]}>
            {visualization}
        </group>
    </ErrorBoundary>;
}
