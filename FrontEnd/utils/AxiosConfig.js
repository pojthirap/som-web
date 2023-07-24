import axios from 'axios';
import Cookies from 'js-cookie'
import moment from 'moment';
const API_URL = process.env.apiPath;
const langKey = "Accept-Language";
const authKey = "Authorization"
axios.defaults.baseURL = API_URL
axios.defaults.withCredentials = true

function createAxiosInterceptor(axiosInstance) {
    axiosInstance.interceptors.request.use(
        async config => {
            config.headers[langKey] = getCookie("lang") ? getCookie("lang") : "th"
            config.headers.Accept = "*/*"
            const token = localStorage.getItem('token')
            if (token) config.headers[authKey] = `Bearer ${token}`;
            config.timeout = (1000 * 60) * 1
            return config
        },
        error => {
            return Promise.reject('*intercepter request*', error)
        }
    );

    axiosInstance.interceptors.response.use(
        response => {
            return response;
        },
        error => {
            return error;
        }
    );
}
const downloadAxios = axios.create({
    responseType: "blob"
});

const mainAxios = axios.create({
    responseType: "json"
});

createAxiosInterceptor(downloadAxios);
createAxiosInterceptor(mainAxios);



export {
    mainAxios,
    downloadAxios
};

// export default axios

function getCookie(cookieName) {
    return Cookies.get(cookieName);
}