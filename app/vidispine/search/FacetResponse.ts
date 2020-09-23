import FacetResponseTI from "./FacetResponse-ti";

import { createCheckers, VError } from "ts-interface-checker";

interface FacetCountEntry {
  fieldValue: string;
  value: number;
}

//FIXME: we do not currently accomodate ranged facets, only count facets
interface FacetCountResponse {
  field: string;
  count: FacetCountEntry[];
}

const { FacetCountEntry, FacetCountResponse } = createCheckers(FacetResponseTI);

/**
 * validates that the given server response is indeed a facet response.
 * logs out an error and returns null if the data does not validate or returns a FacetCountResponse-typed object if it does
 * @param response the data to check
 */
function validateFacetResponse(response: any): FacetCountResponse | null {
  try {
    FacetCountResponse.check(response);
    return response as FacetCountResponse;
  } catch (err) {
    if (err instanceof VError) {
      console.log(
        `Facet response for field ${response.field} failed to validate: ${err.message} at ${err.path}`
      );
      return null;
    } else {
      console.error(err);
      return null;
    }
  }
}

export type { FacetCountEntry, FacetCountResponse };

export { validateFacetResponse };
