window.$ = window.jQuery = require('./jquery-3.3.1.min.js');
const {ipcRenderer} = require('electron');

const rooms = ["Computer","STEM","Lab","Music","Playground","VA"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const grades = ["G4", "G5", "G6"];
var state = "subject", html;

/* var G = {
    "subject": {
        makeForm: function(ex) {
            let html = new String();
            for (let h in ex) {
                html += `<div class="bk"><h3>${h}</h3>`;
                for (let i in ex[h].teaching) {
                    let checked = ex[h].teaching[i] ? " checked" : "";
                    html += `${grades[i]}<input type="checkbox"${checked}> `;
                }
                html += `<br><span>Category: </span><input type="text" value="${ex[h].category}">`;
                html += `<br><span>Location: </span><input type="text" value="${ex[h].location}">`;
                html += "</div>";
            }
            return html;
        }
    },
    "rooms": {
        makeForm: function(ex) {
            let html = new String();
            for (let h = 0; h < rooms.length; h++) {
                html += `<div class="bk"><h3>${rooms[h]}</h3>`
                for (let i = 0; i < 5; i++) {
                    html += `<span class="wd">${weekDays[i]} :</span>`;
                    for (let j = 0; j < 9; j++) {
                        let checked = ex[rooms[h]][i][j] ? "checked" : "";
                        //checked = "checked";
                        html += `${j} <input type="checkbox" ${checked} id="${rooms[h]}-${i}-${j}" class="cb">`;
                    }
                    html += `<br>`;
                }
                html += `</div>`;
            }
            return html;
        }
    },
    "teacher": {
        makeForm: function(ex) {
            let html = new String();
            for (let h in ex) {
                html += `<div class="bk"><h3>${h}</h3><input type="button" value="add teaching subject" id="add-${h}"><br>`;
                for (let i in ex[h].teaching) {
                    //html += `<input type="text" value="${ex[h].teaching[i]}">`;
                    html += `<label><input type="button" value="x" id="del-${h}-${i}"><input type="text" value="${i}"></label><br>`;
                }
                html += `<div class="x"><input type="button" value="X" id="${h}"></div>`;
                html += "</div>";
            }
            $("#app").html(html);
            for (let h in ex) {
                $(`#add-${h}`).click(function() {
                    ex[h]["teaching"]["enter"] = {};
                    G[state].makeForm(ex);
                    chExdata(ex);
                });
                for (let i in ex[h].teaching) {
                    $(`#del-${h}-${i}`).click(function() {
                        delete ex[h]["teaching"][i];
                        G[state].makeForm(ex);
                        console.log("del");
                    });
                }
            }
            //return html;
        }
    },
    "classes": {
        makeForm: function() {
            return "<h1>Under Construction</h1>";
        }
    }
};*/

var makeForm = function(action, data) {
    let html = new String();
    let temp, cb;
    let runAfter = new Array();
    switch (action) {
        case "subject":
            temp = data.subject;
            for (let i in temp) {
                html += `<div class="bk"><label id="editName-${i}"><strong>${temp[i].name}</strong><i class="fas fa-edit editIcon" alt="Rename Subject"></i></label><p>`;
                for (let j in grades) {
                    let checked = temp[i].teaching[j] ? "checked" : "";
                    html += `<label> ${grades[j]} <input type="checkbox" ${checked}></label>`
                }
                html += `</p><p><span class="wd">Category: </span><input type="text" value="${temp[i].category}"></p>`
                html += `<p><span class="wd">Location: </span><input type="text" value="${temp[i].location}"></p>`
                html += `</div>`;

                runAfter.push(function() {
                    $(`#editName-${i}`).click(function() {
                        $(`#editName-${i}`).html(`<input type="text" id="inputName-${i}" value="${temp[i].name}"> <input type="button" value="OK" id="confirmName-${i}">`);
                        console.log("edit");
                    $(`#editName-${i}`).off();
                })});
                runAfter.push(function() {
                    $(`#confirmName-${i}`).click(function() {
                        $(`#editName-${i}`).html(`<strong>${temp[i].name}</strong><i class="fas fa-edit editIcon" alt="Rename Subject"></i>`);
                        console.log("finish edit");
                    });
                });
            }
            //html += `<input type="button" value="add new">`;
        break;
    }
    $("#app").html(html);
    console.log("BBB");
    for (let i in runAfter) {
        runAfter[i]();
    }
};

function chExdata(data) {
    exdata = data;
    console.warn("change");
    console.log(exdata);
}

var exportJSON = function() {
    let output = new Array();
    for (let h = 0; h < rooms.length; h++) {
        let m = new Array();
        for (let i = 0; i < 5; i++) {
            let n = new Array();
            for (let j = 0; j < 9; j++) {
                let temp = $(`#${rooms[h]}-${i}-${j}`).is(":checked");
                //console.log(`${rooms[h]} - ${temp}`)
                n.push(temp);
            }
            m.push(n);
        }
        output[h] = {
            name: rooms[h],
            a: m
        };
    }
    let str = JSON.stringify(output);
    return str;
};

var exdata = ipcRenderer.sendSync('initApp', 'pingping');
console.log(exdata);
makeForm("subject", exdata);

/*var refreshPage = function(state) {
    makeForm(state, exdata);
    //$("#app").html(html);
}("subject");*/


$("#Rooms").click(function() {
    state = "rooms";
    //refreshPage("classroom");
    html = G[state].makeForm(exdata[state]);
    $("#app").html(html);
});

$("#Subjects").click(function() {
    state = "subject";
    //refreshPage("classroom");
    html = makeForm("subject" ,exdata);
    $("#app").html(html);
});

$("#Teachers").click(function() {
    state = "teacher";
    //refreshPage("classroom");
    html = G[state].makeForm(exdata[state]);
    //$("#app").html(html);
});

$("#addItem").click(function() {
    let txVal = $("#textInput").val();
    console.log(txVal);
    if (txVal) {
        switch (state) {
            case "subject":
                exdata[state][txVal] = {
                    "teaching": [false, false, false],
                    "category": "",
                    "location": "own"
                };
            break;
            case "teacher":
                exdata[state][txVal] = {
                    "teaching": {
                        "please enter": {}
                    }
                }
            break;
            console.log(exdata);
        }
        html = G[state].makeForm(exdata[state]);
        $("#app").html(html);
    }
});

$("#makeJSON").click(function() {
    var jSon = exportJSON();
    ipcRenderer.send('classroom', jSon)
    //ipcRenderer.send('update', jSon)
});