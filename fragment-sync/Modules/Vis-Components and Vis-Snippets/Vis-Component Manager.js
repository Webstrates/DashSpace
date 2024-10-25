const VEGA_LITE_SPEC_COMPONENT_TYPE = 'spec';
const DATASET_COMPONENT_TYPE = 'dataset';
const D3_SPEC_COMPONENT_TYPE = 'd3Spec';
const UNKNOWN_COMPONENT_TYPE = 'unknown';

const COMPONENT_CONTAINER_SELECTOR = '#vis-component-container';
const VEGA_LITE_SPEC_CONTAINER_SELECTOR = '#vega-lite-spec-container';
const DATASET_CONTAINER_SELECTOR = '#dataset-container';
const D3_SPEC_CONTAINER_SELECTOR = '#d3-spec-container';

const visComponentContainer = document.querySelector(COMPONENT_CONTAINER_SELECTOR);
const vegaLiteSpecContainer = document.querySelector(VEGA_LITE_SPEC_CONTAINER_SELECTOR);
const datasetContainer = document.querySelector(DATASET_CONTAINER_SELECTOR);
const d3SpecContainer = document.querySelector(D3_SPEC_CONTAINER_SELECTOR);



class VisComponent {
    constructor(fragmentElement) {
        if (!!fragmentElement.closest(VEGA_LITE_SPEC_CONTAINER_SELECTOR)) {
            this.type = VEGA_LITE_SPEC_COMPONENT_TYPE;
        } else if (!!fragmentElement.closest(DATASET_CONTAINER_SELECTOR)) {
            this.type = DATASET_COMPONENT_TYPE;
        } else if (!!fragmentElement.closest(D3_SPEC_CONTAINER_SELECTOR)) {
            this.type = D3_SPEC_COMPONENT_TYPE;
        } else {
            this.type = UNKNOWN_COMPONENT_TYPE;
        }
        this.fragmentElement = fragmentElement;
        this.fragment = Fragment.one(this.fragmentElement)
        this.id = this.fragmentElement.id;
        this.uuid = this.fragmentElement.getAttribute('transient-fragment-uuid');

        this.contentChangedListener = [];
        this.idChangedListener = [];

        this.fragmentChangedCallback = () => {
            this._contentChanged();
        };
        this.fragment.registerOnFragmentChangedHandler(this.fragmentChangedCallback);

        this.observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'id') {
                    this.id = this.fragmentElement.id;
                    this._idChanged();
                }
            }
        });

        this.observer.observe(this.fragmentElement, { attributes: true });
    }
    disconnect() {
        this.fragment.unRegisterOnFragmentChangedHandler(this.fragmentChangedCallback);
        this.observer.disconnect();
    }
    remove() {
        this.fragmentElement.remove();
    }

    getContentRaw() {
        return this.fragment.raw;
    }
    getContentAsJSON() {
        if (this.type === DATASET_COMPONENT_TYPE || this.type === VEGA_LITE_SPEC_COMPONENT_TYPE) {
            try {
                return JSON.parse(this.getContentRaw());
            } catch (e) {
                console.warn(`getContentAsJSON -> Failed to parse content as JSON: ${e.message}`);
                return this.type === DATASET_COMPONENT_TYPE ? [] : {};
            }
        } else {
            return null;
        }
    }

    _contentChanged() {
        this.contentChangedListener.forEach(listener => {
            listener(this);
        });
    }
    addContentChangedListener(listener) {
        this.contentChangedListener.push(listener);
    }
    removeContentChangedListener(listener) {
        const index = this.contentChangedListener.indexOf(listener);
        if (index > -1) {
            this.contentChangedListener.splice(index, 1);
        }
    }

    _idChanged() {
        this.idChangedListener.forEach(listener => {
            listener(this.id);
        });
    }
    addIdChangedListener(listener) {
        this.idChangedListener.push(listener);
    }
    removeIdChangedListener(listener) {
        const index = this.idChangedListener.indexOf(listener);
        if (index > -1) {
            this.idChangedListener.splice(index, 1);
        }
    }
}

class VisComponentManager {
    constructor() {
        this.visComponents = new Map();
        this.addedListeners = [];
        this.removedListeners = [];
    }

    addVisComponent(fragmentElement) {
        const visComponent = new VisComponent(fragmentElement);
        this.visComponents.set(visComponent.uuid, visComponent);
        this._visComponentAdded(visComponent);
        return visComponent;
    }
    removeVisComponent(fragmentElement) {
        const visComponent = this.visComponents.get(fragmentElement.getAttribute('transient-fragment-uuid'));
        visComponent.disconnect();
        this.visComponents.delete(visComponent.uuid);
        this._visComponentRemoved(visComponent);
    }

    getVisComponent(uuid) {
        return this.visComponents.get(uuid);
    }
    getVisComponentById(id) {
        for (const visComponent of this.visComponents.values()) {
            if (visComponent.id === id) {
                return visComponent;
            }
        }
        return null;
    }
    getVisComponents() {
        return Array.from(this.visComponents.values());
    }
    getVegaLiteSpecComponents() {
        return this.getVisComponents().filter(fragment => fragment.type === VEGA_LITE_SPEC_COMPONENT_TYPE);
    }
    getDatasetComponents() {
        return this.getVisComponents().filter(fragment => fragment.type === DATASET_COMPONENT_TYPE);
    }
    getD3SpecComponents() {
        return this.getVisComponents().filter(fragment => fragment.type === D3_SPEC_COMPONENT_TYPE);
    }

    _visComponentAdded(visComponent) {
        this.addedListeners.forEach(listener => {
            listener(visComponent);
        });
    }
    addVisComponentAddedListener(listener) {
        this.addedListeners.push(listener);
    }
    removeVisComponentAddedListener(listener) {
        const index = this.addedListeners.indexOf(listener);
        if (index > -1) {
            this.addedListeners.splice(index, 1);
        }
    }

    _visComponentRemoved(visComponent) {
        this.removedListeners.forEach(listener => {
            listener(visComponent);
        });
    }
    addVisComponentRemovedListener(listener) {
        this.removedListeners.push(listener);
    }
    removeVisComponentRemovedListener(listener) {
        const index = this.removedListeners.indexOf(listener);
        if (index > -1) {
            this.removedListeners.splice(index, 1);
        }
    }
}



const visComponentManager = new VisComponentManager();
cQuery(visComponentContainer).liveQuery('code-fragment', {
    'added': (fragmentElement) => {
        visComponentManager.addVisComponent(fragmentElement);
    },
    'removed': (fragmentElement) => {
        visComponentManager.removeVisComponent(fragmentElement);
    }
});

const createId = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
};
const createFragmentElement = (type, content = '', id = createId()) => {
    const dataType = type === D3_SPEC_COMPONENT_TYPE ? 'text/javascript' : 'application/json';
    const fragment = Fragment.create(dataType);
    fragment.raw = content;
    fragment.html[0].id = id;
    WPMv2.stripProtection(fragment.html[0]);

    return fragment.html[0];
};
const createVegaLiteSpecVisComponent = (content, id) => {
    const fragmentElement = createFragmentElement(VEGA_LITE_SPEC_COMPONENT_TYPE, content, id);
    vegaLiteSpecContainer.appendChild(fragmentElement);
    const visComponent = visComponentManager.addVisComponent(fragmentElement);
    return visComponent;
};
const createDatasetVisComponent = (content, id) => {
    const fragmentElement = createFragmentElement(DATASET_COMPONENT_TYPE, content, id);
    datasetContainer.appendChild(fragmentElement);
    const visComponent = visComponentManager.addVisComponent(fragmentElement);
    return visComponent;
};
const createD3SpecVisComponent = (content, id) => {
    const fragmentElement = createFragmentElement(D3_SPEC_COMPONENT_TYPE, content, id);
    d3SpecContainer.appendChild(fragmentElement);
    const visComponent = visComponentManager.addVisComponent(fragmentElement);
    return visComponent;
};



exports.VEGA_LITE_SPEC_COMPONENT_TYPE = VEGA_LITE_SPEC_COMPONENT_TYPE;
exports.DATASET_COMPONENT_TYPE = DATASET_COMPONENT_TYPE;
exports.D3_SPEC_COMPONENT_TYPE = D3_SPEC_COMPONENT_TYPE;

exports.COMPONENT_CONTAINER_SELECTOR = COMPONENT_CONTAINER_SELECTOR;
exports.VEGA_LITE_SPEC_CONTAINER_SELECTOR = VEGA_LITE_SPEC_CONTAINER_SELECTOR;
exports.DATASET_CONTAINER_SELECTOR = DATASET_CONTAINER_SELECTOR;
exports.D3_SPEC_CONTAINER_SELECTOR = D3_SPEC_CONTAINER_SELECTOR;

exports.VisComponent = VisComponent;

exports.createVegaLiteSpecVisComponent = createVegaLiteSpecVisComponent;
exports.createDatasetVisComponent = createDatasetVisComponent;
exports.createD3SpecVisComponent = createD3SpecVisComponent;

exports.getVisComponent = visComponentManager.getVisComponent.bind(visComponentManager);
exports.getVisComponentById = visComponentManager.getVisComponentById.bind(visComponentManager);

exports.getVisComponents = visComponentManager.getVisComponents.bind(visComponentManager);
exports.getVegaLiteSpecComponents = visComponentManager.getVegaLiteSpecComponents.bind(visComponentManager);
exports.getDatasetComponents = visComponentManager.getDatasetComponents.bind(visComponentManager);
exports.getD3SpecComponents = visComponentManager.getD3SpecComponents.bind(visComponentManager);

exports.addVisComponentAddedListener = visComponentManager.addVisComponentAddedListener.bind(visComponentManager);
exports.removeVisComponentAddedListener = visComponentManager.removeVisComponentAddedListener.bind(visComponentManager);
exports.addVisComponentRemovedListener = visComponentManager.addVisComponentRemovedListener.bind(visComponentManager);
exports.removeVisComponentRemovedListener = visComponentManager.removeVisComponentRemovedListener.bind(visComponentManager);

exports._manager = visComponentManager;
