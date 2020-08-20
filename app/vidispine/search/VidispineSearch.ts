import VidispineSearchTI from "./VidispineSearch-ti";

import { createCheckers } from "ts-interface-checker";
import { VidispineFieldGroup } from "../field-group/VidispineFieldGroup";

interface SearchValueIF {
  value: string;
  noescape?: boolean;
  minimum?: number;
  maximum?: number;
  boost?: number; //a float value
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
  ascending = "ascending",
  descending = "descending",
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

  constructor(baseOperation?: string) {
    if (baseOperation) {
      this.operator = { operation: baseOperation, field: [], group: [] };
    }
  }

  /**
   * see if we already have a matching field group definition for the given name and
   * return it if so. Otherwise returns undefined
   * @param groupName
   */
  findMatchingGroup(groupName: string): SearchFieldGroupIF | undefined {
    if (this.operator) {
      const potentials = this.operator.group
        ? this.operator.group.filter((grp) => grp.name === groupName)
        : [];
      return potentials.length > 0 ? potentials[0] : undefined;
    } else {
      const potentials = this.group
        ? this.group.filter((grp) => grp.name === groupName)
        : [];
      return potentials.length > 0 ? potentials[0] : undefined;
    }
  }

  findMatchingGroupIndex(
    groupName: string
  ): [SearchFieldGroupIF, number] | undefined {
    let searchList: SearchFieldGroupIF[];

    if (this.operator && this.operator.group) {
      searchList = this.operator.group;
    } else if (this.group) {
      searchList = this.group;
    } else {
      return undefined;
    }

    for (let i = 0; i < searchList.length; ++i) {
      if (searchList[i].name === groupName) return [searchList[i], i];
    }
    return undefined;
  }

  /**
   * returns a new VidispineSearchDoc with the given term added
   * @param fieldName field name to search for
   * @param values values to search for. These are combined with a logical OR
   * @param toGroup add to the given group, optional.
   * @return the VidispineSearchDoc, for chaining
   */
  withSearchTerm(fieldName: string, values: string[], toGroup?: string) {
    const newEl: SearchFieldIF = {
      name: fieldName,
      value: values.map((stringval) => ({ value: stringval })),
    };

    let newObject = Object.assign(new VidispineSearchDoc(), this);

    let groupMatch;
    if (toGroup) {
      groupMatch = this.findMatchingGroupIndex(toGroup);
    }

    //FIXME: this needs a load of optimising
    if (groupMatch) {
      const updatedGroupContent = groupMatch[0].field.concat(newEl);
      if (newObject.operator && newObject.operator.group) {
        newObject.operator.group[groupMatch[1]].field = updatedGroupContent;
      } else if (newObject.group) {
        newObject.group[groupMatch[1]].field = updatedGroupContent;
      } else {
        console.error(
          "Unexpected problem setting withSearchTerm, this indicates a code bug"
        );
        return this;
      }
    } else {
      if (newObject.operator) {
        newObject.operator.field = newObject.operator.field
          ? newObject.operator.field.concat(newEl)
          : [newEl];
      } else {
        newObject.field = newObject.field
          ? newObject.field.concat(newEl)
          : [newEl];
      }
    }
    return newObject;
  }

  /**
   * returns the values for the field in the given group. Implemented like this for direct
   * compatibility with VidispineItem in MetadataGroupView
   * @param fieldName
   * @param groupName
   */
  getMetadataValuesInGroup(
    fieldName: string,
    groupName: string
  ): string[] | undefined {
    const group = this.findMatchingGroup(groupName);
    if (group) {
      const fieldMatch = group.field.filter(
        (field) => field.name === fieldName
      );
      const allValues = fieldMatch.map((field) =>
        field.value.map((value) => value.value)
      );
      return ([] as string[]).concat(...allValues);
    } else {
      return undefined;
    }
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
        order: direction,
      },
    ];
    return this;
  }
}

export type { VidispineSearchDocIF };
export { SearchOrderValue };
export default VidispineSearchDoc;
