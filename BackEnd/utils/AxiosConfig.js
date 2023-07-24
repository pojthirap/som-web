import axios from 'axios';
import Cookies from 'js-cookie'
const API_URL = process.env.apiPath;
const langKey = "Accept-Language";
const authKey = "Authorization"
axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true
axios.interceptors.request.use(
    async config => {
        config.headers[langKey] = getCookie("lang") ? getCookie("lang") : "th"
        const token = localStorage.getItem('token')
        if (token) config.headers[authKey] = `Bearer ${token}`;
        config.timeout = (1000 * 60) * 1
        console.log(config);
        return config
    },
    error => {
        console.log(error)
        return Promise.reject('*intercepter request*', error)
    }
)

axios.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        return error;
    }
)
export default axios

function getCookie(cookieName) {
    return Cookies.get(cookieName);
}