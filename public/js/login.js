import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/user/login',
            data: {
                email,
                password
            }
        })

        if (res.data.status === 'success') {
            showAlert('success', 'Login successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message)
    }

}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/user/logout'
        })

        if (res.data.status === 'success')
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
    } catch (err) {
        showAlert('error', 'Error logging out! Try again');
    }
}