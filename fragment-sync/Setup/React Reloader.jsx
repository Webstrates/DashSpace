import React from 'react';
import { createRoot } from 'react-dom/client';



// Automatically reload this view if certain other fragments change
const changeFragments = [
    '#components [data-type="text/javascript+babel"]',
    '#elements [data-type="text/javascript+babel"]'
];

// Start the app
async function render() {
    if (!window.cachedAppRoot) {
        let element = document.createElement('transient');
        document.body.appendChild(element);
        window.cachedAppRoot = createRoot(element);
    }

    let content = await Fragment.one('#components [name="App"]').require();
    window.cachedAppRoot.render(React.createElement(content.App));
};

let reloadTimer = null;
const reload = () => {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(async function reloadReact() {
        try {
            render();
        } catch (ex) {
            console.log(ex);
        }
    }, 1000);
};

changeFragments.forEach(frag => {
    let lookedUpFragments = Fragment.find(frag);
    lookedUpFragments.forEach((lookedUpFragment) => {
        lookedUpFragment.registerOnFragmentChangedHandler(() => {
            if (fragmentSelfReference.auto) {
                reload();
            }
        });
    });
});

reload();

VarvEngine.registerEventCallback('engineReloaded', () => {
    reload();
});
