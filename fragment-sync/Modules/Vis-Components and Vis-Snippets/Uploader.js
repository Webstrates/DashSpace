const {
    createVegaLiteSpecVisComponent,
    createDatasetVisComponent,
    createD3SpecVisComponent,
    VEGA_LITE_SPEC_COMPONENT_TYPE,
    DATASET_COMPONENT_TYPE,
    D3_SPEC_COMPONENT_TYPE
} = modules.visComponentManager;



const SPLIT_SPEC_AND_DATASET = true;



const hasEmbeddedDataset = (content) => {
    const spec = JSON.parse(content);
    return spec.data && spec.data.values && Array.isArray(spec.data.values);
};

const splitSpecAndDataset = (content) => {
    if (!hasEmbeddedDataset(content)) {
        return {
            spec: content,
            dataset: undefined
        };
    }

    const spec = JSON.parse(content);
    const dataset = spec.data;
    spec.data = undefined;

    return {
        spec: JSON.stringify(spec, null, 4),
        dataset: JSON.stringify(dataset, null, 4)
    };
};

const convertCSVtoJSON = (csv) => {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            const value = currentline[j];
            obj[headers[j]] = isNaN(value) ? value : parseFloat(value);
        }
        result.push(obj);
    }
    return JSON.stringify(result, null, 4);
};

const convertFileName = (fileName) => {
    return fileName.split('.').slice(0, -1).join('.').replace(/\s+/g, '_');
};

const handleUploadImage = (file) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const request = new XMLHttpRequest();
    request.open('POST', window.location.pathname);
    request.send(formData);

    return new Promise((resolve, reject) => {
        request.addEventListener('load', () => {
            const asset = JSON.parse(request.responseText);
            CustomJSTrigger.trigger('imageUploaded', { fileName: asset.fileName });
            resolve(asset);
        });
        request.addEventListener('error', (e) => {
            reject(new Error('Failed to upload image'));
        });
    });
};



const handleUploadFile = (file, type) => {
    const reader = new FileReader();
    if (file.type === 'application/json') {
        reader.onload = (e) => {
            const content = e.target.result;
            const id = convertFileName(file.name);
            if (type === VEGA_LITE_SPEC_COMPONENT_TYPE) {
                if (SPLIT_SPEC_AND_DATASET && hasEmbeddedDataset(content)) {
                    const { spec, dataset } = splitSpecAndDataset(content);
                    createVegaLiteSpecVisComponent(spec, id + '_spec');
                    createDatasetVisComponent(dataset, id + '_dataset');
                } else {
                    createVegaLiteSpecVisComponent(content, id);
                }
            } else if (type === DATASET_COMPONENT_TYPE) {
                createDatasetVisComponent(content, id);
            } else if (type === D3_SPEC_COMPONENT_TYPE) {
                alert('D3 specs need to be of type text/javascript.')
            }
        };
        reader.readAsText(file);
    } else if (file.type === 'text/csv') {
        reader.onload = (e) => {
            const content = e.target.result;
            const id = convertFileName(file.name);
            const dataset = convertCSVtoJSON(content);
            createDatasetVisComponent(dataset, id);
        };
        reader.readAsText(file);
    } else if (file.type === 'text/javascript') {
        reader.onload = (e) => {
            const content = e.target.result;
            const id = convertFileName(file.name);
            if (type === VEGA_LITE_SPEC_COMPONENT_TYPE) {
                alert('Vega-Lite specs need to be of type application/json.')
            } else if (type === DATASET_COMPONENT_TYPE) {
                alert('Datasets need to be of type application/json or text/csv.')
            } else if (type === D3_SPEC_COMPONENT_TYPE) {
                createD3SpecVisComponent(content, id);
            }
        };
        reader.readAsText(file);
    } else if (file.type === 'image/jpeg' || file.type === 'image/png') {
        handleUploadImage(file);
    } else {
        alert('File type not supported.');
    }
};



const activateDropZone = (element, type) => {
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('upload-drop-zone--over');
    });

    element.addEventListener('dragleave', () => {
        element.classList.remove('upload-drop-zone--over');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('upload-drop-zone--over');
        const files = e.dataTransfer.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            handleUploadFile(file, type);
        }
    });

    element.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = 'multiple';
        input.accept = type === VEGA_LITE_SPEC_COMPONENT_TYPE ? 'application/json' : type === DATASET_COMPONENT_TYPE ? 'application/json, text/csv' : type === D3_SPEC_COMPONENT_TYPE ? 'text/javascript' : 'image/jpeg, image/png';
        input.onchange = (e) => {
            for (let i = 0; i < e.target.files.length; i++) {
                handleUploadFile(e.target.files[i], type);
            }
        };
        input.click();
    });
};



cQuery(document.body).liveQuery('.upload-drop-zone', {
    'added': (element) => {
        if (element.id === 'vega-lite-spec-upload-drop-zone') {
            activateDropZone(element, VEGA_LITE_SPEC_COMPONENT_TYPE);
        } else if (element.id === 'dataset-upload-drop-zone') {
            activateDropZone(element, DATASET_COMPONENT_TYPE);
        } else if (element.id === 'd3-spec-upload-drop-zone') {
            activateDropZone(element, D3_SPEC_COMPONENT_TYPE);
        } else if (element.id === 'image-upload-drop-zone') {
            activateDropZone(element, 'image');
        }
    }
});
