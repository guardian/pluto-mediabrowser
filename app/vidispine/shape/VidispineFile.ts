import VidispineFileTI from "./VidispineFile-ti";

import { createCheckers } from "ts-interface-checker";

interface VidispineFile {
  id: string;
  path: string;
  uri: string[];
  state: string;
  size: number;
  hash?: string;
  timestamp?: string;
  refreshFlag?: number;
  storage: string;
  metadata: any;
}

const { VidispineFile } = createCheckers(VidispineFileTI);

export type { VidispineFile };
export { VidispineFile as VidispineFileChecker };
