import axios from 'axios';
import { showAlert } from './alert';

export const resetPassword = async (password, confirmPassword, token) => {
    // Remove '?' from reset token
    if (token.slice(-1) === '?')
        token = token.slice(0, -1);

    try {
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/user/resetPassword/${token}`,
            data: {
                password,
                confirmPassword
            }
        })

        if (res.data.status === 'success') {
            showAlert(res.data.status, 'Password updated successfully');
            window.setTimeout(() => {
                location.assign('/login');
            }, 1000);
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message)
    }
}

export const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/user/forgotPassword',
            data: {
                email
            }
        })

        if (res.data.status === 'success') {
            showAlert('success', 'Please check your email inbox for a link to complete the reset.')
            window.setTimeout(() => {
                location.assign('/login');
            }, 5000)
        }
    }
    catch (err) {
        showAlert('error', err.response.data.message);
    }
}