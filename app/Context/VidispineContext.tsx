import React from "react";
import FieldGroupCache from "../vidispine/FieldGroupCache";

interface VidispineContextType {
  baseUrl: string;
  fieldCache: FieldGroupCache;
}

const VidispineContext = React.createContext<VidispineContextType | undefined>(
  undefined
);
export type { VidispineContextType };

export default VidispineContext;
