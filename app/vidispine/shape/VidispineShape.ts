import VidispineShapeTI from "./VidispineShape-ti";
import { createCheckers } from "ts-interface-checker";
import {DataPair} from "../field-group/VidispineFieldGroup";
import {VidispineFile} from "./VidispineFile";

interface TimeBase {
    numerator: number
    denominator: number
}

interface SampleBasedTime {
    samples: number
    timeBase: TimeBase
}

interface VidispineShapeMediaInfo {
    //these first two are only applicable to video streams
    Format_Settings_GOP?: string
    Bit_Rate_Mode: string
    property: DataPair[]
}

interface WidthHeight {
    width: number
    height: number
}

interface HorizVert {
    horizontal: number
    vertical: number
}

interface VidispineContainerComponent {
    id: string
    duration?: SampleBasedTime
    format: string
    firstSMPTETimecode?: string
    startTimecode?: number
    startTimestamp?: SampleBasedTime
    roundedTimeBase?: number
    dropFrame?: boolean
    timeCodeTimeBase?: TimeBase
    mediaInfo?: VidispineShapeMediaInfo
    file?: VidispineFile[]
    metadata?: DataPair[]

}

interface VidispineAudioComponent {
    id: string
    channelCount: number
    channelLayout: number
    sampleFormat: string
    frameSize?: number
    mediaInfo?: VidispineShapeMediaInfo
    file: VidispineFile[]
    metadata?: DataPair[]
    codec?: string
    timeBase?: TimeBase
    itemTrack?: string
    essenceStreamId?: number
    bitrate?: number
    numberOfPackets?: number
    extradata?: string
    pid?: number
    duration?: SampleBasedTime,
    startTimestamp?: SampleBasedTime
}

interface VidispineVideoComponent {
    id: string
    resolution: WidthHeight
    pixelFormat?: string
    maxBFrames?: number
    pixelAspectRation?: HorizVert
    fieldOrder?: string
    codecTimeBase?: TimeBase
    averageFrameRate?: TimeBase
    realBaseFrameRate?: TimeBase
    displayWidth?: TimeBase
    displayHeight?: TimeBase
    max_packet_size?: number
    ticks_per_frame?: number
    bitDepth?: number
    bitsPerPixel?: number
    mediaInfo?: VidispineShapeMediaInfo
    file: VidispineFile[]
    metadata?: DataPair[]
    codec: string
    timeBase?: TimeBase
    itemTrack?: string
    essenceStreamId?: number
    bitrate?: number
    numberOfPackets?: number
    extradata?: string
    pid?: number
    duration?: SampleBasedTime
    profile?: number
    level?: number
    startTimestamp?: SampleBasedTime
}

interface VidispineShapeIF {
    id: string
    created: string
    essenceVersion: number
    tag: string[]
    mimeType: string[]
    containerComponent?: VidispineContainerComponent
    audioComponent?: VidispineAudioComponent[]
    videoComponent?: VidispineVideoComponent[]
}

const {
    VidispineShapeIF
} = createCheckers(VidispineShapeTI);

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
    id: string
    created: string
    essenceVersion: number
    tag: string[]
    mimeType: string[]
    containerComponent?: VidispineContainerComponent
    audioComponent?: VidispineAudioComponent[]
    videoComponent?: VidispineVideoComponent[]

    /**
     * construct from an untyped object (parsed from json).
     * raises an exception if the data does not validate against the object spec
     * @param sourceObject untyped parsed json to build from
     */
    constructor(sourceObject: any) {
        VidispineShapeIF.check(sourceObject)
        this.id = sourceObject.id
        this.created = sourceObject.created
        this.essenceVersion = sourceObject.essenceVersion
        this.tag = sourceObject.tag
        this.mimeType = sourceObject.mimeType
        this.containerComponent = sourceObject.containerComponent
        this.audioComponent = sourceObject.audioComponent
        this.videoComponent = sourceObject.videoComponent
    }

    /**
     * returns the first appropriate access URL for the given protocol
     * @param forProto the protocol you want, e.g. "file" or "http". "https" will match "http".
     * @returns either a URL string or undefined
     */
    getDefaultUri(forProto:string):string|undefined {
        if(this.containerComponent && this.containerComponent.file) {
            for(let entry of this.containerComponent.file) {
                for(let uri of entry.uri) {
                    if(uri.startsWith(forProto)) return uri;
                }
            }
        }
        return undefined;
    }


}

export type {VidispineShapeIF};
export {VidispineShape};