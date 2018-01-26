webpackJsonp([2],{

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var validation = {};

validation.init = function () {
    validation.register = document.getElementById('register');
    validation.email = document.getElementById('email');
    validation.password = document.getElementById('password');
    validation.passwordConf = document.getElementById('passwordConf');
    validation.name = document.getElementById('name');

    validation.password.addEventListener('change', function (evt) {
        validation.validateRegister();
    });
    validation.email.addEventListener('change', function (evt) {
        validation.validateRegister();
    });
    validation.name.addEventListener('change', function (evt) {
        validation.validateRegister();
    });
    validation.passwordConf.addEventListener('keyup', function (evt) {
        validation.validateRegister();
    });
};

validation.validateRegister = function () {
    if (validation.email.value && validation.checkEmail(validation.email.value)) {
        if (validation.password.value && validation.password.value !== "" && validation.password.value === validation.passwordConf.value) {
            if (validation.name.value && validation.name.value !== "") {
                validation.register.disabled = false;
            } else {
                validation.register.disabled = true;
            }
        } else {
            validation.register.disabled = true;
        }
    } else {
        validation.register.disabled = true;
    }
};

validation.checkEmail = function (txt) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(txt);
};

validation.init();

/***/ })

},[7]);