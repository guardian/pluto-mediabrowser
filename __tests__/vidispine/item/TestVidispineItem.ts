import { GetItems } from "../../../app/vidispine/item/VidispineItem";
import fs from "fs";

describe("VidispineItem", () => {
  it("should parse a correctly formatted item and retrieve fields from the root", (done) => {
    fs.readFile(__dirname + "/example-item.json", (err, data) => {
      if (err) done.fail(err);

      const jsonContent = JSON.parse(data.toString());

      try {
        const vs_item_list = GetItems(jsonContent);
        expect(vs_item_list.length).toEqual(1);

        const vsitem = vs_item_list[0];
        expect(vsitem.getMetadataValues("__shape")).toEqual([
          "VX-157",
          "VX-156",
          "VX-158",
          "VX-155",
        ]);
        expect(vsitem.getMetadataValues("shapeTag")).toEqual([
          "original",
          "lowres",
        ]);
        expect(vsitem.getMetadataValues("mimeType")).toEqual([
          "video/quicktime",
        ]);
        expect(vsitem.getMetadataValues("fdjfkssfhjsdf")).toEqual(undefined);

        expect(vsitem.shape?.length).toEqual(3);
        expect(vsitem.shape?.map((s) => s.id)).toEqual([
          "VX-158",
          "VX-157",
          "VX-156",
        ]);

        done();
      } catch (err) {
        done.fail(err);
      }
    });
  });

  it("should parse an item with broken shape(s) and return an object omitting that shape", (done) => {
    fs.readFile(__dirname + "/example-item-broken-shape.json", (err, data) => {
      if (err) done.fail(err);

      const jsonContent = JSON.parse(data.toString());

      try {
        const vs_item_list = GetItems(jsonContent);
        expect(vs_item_list.length).toEqual(1);

        const vsitem = vs_item_list[0];
        expect(vsitem.getMetadataValues("__shape")).toEqual([
          "VX-157",
          "VX-156",
          "VX-158",
          "VX-155",
        ]);
        expect(vsitem.getMetadataValues("shapeTag")).toEqual([
          "original",
          "lowres",
        ]);
        expect(vsitem.getMetadataValues("mimeType")).toEqual([
          "video/quicktime",
        ]);
        expect(vsitem.getMetadataValues("fdjfkssfhjsdf")).toEqual(undefined);

        expect(vsitem.shape?.length).toEqual(2);
        expect(vsitem.shape?.map((s) => s.id)).toEqual(["VX-157", "VX-156"]);

        done();
      } catch (err) {
        done.fail(err);
      }
    });
  });
});
