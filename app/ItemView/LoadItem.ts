import axios from "axios";
import { VidispineItem } from "../vidispine/item/VidispineItem";

/**
 * loads the given item info from Vidispine.
 * @param vidispineBaseUrl Vidispine base URL to load. Get this from VidispineContext.
 * @param itemId the item ID to load
 * @return Promise<VidispineItem> a Promise containing the VidispineItem, if successful. If unsuccessful the Promise fails and contains
 * a descriptive error string. If this string contains "retrying" then the request should be retried
 */
async function loadItemMeta(
  vidispineBaseUrl: string,
  itemId: string
): Promise<VidispineItem> {
  const targetUrl = `${vidispineBaseUrl}/API/item/${itemId}?content=metadata,shape,uri&methodType=AUTO`;
  console.debug("loading item data from ", targetUrl);
  try {
    const result = await axios.get(targetUrl, {
      headers: { Accept: "application/json" },
    });
    return new VidispineItem(result.data);
  } catch (err) {
    console.error("Could not load from ", targetUrl, ": ", err);

    if (err.response) {
      switch (err.response.status) {
        case 404:
          throw "The item does not exist.";
        case 400:
          throw "The item ID is not valid";
        case 503 | 502:
          throw "The server is not responding, retrying...";
        case 500:
          throw "There is a server problem, please report this to multimediatech@theguardian.com";
        default:
          console.error(err);
          throw "Unable to load the given item. Please refer to the console for more information.";
      }
    } else {
      console.error(err);
      throw "Unable to load the given item. Please refer to the console for more information.";
    }
  }
}

export { loadItemMeta };
