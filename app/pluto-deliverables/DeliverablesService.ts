import axios from "axios";
import { DenormalisedDeliverable } from "./DeliverablesTypes";

/**
 * Ask the Deliverables backend for a denormalised version of the deliverable with the given ID.
 * Returns a promise containing the requested data, or throws a string representing the error that occurred.
 * @param deliverableId deliverable ID to query
 * @return -  Promise containing the deliverable data
 */
async function GetDeliverableById(
  deliverableId: number
): Promise<DenormalisedDeliverable> {
  const response = await axios({
    url: `/api/asset/${deliverableId}`,
    baseURL: "/deliverables",
    validateStatus: (status) =>
      status === 200 || status == 404 || status == 503 || status == 502,
  });
  switch (response.status) {
    case 200:
      return response.data;
    case 404:
      throw "There are no other records of this deliverable in the system at the moment";
    case 502 || 503 || 504:
      throw "The deliverables service is not responding at the moment, please try again later";
    default:
      throw `Got an unexpected response ${response.status} from the deliverables service`;
  }
}

export { GetDeliverableById };
