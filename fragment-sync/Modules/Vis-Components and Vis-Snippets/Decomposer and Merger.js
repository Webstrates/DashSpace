const {
    VEGA_LITE_SPEC_COMPONENT_TYPE,
    DATASET_COMPONENT_TYPE,
    D3_SPEC_COMPONENT_TYPE
} = modules.visComponentManager;



const decomposeComponent = (component) => {
    if (component.type === DATASET_COMPONENT_TYPE) {
        return decomposeDataset(component.getContentAsJSON());
    } else if (component.type === VEGA_LITE_SPEC_COMPONENT_TYPE) {
        return decomposeSpec(component.getContentAsJSON());
    } else {
        return [];
    }
};

const decomposeDataset = (dataset) => {
    const datasetDecomposition = [];

    const dataPoint = dataset[0];
    for (const field in dataPoint) {
        datasetDecomposition.push({
            type: 'encodingXField',
            content: JSON.stringify({ encoding: { x: { field: field } } })
        });
        datasetDecomposition.push({
            type: 'encodingYField',
            content: JSON.stringify({ encoding: { y: { field: field } } })
        });
        datasetDecomposition.push({
            type: 'encodingZField',
            content: JSON.stringify({ encoding: { z: { field: field } } })
        });
    }

    return datasetDecomposition;
};

const decomposeSpec = (spec) => {
    const specDecomposition = [];

    for (const key in spec) {
        switch (key) {
            case 'mark':
                // Only add non-primitive marks
                if (typeof spec.mark != 'string') {
                    specDecomposition.push({
                        type: 'mark',
                        content: JSON.stringify({ mark: spec.mark })
                    });
                }
                break;
            case 'encoding':
                for (const encodingKey in spec.encoding) {
                    specDecomposition.push({
                        type: `encoding${encodingKey.charAt(0).toUpperCase()}${encodingKey.slice(1)}Field`,
                        content: JSON.stringify({ encoding: { [encodingKey]: { field: spec.encoding[encodingKey].field } } })
                    });
                }
                break;
            case 'transform':
                for (let i = 0; i < spec.transform.length; i++) {
                    const transform = spec.transform[i];
                    for (const transformKey in transform) {
                        switch (transformKey) {
                            case 'filter':
                                specDecomposition.push({
                                    type: 'transformFilter',
                                    content: JSON.stringify(transform)
                                });
                                break;
                            // Add more transform types in the future ...
                            default:
                                // Ignore everything else (calculate, bin, aggregate, ...)
                                break;
                        }
                    }
                }
                break;
            default:
                // Ignore everything else ($schema, width, height, description, data, background, ...)
                break;
        }
    }

    return specDecomposition;
};

const mergeSpec = (componentsAndSnippets) => {
    let spec = {};

    for (let i = 0; i < componentsAndSnippets.length; i++) {
        const componentOrSnippet = componentsAndSnippets[i];
        if (componentOrSnippet.type === VEGA_LITE_SPEC_COMPONENT_TYPE) {
            Object.assign(spec, componentOrSnippet.getContentAsJSON());
        } else if (componentOrSnippet.type == DATASET_COMPONENT_TYPE) {
            spec.data = { values: componentOrSnippet.getContentAsJSON() };
        } else if (componentOrSnippet.type == D3_SPEC_COMPONENT_TYPE) {
            // Ignore
        } else {
            mergeSnippetIntoSpec(spec, { type: componentOrSnippet.type, content: componentOrSnippet.content });
        }
    }

    return spec;
};

const mergeSnippetIntoSpec = (spec, decomposite) => {
    const parsedContent = JSON.parse(decomposite.content);
    if (decomposite.type === 'mark') {
        spec.mark = parsedContent.mark;
    } else if (decomposite.type.startsWith('encoding')) {
        const encodingKey = Object.keys(parsedContent.encoding)[0];
        if (!spec.encoding) {
            spec.encoding = {};
        }
        if (!spec.encoding[encodingKey]) {
            spec.encoding[encodingKey] = {};
        }
        Object.assign(spec.encoding[encodingKey], parsedContent.encoding[encodingKey]);
    } else if (decomposite.type.startsWith('transform')) {
        if (!spec.transform) {
            spec.transform = [];
        }
        spec.transform.push(parsedContent);
    } else {
        console.warn(`mergeSnippetIntoSpec -> Unknown decomposite type: ${decomposite.type}`, spec, decomposite);
    }

    return spec;
};

const findD3Dataset = (componentsAndSnippets) => {
    let dataset = [];

    for (let i = 0; i < componentsAndSnippets.length; i++) {
        const componentOrSnippet = componentsAndSnippets[i];
        if (componentOrSnippet.type === DATASET_COMPONENT_TYPE) {
            dataset = componentOrSnippet.getContentAsJSON();
        }
    }

    return dataset;
};

const findD3Spec = (componentsAndSnippets) => {
    for (let i = 0; i < componentsAndSnippets.length; i++) {
        const componentOrSnippet = componentsAndSnippets[i];
        if (componentOrSnippet.type === D3_SPEC_COMPONENT_TYPE) {
            return componentOrSnippet;
        }
    }
    return null;
};



exports.decomposeComponent = decomposeComponent;
exports.decomposeDataset = decomposeDataset;
exports.decomposeSpec = decomposeSpec;

exports.mergeSpec = mergeSpec;
exports.findD3Dataset = findD3Dataset;
exports.findD3Spec = findD3Spec;
