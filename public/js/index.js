import '@babel/polyfill'
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings'
import { resetPassword } from './resetPassword';
import { bookTour } from './stripe';
import { showAlert } from './alert';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const choosePhoto = document.getElementById('photo');
const resetPasswordForm = document.querySelector('.form--reset-password');
const bookTourBtn = document.getElementById('book-tour');


// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    })

if (logoutBtn) logoutBtn.addEventListener('click', logout)

if (userDataForm)
    userDataForm.addEventListener('submit', async e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        await updateSettings(form, 'data');
        location.reload();
    })

if (updatePasswordForm)
    updatePasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const currentPassword = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        updateSettings({ currentPassword, newPassword, confirmPassword }, 'password');

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
        document.querySelector('.btn--save-password').textContent = 'Save password';
    })

if (choosePhoto)
    choosePhoto.addEventListener('change', () => {
        const photoName = document.getElementById('photo').files[0].name
        document.getElementById('label-photo').textContent = photoName;
    })

if (resetPasswordForm)
    resetPasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const token = document.URL.split('/')[4];
        resetPassword(password, confirmPassword, token);
    })

if (bookTourBtn)
    bookTourBtn.addEventListener('click', e => {
        // e.preventDefault();
        // const tourId = bookTourBtn.dataset.tourid;
        // console.log(tourId);
        // bookTour(tourId)
        showAlert('info', 'Booking tour features are in under development!')
    })