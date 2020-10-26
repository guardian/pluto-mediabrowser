import {
  VidispineShape,
  VidispineShapeIF,
} from "../../../app/vidispine/shape/VidispineShape";
import fs from "fs";
import { VError } from "ts-interface-checker";

describe("VidispineShape", () => {
  it("should parse a correctly-formatted json and retrieve fields", (done) => {
    fs.readFile(__dirname + "/example-shape.json", (err, data) => {
      if (err) {
        done.fail(err);
      } else {
        try {
          const jsonContent = JSON.parse(data.toString());
          const shape = new VidispineShape(jsonContent);
          expect(shape.id).toEqual("VX-122");
          expect(shape.created).toEqual("2020-08-13T14:51:05.374+0000");
          expect(shape.essenceVersion).toEqual(0);
          expect(shape.tag).toEqual(["lowres"]);
          expect(shape.mimeType).toEqual(["video/mp4"]);
          expect(shape.containerComponent?.roundedTimeBase).toEqual(25);
          expect(shape.containerComponent?.dropFrame).toEqual(false);
          expect(shape.containerComponent?.timeCodeTimeBase).toEqual({
            numerator: 1,
            denominator: 25,
          });
          expect(shape.containerComponent?.file?.length).toEqual(1);
          if (shape.containerComponent?.file) {
            const file = shape.containerComponent.file[0];
            expect(file.id).toEqual("VX-630");
            expect(file.state).toEqual("CLOSED");
            expect(file.size).toEqual(23795037);
            expect(file.metadata).toEqual({});
          }
          expect(shape.videoComponent).toBeTruthy();
          expect(shape.videoComponent?.length).toEqual(1);
          expect(shape.audioComponent?.length).toEqual(1);
          done();
        } catch (err) {
          done.fail(err);
        }
      }
    });
  });

  it("should throw an exception for an incorrectly formatted document", (done) => {
    fs.readFile(__dirname + "/example-broken-shape.json", (err, data) => {
      if (err) {
        done.fail(err);
      } else {
        try {
          const jsonContent = JSON.parse(data.toString());
          const shape = new VidispineShape(jsonContent);

          done.fail("No exception was thrown, expected an error");
        } catch (err) {
          if (
            err instanceof VError &&
            err.message.includes("value.id is missing") //containerComponent should be shown here but not right now due to partial validations
          ) {
            done();
          } else {
            console.error(
              "Received unexpected error. Expected a VError containing a message that containerComponent.id is missing."
            );
            done.fail(err);
          }
        }
      }
    });
  });
});
