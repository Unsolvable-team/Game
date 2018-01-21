var validation = {};

validation.init = function() {
    validation.login = document.getElementById('login');
    validation.email = document.getElementById('email');
    validation.password = document.getElementById('password');

    validation.password.addEventListener('keyup', function(evt) {
        validation.validateLogin();
    });
    validation.email.addEventListener('change', function(evt) {
        validation.validateLogin();
    });
};

validation.validateLogin = function() {
    if (validation.email.value && validation.checkEmail(validation.email.value)) {
        if (validation.password.value && validation.password.value !== "") {
            validation.login.disabled = false;
        } else {
            validation.login.disabled = true;
        }
    } else {
        validation.login.disabled = true;
    }
};

validation.checkEmail = function(txt) {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(txt); // Assuming email has a text attribute
}

validation.init();