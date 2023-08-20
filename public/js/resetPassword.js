import axios from 'axios';
import { showAlert } from './alert';

export const resetPassword = async (password, confirmPassword, token) => {
    // Remove '?' from reset token
    if (token.slice(-1) === '?')
        token = token.slice(0, -1);

    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:3000/api/v1/user/resetPassword/${token}`,
            data: {
                password,
                confirmPassword
            }
        })

        console.log(res);
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