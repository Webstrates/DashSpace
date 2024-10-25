const {
    VEGA_LITE_SPEC_COMPONENT_TYPE,
    DATASET_COMPONENT_TYPE,
    getVisComponents,
    getVisComponentById,
    addVisComponentAddedListener,
    addVisComponentRemovedListener,
    createVegaLiteSpecVisComponent
} = modules.visComponentManager;
const {
    decomposeComponent,
    mergeSpec
} = modules.decomposerMerger;



const DEFAULT_MARKS = 'default_marks';
const DEFAULT_ENCODING_TYPES = 'default_encoding_types';

const createStringHash = (string) => {
    return crypto.subtle.digest('SHA-1', new TextEncoder().encode(string)).then(hashBuffer => {
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    });
}



class VisSnippet {
    constructor(parent, type, content) {
        this.uuid = crypto.randomUUID();
        this.parent = parent;
        this.content = content;
        this.type = type;

        createStringHash(content).then(hash => { this.hash = hash; });
    }
}

class VisSnippetManager {
    constructor() {
        this.visComponents = new Map();
        this.visSnippets = new Map();
        this.addedListeners = [];
        this.removedListeners = [];

        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'bar' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'circle' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'square' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'tick' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'line' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'area' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'point' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'rule' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'geoshape' }) });
        this.addVisSnippet(DEFAULT_MARKS, { type: 'mark', content: JSON.stringify({ mark: 'text' }) });

        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingXType', content: JSON.stringify({ encoding: { x: { type: 'quantitative' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingXType', content: JSON.stringify({ encoding: { x: { type: 'ordinal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingXType', content: JSON.stringify({ encoding: { x: { type: 'nominal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingXType', content: JSON.stringify({ encoding: { x: { type: 'temporal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { y: { type: 'quantitative' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { y: { type: 'ordinal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { y: { type: 'nominal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { y: { type: 'temporal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { z: { type: 'quantitative' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { z: { type: 'ordinal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { z: { type: 'nominal' } } }) });
        this.addVisSnippet(DEFAULT_ENCODING_TYPES, { type: 'encodingYType', content: JSON.stringify({ encoding: { z: { type: 'temporal' } } }) });

        // Add more default snippets in the future ...
    }



    addVisSnippet(parent, componentComposite) {
        const visSnippet = new VisSnippet(parent, componentComposite.type, componentComposite.content);
        this.visSnippets.set(visSnippet.uuid, visSnippet);
        this._visSnippetAdded(visSnippet);
        return visSnippet;
    }

    addVisSnippetsFromComponent(visComponent) {
        if (visComponent.type != VEGA_LITE_SPEC_COMPONENT_TYPE && visComponent.type != DATASET_COMPONENT_TYPE) {
            return [];
        } else if (this.visComponents.has(visComponent.uuid)) {
            return this.updateVisSnippetsFromComponent(visComponent);
        } else {
            this.visComponents.set(visComponent.uuid, visComponent);
            visComponent.addContentChangedListener(() => { this.updateVisSnippetsFromComponent(visComponent); });
            return this.generateVisSnippetsFromComponent(visComponent);
        }
    }

    updateVisSnippetsFromComponent(visComponent) {
        this.removeVisSnippetsFromComponent(visComponent);
        return this.generateVisSnippetsFromComponent(visComponent);
    }

    generateVisSnippetsFromComponent(visComponent) {
        const visSnippets = [];
        const componentDecomposition = decomposeComponent(visComponent);
        for (const componentComposite of componentDecomposition) {
            const visSnippet = this.addVisSnippet(visComponent.uuid, componentComposite);
            visSnippets.push(visSnippet);
        }
        return visSnippets;
    }

    removeVisSnippetsFromComponent(visComponent) {
        this.visComponents.delete(visComponent.uuid);
        const visSnippets = this.getVisSnippetsFromComponent(visComponent);
        for (const visSnippet of visSnippets) {
            this.removeVisSnippet(visSnippet);
        }
    }
    removeVisSnippet(visSnippet) {
        this._visSnippetRemoved(visSnippet);
        this.visSnippets.delete(visSnippet.uuid);
    }



    getVisSnippet(uuid) {
        return this.visSnippets.get(uuid);
    }

    getVisSnippets() {
        return Array.from(this.visSnippets.values());
    }

    getUniqueVisSnippets() {
        const uniqueSnippets = new Map();
        for (const snippet of this.getVisSnippets()) {
            uniqueSnippets.set(snippet.hash, snippet);
        }
        return Array.from(uniqueSnippets.values());
    }

    getVisSnippetsFromComponent(visComponent) {
        return this.getVisSnippets().filter(snippet => snippet.parent === visComponent.uuid);
    }

    getVisSnippetsFromParent(parent) {
        return this.getVisSnippets().filter(snippet => snippet.parent === parent);
    }



    _visSnippetAdded(visSnippet) {
        this.addedListeners.forEach(listener => {
            listener(visSnippet);
        });
    }
    addVisSnippetAddedListener(listener) {
        this.addedListeners.push(listener);
    }
    removeVisSnippetAddedListener(listener) {
        const index = this.addedListeners.indexOf(listener);
        if (index > -1) {
            this.addedListeners.splice(index, 1);
        }
    }



    _visSnippetRemoved(visSnippet) {
        this.removedListeners.forEach(listener => {
            listener(visSnippet);
        });
    }

    addVisSnippetRemovedListener(listener) {
        this.removedListeners.push(listener);
    }

    removeVisSnippetRemovedListener(listener) {
        const index = this.removedListeners.indexOf(listener);
        if (index > -1) {
            this.removedListeners.splice(index, 1);
        }
    }
}



const visSnippetManager = new VisSnippetManager();
const visComponents = getVisComponents();
for (const visComponent of visComponents) {
    visSnippetManager.addVisSnippetsFromComponent(visComponent);
}
addVisComponentAddedListener(visComponent => { visSnippetManager.addVisSnippetsFromComponent(visComponent); });
addVisComponentRemovedListener(visComponent => { visSnippetManager.removeVisSnippetsFromComponent(visComponent); });



const generateSpecName = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `merged_${year}-${month}-${day}_${hour}-${minute}`;
};

const mergeComponentsInScene = (contexts, actionArguments) => {
    const sortedContexts = contexts.sort((a, b) => a.variables.positionY - b.variables.positionY);
    const components = sortedContexts.map(context => {
        if (context.variables.type === 'spec') {
            return getVisComponentById(context.variables.fragmentId);
        } else if (context.variables.type === 'specSnippet') {
            return new VisSnippet('temp', context.variables.snippetType, context.variables.content);
        } else {
            return null;
        }
    });

    const newSpec = mergeSpec(components);
    const component = createVegaLiteSpecVisComponent(JSON.stringify(newSpec, null, 4), generateSpecName());
    const newContexts = [contexts[0]];
    newContexts[0].variables.newFragmentId = component.id;

    return newContexts;
};
window.mergeComponentsInScene = mergeComponentsInScene;



exports.VisSnippet = VisSnippet;
exports.defaultVisSnippetTypes = [DEFAULT_MARKS, DEFAULT_ENCODING_TYPES];

exports.getVisSnippet = visSnippetManager.getVisSnippet.bind(visSnippetManager);
exports.getVisSnippets = visSnippetManager.getVisSnippets.bind(visSnippetManager);
exports.getUniqueVisSnippets = visSnippetManager.getUniqueVisSnippets.bind(visSnippetManager);
exports.getVisSnippetsFromComponent = visSnippetManager.getVisSnippetsFromComponent.bind(visSnippetManager);
exports.getVisSnippetsFromParent = visSnippetManager.getVisSnippetsFromParent.bind(visSnippetManager);

exports.addVisSnippetAddedListener = visSnippetManager.addVisSnippetAddedListener.bind(visSnippetManager);
exports.removeVisSnippetAddedListener = visSnippetManager.removeVisSnippetAddedListener.bind(visSnippetManager);
exports.addVisSnippetRemovedListener = visSnippetManager.addVisSnippetRemovedListener.bind(visSnippetManager);
exports.removeVisSnippetRemovedListener = visSnippetManager.removeVisSnippetRemovedListener.bind(visSnippetManager);

exports._manager = visSnippetManager;
