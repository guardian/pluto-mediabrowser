import VidispineShapeTI from "./VidispineShape-ti";
import CustomDataTI from "../field-group/CustomData-ti";
import VidispineFileTI from "./VidispineFile-ti";
import { VidispineFileChecker } from "./VidispineFile";

import { createCheckers, VError } from "ts-interface-checker";
import { DataPair } from "../field-group/VidispineFieldGroup";
import { VidispineFile } from "./VidispineFile";
import omit from "lodash.omit";

interface TimeBase {
  numerator: number;
  denominator: number;
}

interface SampleBasedTime {
  samples: number;
  timeBase: TimeBase;
}

interface VidispineShapeMediaInfo {
  //these first two are only applicable to video streams
  Format_Settings_GOP?: string;
  Bit_Rate_Mode?: string;
  property: DataPair[];
}

interface WidthHeight {
  width: number;
  height: number;
}

interface HorizVert {
  horizontal: number;
  vertical: number;
}

interface VidispineContainerComponent {
  id: string;
  duration?: SampleBasedTime;
  format: string;
  firstSMPTETimecode?: string;
  startTimecode?: number;
  startTimestamp?: SampleBasedTime;
  roundedTimeBase?: number;
  dropFrame?: boolean;
  timeCodeTimeBase?: TimeBase;
  mediaInfo?: VidispineShapeMediaInfo;
  file?: VidispineFile[];
  metadata?: DataPair[];
}

interface VidispineAudioComponent {
  id: string;
  channelCount: number;
  channelLayout: number;
  sampleFormat: string;
  frameSize?: number;
  mediaInfo?: VidispineShapeMediaInfo;
  file: VidispineFile[];
  metadata?: DataPair[];
  codec?: string;
  timeBase?: TimeBase;
  itemTrack?: string;
  essenceStreamId?: number;
  bitrate?: number;
  numberOfPackets?: number;
  extradata?: string;
  pid?: number;
  duration?: SampleBasedTime;
  startTimestamp?: SampleBasedTime;
}

interface VidispineVideoComponent {
  id: string;
  resolution: WidthHeight;
  pixelFormat?: string;
  maxBFrames?: number;
  pixelAspectRation?: HorizVert;
  fieldOrder?: string;
  codecTimeBase?: TimeBase;
  averageFrameRate?: TimeBase;
  realBaseFrameRate?: TimeBase;
  displayWidth?: TimeBase;
  displayHeight?: TimeBase;
  max_packet_size?: number;
  ticks_per_frame?: number;
  bitDepth?: number;
  bitsPerPixel?: number;
  mediaInfo?: VidispineShapeMediaInfo;
  file: VidispineFile[];
  metadata?: DataPair[];
  codec: string;
  timeBase?: TimeBase;
  itemTrack?: string;
  essenceStreamId?: number;
  bitrate?: number;
  numberOfPackets?: number;
  extradata?: string;
  pid?: number;
  duration?: SampleBasedTime;
  profile?: number;
  level?: number;
  startTimestamp?: SampleBasedTime;
}

interface VidispineShapeIF {
  id: string;
  created: string;
  essenceVersion: number;
  tag: string[];
  mimeType: string[];
  containerComponent?: VidispineContainerComponent;
  audioComponent?: VidispineAudioComponent[];
  videoComponent?: VidispineVideoComponent[];
}

const {
  VidispineShapeIF,
  VidispineVideoComponent,
  VidispineAudioComponent,
  VidispineContainerComponent,
} = createCheckers(VidispineShapeTI, CustomDataTI, VidispineFileTI);

/**
 * Helper class that defines a number of useful methods for accessing the VidispineShape data
 * The most efficient way to get one of these, given a VidispineShapeIF object, is simply to cast it
 * (because VidispineShape implements VidispineShapeIF):
 * const shape = myshapedata as VidispineShape;
 *
 * Alternatively, you can use a constructor to validate the data on the way in:
 * const shape = new VidispineShape(uncheckedObject as any);
 */
class VidispineShape implements VidispineShapeIF {
  id: string;
  created: string;
  essenceVersion: number;
  tag: string[];
  mimeType: string[];
  containerComponent?: VidispineContainerComponent;
  audioComponent?: VidispineAudioComponent[];
  videoComponent?: VidispineVideoComponent[];

  /**
   * construct from an untyped object (parsed from json).
   * raises an exception if the data does not validate against the object spec
   * @param sourceObject untyped parsed json to build from
   * @param check if false then skip the data check (i.e. data has already been checked)
   */
  constructor(sourceObject: any, check = true) {
    const containerComponent =
      check && sourceObject.hasOwnProperty("containerComponent")
        ? this.validateContainerComponent(sourceObject.containerComponent)
        : sourceObject.containerComponent;
    const audioComponents =
      check && sourceObject.hasOwnProperty("audioComponent")
        ? this.validateAudioComponentList(sourceObject.audioComponent)
        : sourceObject.audioComponent;
    const videoComponents =
      check && sourceObject.hasOwnProperty("videoComponent")
        ? this.validateVideoComponentList(sourceObject.videoComponent)
        : sourceObject.videoComponent;

    const everythingElse = omit(sourceObject, [
      "containerComponent",
      "audioComponent",
      "videoComponent",
    ]);
    if (check) VidispineShapeIF.check(everythingElse);
    this.id = everythingElse.id;
    this.created = everythingElse.created;
    this.essenceVersion = everythingElse.essenceVersion;
    this.tag = everythingElse.tag;
    this.mimeType = everythingElse.mimeType;

    this.containerComponent = containerComponent;
    this.audioComponent = audioComponents;
    this.videoComponent = videoComponents;
  }

  validateFiles(sourceFileList: any[], parentPath: string): VidispineFile[] {
    if (sourceFileList === undefined || sourceFileList === null) {
      throw new VError(parentPath + ".file", "file list was not present");
    }

    return <VidispineFile[]>sourceFileList.filter((f: any) => {
      try {
        VidispineFileChecker.check(f);
        return true;
      } catch (e) {
        const displayFileId = f.hasOwnProperty("id") ? f.id : "no-id-present";
        console.warn(`File with id ${displayFileId} was not valid: ${e}`);
        return false;
      }
    });
  }

  /**
   * try to validate the given untyped object as a ContainerComponent.
   * files are validated individually and a non-confirming file will be omitted from the returned object.
   * this can mean a valid shape with zero files
   * if validation fails, throws a VError
   * @param sourceComponent untyped object to validate
   */
  validateContainerComponent(
    sourceComponent: any
  ): VidispineContainerComponent {
    if (sourceComponent === undefined || sourceComponent === null) {
      throw new VError("containerComponent", "no container component present");
    }

    const files = sourceComponent.hasOwnProperty("file")
      ? this.validateFiles(sourceComponent.file, "containerComponent")
      : undefined;
    const everythingElse = omit(sourceComponent, "file");
    VidispineContainerComponent.check(everythingElse);
    return <VidispineContainerComponent>(
      Object.assign(everythingElse, { file: files })
    );
  }

  validateAudioComponentList(
    sourceComponent: any[]
  ): VidispineAudioComponent[] {
    let i = 0;
    return sourceComponent
      .filter((component) => {
        try {
          //the object does not verify if the "file" key is absent so replace it with an empty one
          const everythingElse = Object.assign(omit(component, "file"), {
            file: [],
          });
          VidispineAudioComponent.check(everythingElse);
          return true;
        } catch (err) {
          console.warn(`Audio component ${i} did not validate: ${err}`);
          return false;
        }
      })
      .map((component) => {
        const files = component.hasOwnProperty("file")
          ? this.validateFiles(component.file, `audioComponent.${i}`)
          : undefined;
        i += 1;
        return <VidispineAudioComponent>(
          Object.assign(component, { file: files })
        );
      });
  }

  validateVideoComponentList(
    sourceComponent: any[]
  ): VidispineVideoComponent[] {
    let i = 0;
    return sourceComponent
      .filter((component) => {
        try {
          //the object does not verify if the "file" key is absent so replace it with an empty one
          const everythingElse = Object.assign(omit(component, "file"), {
            file: [],
          });
          VidispineVideoComponent.check(everythingElse);
          return true;
        } catch (err) {
          console.warn(`Video component ${i} did not validate: ${err}`);
          return false;
        }
      })
      .map((component) => {
        const files = component.hasOwnProperty("file")
          ? this.validateFiles(component.file, `audioComponent.${i}`)
          : undefined;
        i += 1;
        return <VidispineVideoComponent>(
          Object.assign(component, { file: files })
        );
      });
  }

  /**
   * returns the first appropriate access URL for the given protocol
   * @param forProto the protocol you want, e.g. "file" or "http". "https" will match "http".
   * @returns either a URL string or undefined
   */
  getDefaultUri(forProto: string): string | undefined {
    if (this.containerComponent && this.containerComponent.file) {
      for (let entry of this.containerComponent.file) {
        for (let uri of entry.uri) {
          if (uri.startsWith(forProto)) return uri;
        }
      }
    }
    return undefined;
  }
}

export type { VidispineShapeIF };
export { VidispineShape, VidispineShapeIF as VidispineShapeChecker };
