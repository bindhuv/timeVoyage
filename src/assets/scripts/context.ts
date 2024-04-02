/* Context */

const elementMap = new Map();

export default {
    set(element : any, key : any, context: any) {
        if (!elementMap.has(element)) {
            elementMap.set(element, new Map());
        }

        const contextMap = elementMap.get(element);

        // we only want one context per element 
        if (!contextMap.has(key) && contextMap.size !== 0) {
            return;
        }

        contextMap.set(key, context);
    },

    get(element: any, key: any) {
        if (elementMap.has(element)) {
            return elementMap.get(element).get(key) || null;
        }

        return null;
    },

    remove(element: any, key: any) {
        if (!elementMap.has(element)) {
            return;
        }

        const contextMap = elementMap.get(element);

        contextMap.delete(key);

        // free up element references if there are no context left for an element
        if (contextMap.size === 0) {
            elementMap.delete(element);
        }
    }
}