# Overview

The codebase of DashSpace, which can be accessed from within Cauldron in a DashSpace copy, is structured as follows:


## Varv Extensions

This folder includes multiple Varv actions and triggers that are used by DashSpace.


## Varv Concepts

This folder includes all Varv concept definitions used by DashSpace.


## Setup

This folder includes the `Modules Loader`, which sets up the JavaScript modules and registers them in the `window` object, and the `React Reloader`, which loads the React components and reloads them when there are code changes to them or the Varv runtime.


## Libs

This folder includes the Optomancy and Optomancy R3F libraries.


## Modules

This folder includes JavaScript modules that are loaded by the `Modules Loader` fragment. All of these modules are accessible from the `window.modules` object. Among others, they include managers for audio, video, and screen streaming, as well as managers for visualization components and snippets.


## Styles

This folder imports the embedded Inter font and loads all global styles.


## React Components

This folder includes basic and utility React components that are a core part of DashSpace.


## React Scene Elements

This folder includes React components that are used in the 3D scene of DashSpace. Basic components like sticky notes or the trashcan, but also visualizations components like snippets, visualizations, and the bookshelf.


## Datasets and Specs

This folder includes datasets and specifications (Vega-Lite, Optomancy, D3) that are available from the bookshelf within DashSpace. We include a small gallery of examples in the prototype. New datasets can be added using upload functionality.

Changing datasets or specs here, updates visualizations live in the scene.
