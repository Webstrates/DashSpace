class WebstrateClientAction extends Action {
    constructor(name, options, concept) {
        super(name, options, concept);
    }
    async apply(contexts, actionArguments) {
        const self = this;

        return this.forEachContext(contexts, actionArguments, async (context, options) => {
            let resultName = Action.defaultVariableName(self);

            if (options.as != null) {
                resultName = options.as;
            }

            Action.setVariable(context, resultName, webstrate.clientId);

            return context;
        });
    }
}
Action.registerPrimitiveAction('webstrateClient', WebstrateClientAction);
window.WebstrateClientAction = WebstrateClientAction;
