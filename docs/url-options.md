# URL Options

It is possible to control two mechanism of DashSpace using URL parameters:

| Parameter | Default | Description                                                                                                    |
|-----------|---------|----------------------------------------------------------------------------------------------------------------|
| `lrs`     | `false` | When active, the WebXR session will use `local` instead of `local-floor` as its reference space.               |
| `dud`     | `false` | When active, disables user devices indicating the camera and controller positions of other users in the scene. |

For example, appending `?lrs=false&dud=true` to the URL will enable local reference space and disable user devices.
