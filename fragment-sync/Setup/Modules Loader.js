const modules = {};
window.modules = modules;

modules.streamManager = await Fragment.one('#stream-manager-module').require();
modules.screenStreams = await Fragment.one('#screen-streams-module').require();
modules.videoStreams = await Fragment.one('#video-streams-module').require();
modules.audioStreams = await Fragment.one('#audio-streams-module').require();

modules.visComponentManager = await Fragment.one('#vis-component-manager-module').require();
modules.decomposerMerger = await Fragment.one('#decomposer-merger-module').require();
modules.visSnippetManager = await Fragment.one('#vis-snippet-module').require();
modules.uploader = await Fragment.one('#uploader-module').require();

modules.screenshots = await Fragment.one('#screenshots-module').require();
