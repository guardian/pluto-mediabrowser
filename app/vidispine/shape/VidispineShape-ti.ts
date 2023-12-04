/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const TimeBase = t.iface([], {
  numerator: "number",
  denominator: "number",
});

export const SampleBasedTime = t.iface([], {
  samples: "number",
  timeBase: "TimeBase",
});

export const VidispineShapeMediaInfo = t.iface([], {
  Format_Settings_GOP: t.opt("string"),
  Bit_Rate_Mode: t.opt("string"),
  property: t.array("DataPair"),
});

export const WidthHeight = t.iface([], {
  width: "number",
  height: "number",
});

export const HorizVert = t.iface([], {
  horizontal: "number",
  vertical: "number",
});

export const VidispineContainerComponent = t.iface([], {
  id: "string",
  duration: t.opt("SampleBasedTime"),
  format: "string",
  firstSMPTETimecode: t.opt("string"),
  startTimecode: t.opt("number"),
  startTimestamp: t.opt("SampleBasedTime"),
  roundedTimeBase: t.opt("number"),
  dropFrame: t.opt("boolean"),
  timeCodeTimeBase: t.opt("TimeBase"),
  mediaInfo: t.opt("VidispineShapeMediaInfo"),
  file: t.opt(t.array("VidispineFile")),
  metadata: t.opt(t.array("DataPair")),
});

export const VidispineAudioComponent = t.iface([], {
  id: "string",
  channelCount: "number",
  channelLayout: "number",
  sampleFormat: "string",
  frameSize: t.opt("number"),
  mediaInfo: t.opt("VidispineShapeMediaInfo"),
  file: t.array("VidispineFile"),
  metadata: t.opt(t.array("DataPair")),
  codec: t.opt("string"),
  timeBase: t.opt("TimeBase"),
  itemTrack: t.opt("string"),
  essenceStreamId: t.opt("number"),
  bitrate: t.opt("number"),
  numberOfPackets: t.opt("number"),
  extradata: t.opt("string"),
  pid: t.opt("number"),
  duration: t.opt("SampleBasedTime"),
  startTimestamp: t.opt("SampleBasedTime"),
});

export const VidispineVideoComponent = t.iface([], {
  id: "string",
  resolution: "WidthHeight",
  pixelFormat: t.opt("string"),
  maxBFrames: t.opt("number"),
  pixelAspectRation: t.opt("HorizVert"),
  fieldOrder: t.opt("string"),
  codecTimeBase: t.opt("TimeBase"),
  averageFrameRate: t.opt("TimeBase"),
  realBaseFrameRate: t.opt("TimeBase"),
  displayWidth: t.opt("TimeBase"),
  displayHeight: t.opt("TimeBase"),
  max_packet_size: t.opt("number"),
  ticks_per_frame: t.opt("number"),
  bitDepth: t.opt("number"),
  bitsPerPixel: t.opt("number"),
  mediaInfo: t.opt("VidispineShapeMediaInfo"),
  file: t.array("VidispineFile"),
  metadata: t.opt(t.array("DataPair")),
  codec: "string",
  timeBase: t.opt("TimeBase"),
  itemTrack: t.opt("string"),
  essenceStreamId: t.opt("number"),
  bitrate: t.opt("number"),
  numberOfPackets: t.opt("number"),
  extradata: t.opt("string"),
  pid: t.opt("number"),
  duration: t.opt("SampleBasedTime"),
  profile: t.opt("number"),
  level: t.opt("number"),
  startTimestamp: t.opt("SampleBasedTime"),
});

export const VidispineBinaryComponent = t.iface([], {
  file: t.array("VidispineFile"),
  id: "string",
  metadata: t.opt(t.array("DataPair")),
  length: t.opt("number"),
});

export const VidispineShapeIF = t.iface([], {
  id: "string",
  created: "string",
  essenceVersion: "number",
  tag: t.array("string"),
  mimeType: t.array("string"),
  containerComponent: t.opt("VidispineContainerComponent"),
  audioComponent: t.opt(t.array("VidispineAudioComponent")),
  videoComponent: t.opt(t.array("VidispineVideoComponent")),
  binaryComponent: t.opt(t.array("VidispineBinaryComponent")),
});

const exportedTypeSuite: t.ITypeSuite = {
  TimeBase,
  SampleBasedTime,
  VidispineShapeMediaInfo,
  WidthHeight,
  HorizVert,
  VidispineContainerComponent,
  VidispineAudioComponent,
  VidispineVideoComponent,
  VidispineBinaryComponent,
  VidispineShapeIF,
};
export default exportedTypeSuite;
