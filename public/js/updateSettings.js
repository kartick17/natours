import axios from "axios";
import { showAlert } from "./alert";

export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/user/updatePassword/' : 'http://127.0.0.1:3000/api/v1/user/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if (res.data.status === 'sucess') {
            showAlert('sucess', `${type.toUpperCase()} updated sucessfully`)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}