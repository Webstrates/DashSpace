import React from 'react';
import { Clone } from '@react-three/drei';

import { useProperty } from '#VarvReact';
import {
    SELECTED_COLOR_PRIMARY,
    SELECTED_COLOR_SECONDARY,
    HOVERED_SELECTED_COLOR_PRIMARY,
    HOVERED_SELECTED_COLOR_SECONDARY
} from '#elements [name="Movable"]';



export const themes = {
    '': { primary: 'rgb(255,0,255)', secondary: 'rgb(255,255,0)' },
    ':hovered': { primary: 'rgb(255,0,0)', secondary: 'rgb(255,0,0)' },
    ':selected': { primary: 'rgb(0,255,0)', secondary: 'rgb(255,0,0)' },
    ':selected:hovered': { primary: 'rgb(0,255,255)', secondary: 'rgb(255,0,0)' },

    'button': { primary: 'hsl(200, 18%, 50%)', secondary: 'hsl(198, 16%, 84%)' },
    'button:hovered': { primary: 'hsl(200, 18%, 60%)', secondary: 'hsl(198, 16%, 84%)' },
    'button:disabled': { primary: 'rgb(0,0,0)', secondary: 'rgb(0,0,0)' },
    'button:toggled': { primary: 'hsl(200, 18%, 50%)', secondary: 'hsl(47, 100%, 63%)' },
    'button:toggled:hovered': { primary: 'hsl(200, 18%, 60%)', secondary: 'hsl(47, 100%, 73%)' },

    'deleteButton': { primary: 'hsl(0, 73%, 40%)', secondary: 'hsl(4, 90%, 60%)' },
    'deleteButton:hovered': { primary: 'hsl(0, 73%, 50%)', secondary: 'hsl(4, 90%, 70%)' },

    'calibrationPoint': { primary: 'hsl(65, 100%, 40%)', secondary: 'hsl(200, 18%, 50%)' },
    'calibrationPoint:hovered': { primary: 'hsl(65, 100%, 60%)', secondary: 'hsl(200, 18%, 60%)' },

    'bookshelf': { primary: 'hsl(200, 18%, 50%)', secondary: 'hsl(198, 16%, 84%)' },
    'bookshelf:hovered': { primary: 'hsl(200, 18%, 80%)', secondary: 'hsl(198, 16%, 84%)' },
    'bookshelf:selected': { primary: SELECTED_COLOR_PRIMARY, secondary: SELECTED_COLOR_SECONDARY },
    'bookshelf:selected:hovered': { primary: HOVERED_SELECTED_COLOR_PRIMARY, secondary: HOVERED_SELECTED_COLOR_SECONDARY },

    'trash': { primary: 'hsl(0, 0%, 20%)', secondary: 'hsl(0, 0%, 60%)' },
    'trash:hovered': { primary: 'hsl(0, 0%, 50%)', secondary: 'hsl(0, 0%, 70%)' },
    'trash:selected': { primary: SELECTED_COLOR_PRIMARY, secondary: SELECTED_COLOR_SECONDARY },
    'trash:selected:hovered': { primary: HOVERED_SELECTED_COLOR_PRIMARY, secondary: HOVERED_SELECTED_COLOR_SECONDARY },

    'visualization': { primary: 'hsl(262, 52%, 50%)', secondary: 'hsl(291, 96%, 62%)' },
    'visualization:hovered': { primary: 'hsl(262, 52%, 80%)', secondary: 'hsl(291, 96%, 82%)' },
    'visualization:selected': { primary: SELECTED_COLOR_PRIMARY, secondary: SELECTED_COLOR_SECONDARY },
    'visualization:selected:hovered': { primary: HOVERED_SELECTED_COLOR_PRIMARY, secondary: HOVERED_SELECTED_COLOR_SECONDARY },

    'vegaLite_2D': { primary: 'hsl(262, 52%, 50%)', secondary: 'hsl(291, 96%, 62%)' },
    'vegaLite_2D:hovered': { primary: 'hsl(262, 52%, 80%)', secondary: 'hsl(291, 96%, 82%)' },
    'vegaLite_25D': { primary: 'hsl(262, 52%, 50%)', secondary: 'hsl(291, 96%, 62%)' },
    'vegaLite_25D:hovered': { primary: 'hsl(262, 52%, 80%)', secondary: 'hsl(291, 96%, 82%)' },
    'optomancy': { primary: 'hsl(262, 52%, 50%)', secondary: 'hsl(291, 96%, 62%)' },
    'optomancy:hovered': { primary: 'hsl(262, 52%, 80%)', secondary: 'hsl(291, 96%, 82%)' },
    'd3': { primary: 'hsl(262, 52%, 50%)', secondary: 'hsl(291, 96%, 62%)' },
    'd3:hovered': { primary: 'hsl(262, 52%, 80%)', secondary: 'hsl(291, 96%, 82%)' },

    'spec': { primary: 'hsl(199, 100%, 50%)', secondary: 'hsl(198, 100%, 75%)', line: 'hsl(199, 100%, 50%)' },
    'spec:hovered': { primary: 'hsl(199, 100%, 80%)', secondary: 'hsl(198, 100%, 85%)' },
    'spec:selected': { primary: SELECTED_COLOR_PRIMARY, secondary: SELECTED_COLOR_SECONDARY },
    'spec:selected:hovered': { primary: HOVERED_SELECTED_COLOR_PRIMARY, secondary: HOVERED_SELECTED_COLOR_SECONDARY },
    'd3Spec': { primary: 'hsl(174, 65%, 50%)', secondary: 'hsl(166, 100%, 70%)', line: 'hsl(174, 65%, 50%)' },
    'd3Spec:hovered': { primary: 'hsl(174, 65%, 80%)', secondary: 'hsl(166, 100%, 80%)' },
    'd3Spec:selected': { primary: SELECTED_COLOR_PRIMARY, secondary: SELECTED_COLOR_SECONDARY },
    'd3Spec:selected:hovered': { primary: HOVERED_SELECTED_COLOR_PRIMARY, secondary: HOVERED_SELECTED_COLOR_SECONDARY },
    'dataset': { primary: 'hsl(88, 50%, 50%)', secondary: 'hsl(93, 100%, 50%)', line: 'hsl(88, 50%, 50%)' },
    'dataset:hovered': { primary: 'hsl(88, 50%, 80%)', secondary: 'hsl(93, 100%, 60%)' },
    'dataset:selected': { primary: SELECTED_COLOR_PRIMARY, secondary: SELECTED_COLOR_SECONDARY },
    'dataset:selected:hovered': { primary: HOVERED_SELECTED_COLOR_PRIMARY, secondary: HOVERED_SELECTED_COLOR_SECONDARY },
    'specSnippet': { primary: 'hsl(45, 100%, 50%)', secondary: 'hsl(60, 100%, 50%)', line: 'hsl(45, 100%, 50%)' },
    'specSnippet:hovered': { primary: 'hsl(45, 100%, 80%)', secondary: 'hsl(60, 100%, 60%)' },
    'specSnippet:selected': { primary: SELECTED_COLOR_PRIMARY, secondary: SELECTED_COLOR_SECONDARY },
    'specSnippet:selected:hovered': { primary: HOVERED_SELECTED_COLOR_PRIMARY, secondary: HOVERED_SELECTED_COLOR_SECONDARY }
};



/**
 * Sugar wrapper for icons used inside movables that are selectable and hoverable.
 */
export function HandleIcon({ model, theme = '' }) {
    const [selected] = useProperty('selected');
    const [hovered] = useProperty('hovered');
    return <Icon theme={theme + (selected ? ':selected' : '') + (hovered ? ':hovered' : '')} model={model} />
}

export function Icon(props) {
    const { model, theme = '' } = props;
    if (model == null) return null;

    try {
        if (model.materials['Primary']) model.materials['Primary'].color.set(themes[theme].primary);
        if (model.materials['Secondary']) model.materials['Secondary'].color.set(themes[theme].secondary);
    } catch (ex) {
        console.log('Missing color for ' + theme);
    }

    return <group {...props}>
        <Clone object={model ? model.scene : null} deep={'materialsOnly'} />
    </group>;
}
