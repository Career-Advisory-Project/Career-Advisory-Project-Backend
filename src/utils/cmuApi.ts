import axios from "axios";

const cpeApiUrl = process.env.CPE_API_URL ?? "";
const token = process.env.CPE_API_TOKEN;

export const cmuApi = axios.create({
    baseURL: cpeApiUrl,
    headers: {
        'Authorization': `Bearer ${token}`,
        'Connection': 'close' // Stale socket bug permanently fixed here
    }
});