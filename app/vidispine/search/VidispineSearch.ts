import VidispineSearchTI from "./VidispineSearch-ti";

import { createCheckers } from "ts-interface-checker";

interface SearchValueIF {
    value: string;
    noescape?: boolean;
    minimum?: number;
    maximum?: number;
    boost?: number;     //a float value
}

interface SearchFieldIF {
    name: string;
    value: SearchValueIF[];
}

interface SearchFieldGroupIF {
    name: string;
    field: SearchFieldIF[];
}

interface SearchOperatorIF {
    operation: string;
    field?: SearchFieldIF[];
    group?: SearchFieldGroupIF[];
    operator?: SearchOperatorIF[];
}

enum SearchOrderValue {
    ascending= "ascending",
    descending="descending"
}

interface SearchOrderIF {
    field: string;
    order: SearchOrderValue;
}

interface VidispineSearchDocIF {
    operator?: SearchOperatorIF;
    field?: SearchFieldIF[];
    group?: SearchFieldGroupIF[];
    sort?: SearchOrderIF[];
}

class VidispineSearchDoc implements VidispineSearchDocIF {
    operator?: SearchOperatorIF;
    field?: SearchFieldIF[];
    group?: SearchFieldGroupIF[];
    sort?: SearchOrderIF[];

    constructor(baseOperation?:string) {
        if (baseOperation) {
            this.operator = {operation: baseOperation, field: [], group: []}
        }
    }

    /**
     * see if we already have a matching field group definition for the given name and
     * return it if so. Otherwise returns undefined
     * @param groupName
     */
    findMatchingGroup(groupName:string) : SearchFieldGroupIF | undefined {
        if(this.operator) {
            const potentials = this.operator.group ? this.operator.group.filter(grp=>grp.name===groupName) : [];
            return potentials.length>0 ? potentials[0] : undefined;
        } else {
            const potentials = this.group ? this.group.filter(grp=>grp.name===groupName) : [];
            return potentials.length>0 ? potentials[0] : undefined;
        }
    }

    /**
     * adds a search term, optionally to the given group
     * @param fieldName field name to search for
     * @param values values to search for. These are combined with a logical OR
     * @param toGroup add to the given group, optional.
     * @return the VidispineSearchDoc, for chaining
     */
    addSearchTerm(fieldName: string, values: string[], toGroup?:string) {
        const newEl:SearchFieldIF = {
            name: fieldName,
            value: values.map((stringval)=>({value: stringval}))
        };

        let targetGroup:SearchFieldGroupIF|undefined;
        if(toGroup) {
            targetGroup = this.findMatchingGroup(toGroup);
        }
        if(targetGroup) {
            targetGroup.field = targetGroup.field.concat(newEl);
        } else {
            if(this.operator) {
                this.operator.field  = this.operator.field ? this.operator.field.concat(newEl) : [newEl];
            } else {
                this.field = this.field ? this.field.concat(newEl) : [newEl];
            }
        }
        return this;
    }

    /**
     * sets the ordering parameter in the document. Searches are un-ordered initially.
     * @param fieldName
     * @param direction
     * @return the VidispineSearchDoc, for chaining
     */
    setOrdering(fieldName: string, direction: SearchOrderValue) {
        this.sort = [
            {
                field: fieldName,
                order: direction
            }
        ];
        return this;
    }
}

export type {VidispineSearchDocIF};
export {SearchOrderValue};
export default VidispineSearchDoc;