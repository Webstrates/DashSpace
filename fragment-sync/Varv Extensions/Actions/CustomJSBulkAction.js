class CustomJSBulkAction extends Action {
    constructor(name, options, concept) {
        if (typeof options === 'string') {
            options = {
                'functionName': options
            }
        }
        super(name, options, concept);
    }
    async apply(contexts, actionArguments) {
        const f = window[this.options.functionName];
        if (f == null) {
            throw new Error('"window.' + this.options.functionName + '" is not defined');
        }
        if (typeof f !== 'function') {
            throw new Error('"window.' + this.options.functionName + '" is not a function');
        }
        return await f(contexts, actionArguments);

    }
}
Action.registerPrimitiveAction('customJSBulk', CustomJSBulkAction);
window.CustomJSAction = CustomJSBulkAction;
