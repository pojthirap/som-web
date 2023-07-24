import axios from 'axios';
import Cookies from 'js-cookie'
const API_URL = process.env.apiPath;
const langKey = "Accept-Language";
const authKey = "Authorization";
axios.defaults.baseURL = API_URL
axios.defaults.responseType = "blob"
axios.interceptors.request.use(
    async config => {
        config.headers[langKey] = getCookie("lang") ? getCookie("lang") : "th"
        if (getCookie("publicSessionNo")) config.headers[authKey] = "Bearer " + getCookie("publicSessionNo");
        config.timeout = (1000 * 60) * 1
        return config
    },
    error => {
        return Promise.reject('*intercepter request*', error)
    }
)

axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        return error;
    }
)
export default axios

function getCookie(cookieName) {
    return Cookies.get(cookieName);
}