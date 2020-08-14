import {
  VidispineField,
  VidispineFieldGroup,
} from "../../../app/vidispine/field-group/VidispineFieldGroup";
import fs from "fs";
import { StringRestriction } from "../../../app/vidispine/field-group/VidispineFieldGroup-ti";
import { VError } from "ts-interface-checker";

describe("VidispineFieldGroup", () => {
  it("GetField should look up the given field name", (done) => {
    fs.readFile(__dirname + "/example-field-group.json", (err, data) => {
      if (err) done.fail(err);

      try {
        const jsonContent = JSON.parse(data.toString());

        const fg = new VidispineFieldGroup(jsonContent);
        const maybeTestField = fg.getField("original_filename");

        expect(maybeTestField).toBeDefined();
        if (maybeTestField != undefined) {
          //necessary for the compiler
          expect(maybeTestField.name).toEqual("original_filename");
          expect(maybeTestField.origin).toEqual("VX");
          expect(maybeTestField.defaultValue).toEqual("");
          expect(maybeTestField.stringRestriction).toEqual({
            minLength: 0,
            maxLength: 32768,
          });
        }
        done();
      } catch (error) {
        done.fail(error);
      }
    });
  });

  it("GetField should return undefined if the field does not exist", (done) => {
    fs.readFile(__dirname + "/example-field-group.json", (err, data) => {
      if (err) done.fail(err);

      try {
        const jsonContent = JSON.parse(data.toString());

        const fg = new VidispineFieldGroup(jsonContent);
        const maybeTestField = fg.getField("abafhbjkgdfbhjkdgfs");

        expect(maybeTestField).toBeUndefined();
        done();
      } catch (error) {
        done.fail(error);
      }
    });
  });

  it("should throw an exception if the source object is not to the correct spec", (done) => {
    const testdata = { something: "here", somethingelse: "there" };

    try {
      new VidispineFieldGroup(testdata);
      done.fail("no exception was raised");
    } catch (err) {
      if (!(err instanceof VError)) {
        console.error("incorrect exception was thrown", err);
        done.fail();
      }
      done();
    }
  });
});

describe("VidispineField", () => {
  it("GetDataValue should return a custom data value", () => {
    const sourcedata = {
      name: "testfield",
      schema: {
        min: 0,
        max: 1,
        name: "testfield",
      },
      type: "string",
      data: [
        {
          key: "firstkey",
          value: "firstvalue",
        },
        {
          key: "secondkey",
          value: "secondvalue",
        },
      ],
    };

    const field = new VidispineField(sourcedata);

    expect(field.getDataValue("secondkey")).toEqual("secondvalue");
    expect(field.getDataValue("fjsfdbsfdhjb")).toBeUndefined();
  });

  it("GetCustomData should return the parsed and validated extradata", () => {
    const sourcedata = {
      name: "testfield",
      schema: {
        min: 0,
        max: 1,
        name: "testfield",
      },
      type: "string",
      data: [
        {
          key: "firstkey",
          value: "firstvalue",
        },
        {
          key: "secondkey",
          value: "secondvalue",
        },
        {
          key: "extradata",
          value: `{"name":"Long field name","readonly":"true","type":"string"}`,
        },
      ],
    };

    const field = new VidispineField(sourcedata);
    const customdata = field.getCustomData();
    if (customdata != undefined) {
      expect(customdata.name).toEqual("Long field name");
      expect(customdata.readonly).toEqual("true");
      expect(customdata.type).toEqual("string");
    } else {
      throw "CustomData was undefined";
    }
  });
});
