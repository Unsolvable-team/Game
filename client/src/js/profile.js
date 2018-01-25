var app = {}

app.init = function() {
    app.new = document.getElementById('new');
    app.edit = document.querySelectorAll('.edit');
    app.newset = document.getElementById('newset');
    app.user = document.getElementById('username').innerHTML;

    app.edit.forEach(function(e) {
        e.addEventListener('click', function(evt) {
            app.loadEdit(e.value);
        });
    });

    app.new.addEventListener('click', function(evt) {
        app.newSet();
        app.new.disabled = true;
    });
};

app.loadEdit = function(e) {

};

app.newSet = function() {
    var html = `
        <form method="POST"  action="/updateset"  enctype="json">
            <h2>
                Create new 
            </h2>
            <table id="questions" class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
                <thead>
                <tr>
                    <th class="mdl-data-table__cell--non-numeric">
                        <div class="mdl-textfield mdl-js-textfield">
                            <input class="mdl-textfield__input" type="text" id="naam">
                            <label class="mdl-textfield__label" for="roomcode">Name</label>
                        </div>
                    </th>
                </tr>
                </thead>
                </tbody id="tbody">
                    <tr class="qr">
                        <td class="mdl-data-table__cell--non-numeric">
                            <div class="mdl-textfield mdl-js-textfield">
                                <button class="delq mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Remove</button>
                            </div>
                            <div class="mdl-textfield mdl-js-textfield">
                                <input class="q qs mdl-textfield__input" type="text" id="q-0">
                                <label class="mdl-textfield__label" for="q-0">Question</label>
                            </div>
                            <div class="mdl-textfield mdl-js-textfield">
                                <input class="a qs mdl-textfield__input" type="text" id="a-01">
                                <label class=" mdl-textfield__label" for="a-01">Anwser1</label>
                            </div>
                            <div class="mdl-textfield mdl-js-textfield">
                                <input class="a qs mdl-textfield__input" type="text" id="a-02">
                                <label class="mdl-textfield__label" for="a-02">Anwser2</label>
                            </div>
                            <div class="mdl-textfield mdl-js-textfield">
                                <input class="a qs mdl-textfield__input" type="text" id="a-03">
                                <label class="mdl-textfield__label" for="a-03">Anwser3</label>
                            </div>
                            <div class="mdl-textfield mdl-js-textfield">
                                <input class="correct qs mdl-textfield__input" type="text" id="correct-0">
                                <label class="mdl-textfield__label" for="correct">Correct anwser</label>
                            </div>
                        </td>
                    </tr>
                    <tr id='lastrow'>
                        <td>
                            <button id='addq' class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" >Add question</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <input id="final" type="hidden" name="final" value="">
            <div class="mdl-textfield mdl-js-textfield">
                <input id='submit' type="submit" value="Submit" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"  disabled/>
            </div>
        </form>
    `;

    app.newset.innerHTML = html;
    var setname = document.getElementById('naam');
    var removes = document.querySelectorAll('.delq');
    var questionvars = document.querySelectorAll('.qs');
    var add = document.getElementById('addq');
    app.submit = document.getElementById('submit');
    app.final = document.getElementById('final');

    setname.addEventListener('change', function(evt) {
        app.validateForm();
    });
    questionvars.forEach(function(qvar) {
        qvar.addEventListener('change', function(evt) {
            app.validateForm();
        });
    });
    removes.forEach(function(rem) {
        rem.addEventListener('click', function() {
            //  div        td         tr         tbody                      div        td         tr
            rem.parentNode.parentNode.parentNode.parentNode.removeChild(rem.parentNode.parentNode.parentNode);
            app.validateForm();
        });
    });
    add.addEventListener('click', function() {
        app.newRow();
    });

    app.questions = document.getElementById('questions');

    componentHandler.upgradeDom();

};

app.newRow = function() {
    var lastrow = document.getElementById('lastrow');
    var tbody = document.getElementById('tbody');

    var nr = tbody.querySelectorAll('tr').length;

    var row = document.createElement('tr');
    row.classList.add('qr');
    row.innerHTML = `
    <td class="mdl-data-table__cell--non-numeric">
        <div class="mdl-textfield mdl-js-textfield">
            <button class="delq mdl-button mdl-js-button mdl-button--raised mdl-button--colored">Remove</button>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
            <input class="q qs mdl-textfield__input" type="text" id="q-${nr}">
            <label class="mdl-textfield__label" for="q-${nr}">Question</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
            <input class="a qs mdl-textfield__input" type="text" id="a-${nr}1">
            <label class=" mdl-textfield__label" for="a-${nr}1">Anwser1</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
            <input class="a qs mdl-textfield__input" type="text" id="a-${nr}2">
            <label class="mdl-textfield__label" for="a-${nr}2">Anwser2</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
            <input class="a qs mdl-textfield__input" type="text" id="a-${nr}3">
            <label class="mdl-textfield__label" for="a-${nr}3">Anwser3</label>
        </div>
        <div class="mdl-textfield mdl-js-textfield">
            <input class="correct qs mdl-textfield__input" type="text" id="correct-${nr}">
            <label class="mdl-textfield__label" for="correct">Correct anwser</label>
        </div>
    </td>
    `
    lastrow.parentNode.removeChild(lastrow);
    tbody.appendChild(row);
    tbody.appendChild(lastrow);
    app.validateForm();


};

app.validateForm = function() {
    var setname = document.getElementById('naam');
    var questionvars = document.querySelectorAll('.qs');
    var qrows = document.querySelectorAll('.qr');
    var output = [];

    var ok = setname.value && setname.value !== "";

    questionvars.forEach(function(qvar) {
        if (qvar.value && qvar.value !== "") {
            ok = ok && true;
        } else {
            ok = ok && false;
        }
    });
    if (ok && app.submit) {
        app.submit.disabled = false;
        qrows.forEach(function(row) {
            var q = row.querySelector('.q').value;
            console.log(q);
            var a = [];
            row.querySelectorAll('.a').forEach(function(anwser) {
                a.push(anwser.value);
            });
            var correct = row.querySelector('.correct').value;

            output.push({
                q: q,
                a: a,
                correct: correct,
                user: app.user,
                set: setname.value
            });
        });
        app.final.value = JSON.stringify(output);
    } else {
        app.submit.disabled = true;
    }
};


app.init();