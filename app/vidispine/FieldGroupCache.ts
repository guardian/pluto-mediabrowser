import {VidispineFieldGroup} from "./field-group/VidispineFieldGroup";

/**
 * object to cache vidispine field groups so we can load them once only at startup.
 *
 */
class FieldGroupCache {
    _content:Map<string,VidispineFieldGroup>;

    /**
     * construct a FieldGroupCache, optionally by adding to another one
     * @param existingData
     * @param groups
     */
    constructor(existingData:FieldGroupCache|undefined=undefined,...groups:VidispineFieldGroup[]) {
        if(existingData instanceof FieldGroupCache){
            this._content = existingData._content;
        } else {
            this._content = new Map();
        }

        groups.forEach(entry=>this._content.set(entry.name, entry));
    }

    /**
     * returns a new FieldGroupCache that contains the data of this one plus the group you're adding
     * @param g a VidispineFieldGroup instance to add to the cache
     * @return the new FieldGroupCache object
     */
    add(g:VidispineFieldGroup):FieldGroupCache {
        return new FieldGroupCache(this, g);
    }

    /**
     * gets a field from the cache
     * @param name
     */
    get(name:string) {
        return this._content.get(name);
    }

    /**
     * returns the number of groups cached
     */
    size() {
        return this._content.size;
    }
}

export default FieldGroupCache;