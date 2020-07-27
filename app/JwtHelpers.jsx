import jwt from "jsonwebtoken";

/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 */
function validateAndDecode(token, signingKey, refreshToken) {
    return new Promise((resolve, reject)=>{
        jwt.verify(token, signingKey, (err,decoded)=>{
            if(err){
                console.log("token: ", token);
                console.log("signingKey: ", signingKey);
                console.error("could not verify JWT: ", err);
                reject(err);
            }
            // console.log("decoded JWT");
            sessionStorage.setItem("adfs-test:token", token);    //it validates so save the token
            if(refreshToken) sessionStorage.setItem("adfs-test:refresh", refreshToken);
            resolve(decoded);
        });
    });
}

/**
 * gets the signing key from the server
 * @returns {Promise<string>} Raw content of the signing key in PEM format
 */
async function loadInSigningKey() {
    const result = await fetch("/meta/oauth/publickey.pem");
    switch(result.status){
        case 200:
            return result.text();
        default:
            console.error("could not retrieve signing key, server gave us ", result.status);
            throw "Could not retrieve signing key";
    }
}

/**
 * returns the raw JWT for passing to backend services
 * @returns {string} the JWT, or null if it is not set.
 */
function getRawToken() {
    return sessionStorage.getItem("adfs-test:token");
}

export {validateAndDecode, loadInSigningKey, getRawToken};