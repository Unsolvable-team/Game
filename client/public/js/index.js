var validation = {};

validation.init = function() {
    validation.roomcode = document.getElementById('roomcode');
    validation.username = document.getElementById('username');
    validation.join = document.getElementById('join');

    validation.sets = document.querySelectorAll('.setbox');
    validation.new = document.getElementById('new');

    validation.roomcode.addEventListener('keyup', function(evt) {
        validation.validateJoin();
    });
    validation.username.addEventListener('keyup', function(evt) {
        validation.validateJoin();
    });

    validation.sets.forEach(function(setbox) {
        setbox.addEventListener('click', function(evt) {
            validation.validateNew();
        });
    });


}

validation.validateNew = function() {
    var status = false;
    validation.sets.forEach(function(setbox) {
        status = status | setbox.checked;
    });
    if (status) {
        validation.new.disabled = false;
    } else {
        validation.new.disabled = true;
    }
};

validation.validateJoin = function() {
    if (validation.username.value && validation.username.value !== '') {
        if (validation.roomcode && validation.roomcode.value.length === 6 && validation.isHex(validation.roomcode.value.toLowerCase())) {
            validation.join.disabled = false;
        } else {
            validation.join.disabled = true;
        }

    } else {
        validation.join.disabled = true;
    }
};

validation.isHex = function(h) {
    var a = parseInt(h, 16);
    var s = a.toString(16);
    if (s.length < 6) {
        s = '0' + s
    }
    return (s === h)
};

validation.init();