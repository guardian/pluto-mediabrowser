import {VidispineFile} from "./VidispineFile";
import {DataPair} from "../field-group/VidispineFieldGroup";
import {Width}
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