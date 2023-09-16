import '@babel/polyfill';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import { displayMap } from './mapbox';
import { login, logout, signup } from './user';
import { updateSettings } from './updateSettings';
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
const createTourForm = document.querySelector('.form--create-tour');
const updatePasswordForm = document.querySelector('.form-user-settings');
const resetPasswordForm = document.querySelector('.form--reset-password');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const alertMessage = document.querySelector('body').dataset.alert;
const tourLocations = document.querySelector('.tour-locations');

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (signupForm)
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    signup({ name, email, password, confirmPassword });
  });

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateSettings(form, 'data');
    location.reload();
  });

if (updatePasswordForm)
  updatePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    updateSettings(
      { currentPassword, newPassword, confirmPassword },
      'password',
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--save-password').textContent = 'Save password';
  });

if (choosePhoto)
  choosePhoto.addEventListener('change', () => {
    const photoName = document.getElementById('photo').files[0].name;
    document.getElementById('label-photo').textContent = photoName;
  });

if (resetPasswordForm)
  resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = document.URL.split('/')[4];
    resetPassword(password, confirmPassword, token);
  });

if (bookTourBtn)
  bookTourBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const tourId = bookTourBtn.dataset.tourid;
    bookTour(tourId);
  });

if (forgotPasswordForm)
  forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgotPassword(email);
  });

if (alertMessage) showAlert('success', alertMessage);

if (addTourBtn) {
  let i = 0;
  addTourBtn.addEventListener('click', (e) => {
    // showAlert('success', 'Click');
    const html = `
            <div class="hr"></div>
            <div class="locations">
                <h1>Location ${i + 1}</h1>
                <div class="form__group">
                    <label for="place" class="form__label">Place</label>
                    <input type="text" id="place${i}" class="form__input" required name="place">
                </div>
                <div class="space-between">
                    <div class="form__group wd-80">
                        <label for="day" class="form__label">Day</label>
                        <input type="text" id="day${i}" class="form__input" required name="day">
                    </div>
                    <div class="form__group wd-80">
                        <label for="lat" class="form__label">Latitude</label>
                        <input type="text" id="lat${i}" class="form__input" required name="lat">
                    </div>
                    <div class="form__group wd-80">
                        <label for="lng" class="form__label">Longitude</label>
                        <input type="text" id="lng${i}" class="form__input" required name="lng">
                    </div>
                </div>
            </div>        
        `;
    // console.log(tourLocations);
    tourLocations.insertAdjacentHTML('beforeend', html);
    i++;
  });
}

function appendToFormData(data, formData, parentKey = '') {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      const newKey = parentKey ? `${parentKey}[${key}]` : key;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          // Recursively handle arrays of objects
          if (typeof item === 'object' && item !== null) {
            appendToFormData(item, formData, `${newKey}[${index}]`);
          } else {
            formData.append(`${newKey}[${index}]`, item);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        // Recursively handle objects
        appendToFormData(value, formData, newKey);
      } else {
        formData.append(newKey, value);
      }
    }
  }
}

if (createTourForm)
  createTourForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();

    const date1 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const date2 = new Date(Date.now() + 75 * 24 * 60 * 60 * 1000);

    let loc = [];
    const locations = document.querySelectorAll('.locations');
    for (let i = 0; i < locations.length - 1; i++) {
      let data = {};
      data.description = document.getElementById(`place${i}`).value;
      data.day = document.getElementById(`day${i}`).value;
      data.coordinates = [
        +document.getElementById(`lat${i}`).value,
        +document.getElementById(`lng${i}`).value,
      ];
      loc.push(data);
    }

    for (let i = 0; i < 3; i++) {
      form.append('images', document.getElementById('images').files[i]);
    }

    const startLocation = {};
    startLocation.description = document.getElementById('place').value;
    startLocation.day = document.getElementById('day').value;
    startLocation.coordinates = [
      +document.getElementById('lat').value,
      +document.getElementById('lng').value,
    ];

    const data = {
      startLocation,
      locations: loc,
    };
    appendToFormData(data, form);

    form.append('name', document.getElementById('name').value);
    form.append('summary', document.getElementById('summary').value);
    form.append('description', document.getElementById('description').value);
    form.append('duration', +document.getElementById('duration').value);
    form.append('maxGroupSize', +document.getElementById('maxGroupSize').value);
    form.append('price', +document.getElementById('price').value);
    form.append('difficulty', document.getElementById('difficulty').value);
    form.append('imageCover', document.getElementById('imageCover').files[0]);
    form.append('startDates', date1);
    form.append('startDates', date2);

    createTour(form);
  });
