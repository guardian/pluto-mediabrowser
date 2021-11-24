import {BreakDownQueryString} from "../../app/Embeddable/QueryString";

describe("QueryString.BreakDownQueryString", ()=>{
    it("should convert a full query string to a map", ()=>{
        const result = BreakDownQueryString("?param1=val1&key2=val2");
        expect(result.size).toEqual(2);
        expect(result.get("param1")).toEqual("val1");
        expect(result.get("key2")).toEqual("val2");
    })
})