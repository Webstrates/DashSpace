// Put this before Varv fragments to avoid errors on load
const urlParams = new URLSearchParams(window.location.search);
const DISABLED = urlParams.get('dud') === 'true';
window.checkUserDevicesDisabled = (contexts) => {
    if (DISABLED) {
        throw new StopError('User devices are disabled.');
    } else {
        return contexts;
    }
};
