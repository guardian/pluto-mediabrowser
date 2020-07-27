import {validateAndDecode} from "../app/JwtHelpers.jsx";

describe("validateAndDecode", ()=>{
    it("should decode an example jwt", (done)=>{
        const exampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJqb2huX2RvZSIsImZhbWlseV9uYW1lIjoiRG9lIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.IfSuq8z7BL6DQIydiK5fEC85z9t_twQTQj0rfTpMXPA";
        //can get them from https://jwt.io/
        validateAndDecode(exampleToken, "your-256-bit-secret").then(decodedContent=>{
            expect(decodedContent.sub).toEqual('1234567890');
            expect(decodedContent.username).toEqual('john_doe');
            expect(decodedContent.family_name).toEqual("Doe");
            expect(decodedContent.first_name).toEqual("John");
            expect(decodedContent.iat).toEqual(1516239022);

            done();
        }).catch(err=>{
            console.error(err);
            done.fail(err);
        });
    });

    it("should reject if the jwt is not valid", (done)=>{
        const exampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJqb2huX2RvZSIsImZhbWlseV9uYW1lIjoiRG9lIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.IfSuq8z7BL6DQIydiK5fEC85z9t_twQTQj0rfTpMXPa";
        //can get them from https://jwt.io/
        validateAndDecode(exampleToken, "your-256-bit-secret").then(decodedContent=>{
            console.log(decodedContent);

            done.fail("expected invalid JWT to fail but it succeeded");
        }).catch(err=>{
            done();
        });
    })
})