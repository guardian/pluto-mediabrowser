import axios, {AxiosError} from "axios";
import {SystemNotifcationKind, SystemNotification} from "pluto-headers";

declare var deploymentRootPath:string;

/**
 * sets up a default request interceptor that adds the access token to outgoing requests,
 * and a default response interceptor that displays an error message on 503
 */
function setupInterceptors() {
    axios.defaults.baseURL = deploymentRootPath;
    axios.interceptors.request.use((config) =>{
        const token = window.localStorage.getItem("pluto:access-token");
        if (token) config.headers.Authorization = `Bearer ${token}`;

        return config;
    });

    axios.interceptors.response.use(
        (response)=>response,
        (error:AxiosError)=>{
            if(error.response) {
                switch (error.response.status) {
                    case 502 | 503 | 504:
                        SystemNotification.open(SystemNotifcationKind.Error, "Vidispine is not responding, please report this to multimedia tech and try again in a few minutes")
                        break;
                    default:
                        break;
                }
            } else if(error.name) {
                if(error.name=="NetworkError") {
                    SystemNotification.open(SystemNotifcationKind.Error, "Vidispine is not responding, please report this to multimedia tech and try again in a few minutes")
                }
            } else {
                console.error("got error of ", error);
            }
            throw error;
        })
}

export {setupInterceptors}