import '@babel/polyfill'
import { signup } from './signup';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings'
import { forgotPassword, resetPassword } from './resetPassword';
import { createTour } from './tour';

// DOM Elements
const mapBox = document.getElementById('map');
const choosePhoto = document.getElementById('photo');
const bookTourBtn = document.getElementById('book-tour');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const addTourBtn = document.querySelector('.btn--add-tour');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const createTourForm = document.querySelector('.form--create-tour')
const updatePasswordForm = document.querySelector('.form-user-settings');
const resetPasswordForm = document.querySelector('.form--reset-password');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const alertMessage = document.querySelector('body').dataset.alert;

// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (signupForm)
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        signup({ name, email, password, confirmPassword });
    })

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
        e.preventDefault();
        const tourId = bookTourBtn.dataset.tourid;
        bookTour(tourId)
    })

if (forgotPasswordForm)
    forgotPasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        forgotPassword(email);
    })

if (alertMessage) showAlert('success', alertMessage);

if (addTourBtn)
    addTourBtn.addEventListener('click', e => showAlert('success', 'Click'))

if (createTourForm)
    createTourForm.addEventListener('submit', async e => {
        e.preventDefault();
        const form = new FormData();

        const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const startLocation = {};
        startLocation.description = document.getElementById('price').value;
        startLocation.address = document.getElementById('address').value;
        startLocation.coordinates = [
            +document.getElementById('lat').value,
            +document.getElementById('lng').value
        ]

        form.append('name', document.getElementById('name').value)
        form.append('summary', document.getElementById('summary').value)
        form.append('description', document.getElementById('description').value)
        form.append('duration', +document.getElementById('duration').value)
        form.append('maxGroupSize', +document.getElementById('maxGroupSize').value)
        form.append('price', +document.getElementById('price').value)
        form.append('difficulty', document.getElementById('difficulty').value)
        form.append('startLocation', startLocation)
        form.append('imageCover', document.getElementById('imageCover').files[0])
        form.append('images', document.getElementById('images').files[0])
        form.append('images', document.getElementById('images').files[1])
        form.append('images', document.getElementById('images').files[2])
        form.append('startDates', date)
        form.append('startDates', date)

        createTour(form);
    })