import VidispineFileTI from "./VidispineFile-ti";

import { createCheckers } from "ts-interface-checker";

interface VidispineFile {
  id: string;
  path: string;
  uri: string[];
  state: string;
  size: number;
  timestamp?: string;
  refreshFlag?: number;
  storage: string;
  metadata: any; //not sure about the format of this yet
}

const { VidispineFile } = createCheckers(VidispineFileTI);

export type { VidispineFile };
export { VidispineFile as VidispineFileChecker };
