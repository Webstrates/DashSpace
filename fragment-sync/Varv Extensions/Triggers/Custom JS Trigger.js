class CustomJSTrigger extends Trigger {
    constructor(name, options, concept) {
        if (typeof options === 'string') {
            options = {
                type: options
            }
        }

        super(name, options, concept);

        if (!options || !options.type) {
            console.warn('CustomJSTrigger requires a type parameter.');
        }
    }

    enable() {
        const self = this;

        this.deleteTrigger = Trigger.registerTriggerEvent('customJSTrigger', async (contexts) => {
            if (contexts[0].variables.type != this.options.type) return;
            await Trigger.trigger(self.name, contexts);
        });
    }

    disable() {
        if (this.deleteTrigger != null) {
            this.deleteTrigger.delete();
        }
    }

    static trigger(type, payload) {
        const context = {
            variables: {
                type: type,
                ...payload
            },
            target: null,
            properties: null
        };
        Trigger.trigger('customJSTrigger', context);
    }

    static triggerWithTarget(type, target, payload) {
        const context = {
            variables: {
                type: type,
                ...payload
            },
            target: target,
            properties: null
        };
        Trigger.trigger('customJSTrigger', context);
    }
}
Trigger.registerTrigger('customJSTrigger', CustomJSTrigger);
window.CustomJSTrigger = CustomJSTrigger;
