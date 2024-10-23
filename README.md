# DashSpace

<p align="center">
  <img src="docs/title.jpg" />
</p>


## About

DashSpace is a live collaborative platform for immersive and ubiquitous analytics. It builds on the Webstrates platform, including [Webstrates](https://www.webstrates.net/), [Codestrates](https://codestrates.projects.cavi.au.dk/), and [Varv](https://varv.projects.cavi.au.dk/). It uses [React Three Fiber](https://github.com/pmndrs/react-three-fiber/) and its [XR integration](https://github.com/pmndrs/xr) to render a 3D scene and utilize WebXR.


## Use

DashSpace can run on any Webstrates server. To setup your own Webstrates server see the [Webstrates documentation](https://webstrates.github.io/gettingstarted/installation.html).

To create an instance of DashSpace use the prototype ZIP file using the [HTTP API](https://webstrates.github.io/userguide/http-api.html) of Webstrates. The following link creates a copy on the public [demo.webstrates.net](https://demo.webstrates.net/) server:

> https://demo.webstrates.net/new?prototypeUrl=https://github.com/Webstrates/DashSpace/raw/main/prototypes/dash-space.zip

To create a copy on your own server replace the server address with your server:

```
https://your-webstrates-server.com/new?prototypeUrl=https://github.com/Webstrates/DashSpace/raw/main/prototypes/dash-space.zip
```

To overcome potential CORS issues, you can use a CDN:

```
https://your-webstrates-server.com/new?prototypeUrl=https://cdn.jsdelivr.net/gh/Webstrates/DashSpace@master/prototypes/dash-space.zip
```


## Documentation

Find the documentation in the [docs](docs) folder.


## Known Bugs and Limitations

DashSpace is a research prototype and as such not optimized for performance. Especially in scene with many elements the performance can drop on devices such as the Meta Quest 3.


## Attribution

DashSpace uses the following models from Sketchfab:

- [Quest 3](https://sketchfab.com/3d-models/quest-3-e5c334a9598c4e85bb182eebf15a2e32) by Redcodi
- [Action Camera - Low Poly](https://sketchfab.com/3d-models/action-camera-low-poly-b28bfbdfc62644beacf1e3c2c3423477) by xylvnking
- [Smartphone (Xperia Z Ultra) (School Project)](https://sketchfab.com/3d-models/smartphone-xperia-z-ultra-school-project-18a917d8619441b1ba46da856e43c43f) by Ole Gunnar Isager
