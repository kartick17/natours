import axios from 'axios';
import { showAlert } from './alert';

export const signup = async data => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/user/signup',
            data
        })

        console.log(res);

        if (res.data.status === 'success') {
            showAlert('success', 'Account created successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1000)
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message)
    }
}