import { GetItems } from "../../../app/vidispine/item/VidispineItem";
import fs from "fs";

describe("VidispineItem", () => {
  it("should parse a correctly formatted item and retrieve fields from the root", (done) => {
    fs.readFile(__dirname + "/example-item.json", (err, data)=>{
        if(err) done.fail(err);

        const jsonContent = JSON.parse(data.toString());

        try {
            const vs_item_list = GetItems(jsonContent);
            expect(vs_item_list.length).toEqual(1);

            const vsitem = vs_item_list[0];
            expect(vsitem.getMetadataValues("__shape")).toEqual(["VX-7","VX-6","VX-8"]);
            expect(vsitem.getMetadataValues("shapeTag")).toEqual(["original","lowres","lowimage"]);
            expect(vsitem.getMetadataValues("mimeType")).toEqual(["image/jpeg"]);
            expect(vsitem.getMetadataValues("fdjfkssfhjsdf")).toEqual(undefined);

            done();
        } catch(err) {
            done.fail(err);
        }
    })
  });

});
