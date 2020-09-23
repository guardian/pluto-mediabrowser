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

interface SearchRange {
  start: string;
  end: string;
}

interface SearchFacet {
  count: boolean; //if true, return the raw counts of items for each field value. If false, use the ranges to group them.
  field: string;
  range?: SearchRange[]; //if count is false, range should be specified
}

interface VidispineSearchDocIF {
  operator?: SearchOperatorIF;
  field?: SearchFieldIF[];
  group?: SearchFieldGroupIF[];
  facet?: SearchFacet[];
  sort?: SearchOrderIF[];
}

class VidispineSearchDoc implements VidispineSearchDocIF {
  operator?: SearchOperatorIF;
  field?: SearchFieldIF[];
  group?: SearchFieldGroupIF[];
  sort?: SearchOrderIF[];
  facet?: SearchFacet[];

  /**
   * construct a new SearchDoc, optionally with an "operation" (and/or/not) at the base and a set of groups and fields within
   * those groups to search for
   * @param baseOperation
   * @param withGroups
   */
  constructor(
    baseOperation?: string,
    withFields?: Map<string, string[]>,
    withGroups?: Map<string, Map<string, string[]>>
  ) {
    let groupElList: SearchFieldGroupIF[] | undefined;
    let fieldElList: SearchFieldIF[] | undefined;

    if (withGroups) {
      groupElList = Array.from(withGroups, (elem) => ({
        name: elem[0],
        field: Array.from(elem[1], (fieldData) => ({
          name: fieldData[0],
          value: fieldData[1].map((stringVal) => ({
            value: stringVal,
          })),
        })),
      }));
    }

    if (withFields) {
      fieldElList = Array.from(withFields, (elem) => ({
        name: elem[0],
        value: elem[1].map((stringVal) => ({ value: stringVal })),
      }));
    }
    if (baseOperation) {
      this.operator = {
        operation: baseOperation,
        field: fieldElList ?? [],
        group: groupElList ?? [],
      };
    } else {
      this.group = groupElList ?? [];
      this.field = fieldElList ?? [];
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

  /**
   * finds the index in our group list of the given group, or alternatively creates a blank entry and returns it
   * @param groupName group name to find or create
   * @returns an array of the group reference [0] and the index [1]
   */
  findOrMakeMatchingGroupIndex(
    groupName: string
  ): [SearchFieldGroupIF, number] | undefined {
    let searchList: SearchFieldGroupIF[] | undefined;

    if (this.operator && this.operator.group) {
      searchList = this.operator.group;
    } else if (this.group) {
      searchList = this.group;
    }

    if (searchList) {
      for (let i = 0; i < searchList.length; ++i) {
        if (searchList[i].name === groupName) return [searchList[i], i];
      }
    }

    const willInsertIndex = this.group ? this.group.length : 0;
    this.group = this.group
      ? this.group.concat({ name: groupName, field: [] })
      : [{ name: groupName, field: [] }];
    return [this.group[willInsertIndex], willInsertIndex];
  }

  /**
   * adds a facet term to this search
   * @param field field to facet on
   * @param count whether to return raw counts or use range buckets
   * @param ranges if count=false, the range buckets to use
   * @return this object, for chaining
   */
  addFacet(field: string, count: boolean, ranges?: SearchRange[]) {
    const newEl: SearchFacet = {
      field: field,
      count: count,
      range: ranges,
    };

    this.facet = this.facet ? this.facet.concat(newEl) : [newEl];
    return this;
  }

  /**
   * returns a new VidispineSearchDoc with the given facet added
   * @param field field to facet on
   * @param count whether to return raw counts or use range buckets
   * @param ranges if count=false, the range buckets to use
   * @return new object with the contents of this one plus the new facet
   */
  withFacet(field: string, count: boolean, ranges?: SearchRange[]) {
    const newEl: SearchFacet = {
      field: field,
      count: count,
      range: ranges,
    };

    let newObject = Object.assign(new VidispineSearchDoc(), this);
    newObject.facet = newObject.facet ? newObject.facet.concat(newEl) : [newEl];
    return newObject;
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
      groupMatch = newObject.findOrMakeMatchingGroupIndex(toGroup);
      console.log("groupMatch", groupMatch);
    }

    //TODO: this needs a load of optimising, if we decide to keep it (not currently used)
    if (groupMatch) {
      const updatedGroupContent = groupMatch[0].field.concat(newEl);
      console.log("updatedGroupContent", updatedGroupContent);
      if (newObject.operator && newObject.operator.group) {
        newObject.operator.group[groupMatch[1]].field = updatedGroupContent;
      } else if (newObject.group) {
        console.log("adding to ", newObject.group[groupMatch[1]].field);
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
