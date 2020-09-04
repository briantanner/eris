"use strict";

const LRU = require('lru-cache');
/**
* Hold a bunch of something
* @extends LRU
* @prop {Class} baseObject The base class for all items
*/
class LRUCollection extends LRU {
    /**
    * Construct a Collection
    * @arg {Class} baseObject The base class for all items
    */
    constructor(baseObject) {
        super({
            max: 0,
            maxAge: 5 * 60 * 1000,
            updateAgeOnGet: true,
            stale: true
        });
        this.baseObject = baseObject;
    }

    get size() {
        return this.length; 
    }

    /**
    * Add an object
    * @arg {Object} obj The object data
    * @arg {String} obj.id The ID of the object
    * @arg {Class?} extra An extra parameter the constructor may need
    * @arg {Boolean} replace Whether to replace an existing object with the same ID
    * @arg {Boolean?} maxAge Overrides the default maxAge for the cache
    * @returns {Class} The existing or newly created object
    */
    add(obj, extra, replace, maxAge) {
        if(obj.id == null) {
            throw new Error("Missing object id");
        }
        const existing = this.get(obj.id);
        if(existing && !replace) {
            return existing;
        }
        if(!(obj instanceof this.baseObject || obj.constructor.name === this.baseObject.name)) {
            obj = new this.baseObject(obj, extra);
        }

        this.set(obj.id, obj, maxAge);

        return obj;
    }

    delete(key) {
        return this.del(key)
    }

    /**
    * Return the first object to make the function evaluate true
    * @arg {function} func A function that takes an object and returns true if it matches
    * @returns {Class?} The first matching object, or undefined if no match
    */
    find(func) {
        return this.values().find(func);
    }

    /**
    * Get a random object from the Collection
    * @returns {Class?} The random object, or undefined if there is no match
    */
    random() {
        const index = Math.floor(Math.random() * this.size);
        return this.values()[index];
    }

    /**
    * Return all the objects that make the function evaluate true
    * @arg {function} func A function that takes an object and returns true if it matches
    * @returns {Array<Class>} An array containing all the objects that matched
    */
    filter(func) {
        return this.values().filter(func);
    }

    /**
    * Return an array with the results of applying the given function to each element
    * @arg {function} func A function that takes an object and returns something
    * @returns {Array} An array containing the results
    */
    map(func) {
        return this.values().map(func);
    }

    /**
     * Returns a value resulting from applying a function to every element of the collection
     * @arg {function} func A function that takes the previous value and the next item and returns a new value
     * @arg {any} [initialValue] The initial value passed to the function
     * @returns {any} The final result
     */
    reduce(func, initialValue) {
        return this.values().reduce(func, initialValue);
    }

    /**
     * Returns true if all elements satisfy the condition
     * @arg {function} func A function that takes an object and returns true or false
     * @returns {Boolean} Whether or not all elements satisfied the condition
     */
    every(func) {
        return this.values().every(func);
    }

    /**
     * Returns true if at least one element satisfies the condition
     * @arg {function} func A function that takes an object and returns true or false
     * @returns {Boolean} Whether or not at least one element satisfied the condition
     */
    some(func) {
        return this.values().some(func);
    }

    /**
    * Update an object
    * @arg {Object} obj The updated object data
    * @arg {String} obj.id The ID of the object
    * @arg {Class?} extra An extra parameter the constructor may need
    * @arg {Boolean} replace Whether to replace an existing object with the same ID
    * @returns {Class} The updated object
    */
    update(obj, extra, replace) {
        if(!obj.id && obj.id !== 0) {
            throw new Error("Missing object id");
        }
        const item = this.peek(obj.id);
        if(!item) {
            return this.add(obj, extra, replace);
        }
        item.update(obj, extra);
        return item;
    }

    /**
    * Remove an object
    * @arg {Object} obj The object
    * @arg {String} obj.id The ID of the object
    * @returns {Class?} The removed object, or null if nothing was removed
    */
    remove(obj) {
        const item = this.get(obj.id);
        if(!item) {
            return null;
        }
        this.delete(obj.id);
        return item;
    }

    toString() {
        return `[LRUCollection<${this.baseObject.name}>]`;
    }

    toJSON() {
        const json = {};
        for(const item of this.values()) {
            json[item.id] = item;
        }
        return json;
    }
}

module.exports = LRUCollection;
