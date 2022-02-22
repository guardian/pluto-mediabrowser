import React from "react";

interface MediaAtomToolContextType {
  baseUrl: string;
}

const MediaAtomToolContext = React.createContext<
  MediaAtomToolContextType | undefined
>(undefined);
export type { MediaAtomToolContextType };
export default MediaAtomToolContext;
