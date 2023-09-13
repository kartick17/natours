import axios from "axios"
import { showAlert } from "./alert";

export const createTour = async data => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/tour',
            data
        })
        console.log(res);
        if (res.data.status === 'success') {
            showAlert('success', 'Tour added sucessfully');
            window.setTimeout(() => {
                location.assign('/')
            }, 1000)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}