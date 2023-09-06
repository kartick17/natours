const express = require('express');
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController');

const router = express.Router();

// This route are open for all
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// All the route after this middelware are protected. So this will protect all the route after this middleware
router.use(authController.protect)

router.patch('/updatePassword', authController.updatePassword)
router.get('/me', userController.getMe, userController.getUser)
router.patch(
    '/updateMe',
    userController.uploadUserPhoto,
    // userController.resizeUserPhoto,
    userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// All the route after this are accessible only to admin
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router;