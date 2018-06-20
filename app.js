window.$ = window.jQuery = require('./jquery-3.3.1.min.js');
const serializeObject = require("./lib/serializeObject.js");
const {ipcRenderer} = require('electron');

const rooms = ["Computer","STEM","Lab","Music","Playground","VA"];
const sels = ["Classes", "Rooms", "Subjects", "Teachers"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const grades = ["G4", "G5", "G6"];
var state = "Teachers";
var nowPage;


$(document).ready(function() {
    $(window).keydown(function(event){
      if(event.keyCode == 13) {
        event.preventDefault();
        return false;
      }
    });
  });

$(`.modal-close, .modal-background`).click(()=>{
    $("#modal").removeClass("is-active");
});

var makeForm = function(action, data) {
    let html = new String();
    let temp, cb;
    let runAfter = new Array();
    switch (action) {
        case "Teachers":
            temp = data.Teachers;
            html += `<form id="TeachersForm">`
            for (let i in temp) {
                html += `<article class="message is-link mg" id="art-${i}">
                <div class="message-header">
                    <p>${temp[i].name}</p>
                    <input type="hidden" value="${temp[i].name}" name="f[${i}][name]">
                    <a class="delete" id="del-${i}"></a>
                </div><div class="message-body"><div class="columns"><div class="column is-half"><div class="box">`
                let th = 0;
                for (let g in temp[i].teaching) {
                    let gt = temp[i].teaching[g];
                    th += gt.duration * gt.times;
                }
                for (let j = 0; j < 5; j++) {
                    html += `<div class="item"><span class="wd">${weekDays[j]}</span>`
                    for (let k = 0; k < 9; k++) {
                        let checked = temp[i].a[j][k] ? " checked" : "";
                        html += ` ${k} <input type="checkbox" name="f[${i}][a][${j}][${k}]"${checked}>`;
                    }
                    html += `</div>`
                }
                html += `<hr class="tm"><strong>Lessons assigned: ${th} / <span id="total-${i}">${getTotal(temp[i].a)}</span></strong></div></div>`

                html += `<div class="column"><table class="table"><thead><tr>
                <th>Subject</th><th>Class</th><th>Duration</th><th>Times</th><th></th></tr></thead><tbody>`;
                let tt = temp[i].teaching;
                for (let j in tt) {
                    html += `<tr><td><div class="se select is-small"><select name="f[${i}][teaching][${j}][subject]">`;
                    for (let k in data.Subjects) {
                        let m = data.Subjects[k].name,
                            n = m === tt[j].subject ? " selected" : "";
                        html += `<option value="${m}"${n}>${m}</option>`;
                    }
                html += `</select></div></td><td><div class="se select is-small"><select name="f[${i}][teaching][${j}][class]">`
                    for (let k in data.Classes) {
                        let m = data.Classes[k].name,
                            n = m === tt[j].class ? " selected" : "";
                        html += `<option value="${m}"${n}>${m}</option>`;
                    }
                html += `</select></div></td>`
                html += `<td><input type="number" class="input is-small wid100" value="${tt[j].duration}" name="f[${i}][teaching][${j}][duration]"></td><td><input type="number" class="input is-small wid100" value="${tt[j].times}" name="f[${i}][teaching][${j}][times]"></td><td>`
                html += `<span class="icon" id="remove-${i}-${j}"><i class="fas fa-trash-alt"></i></span>`
                //html += `<a class="button is-small" id="remove-${i}-${j}">Remove</a>`
                html += `</td></tr>`;
                }

                html += `</tbody><tfoot><tr><td colspan="5">`
                html += `<a class="button" id="add-${i}"><i class="fas fa-calendar-plus r2"></i>Add Lessons</a>`
                //html += `<span class="icon" id="add-${i}"><i class="fas fa-calendar-plus"></i> Add Lessons</span>`
                html += `</td></tr></tfoot></table></div><div></div>`
                html += `</article>`

                runAfter.push(()=>{
                    $(`#add-${i}`).click(()=>{
                        $(`#mContent`).html(`<h1 class="title is-4">Add Lessons for ${temp[i].name}</h1>
                        <form id="newLesson">
                        <table class="table"><thead><tr>
                        <th>Subject</th><th>Class</th><th>Duration</th><th>Times</th></tr></thead>
                        <tbody><tr><td>${selectThing(data.Subjects,"","f[subject]")}</td>
                        <td>${selectThing(data.Classes,"","f[class]")}</td>
                        <td><input type="number" min="0" step="1" class="input is-small wid100" name="f[duration]"></td>
                        <td><input type="number" min="0" step="1" class="input is-small wid100" name="f[times]"></td>
                        </tr></tbody>
                        <tfoot>
                            <tr><td colspan="4">
                            <a class="button" id="SubmitNewLesson">Add</a>
                        </td></tr></tfoot></table>
                        </form>`);
                        $(`#modal`).addClass("is-active");
                        $(`#SubmitNewLesson`).click(()=>{
                            let jSon = $('#newLesson').serializeObject();
                            if (jSon.f.subject && jSon.f.class && isNumber(jSon.f.duration) && isNumber(jSon.f.times)) {
                                data.Teachers[i].teaching.push(jSon.f);
                                $(`#modal`).removeClass("is-active");
                                makeForm("Teachers", data);
                            }
                        });
                    });
                    $(`#del-${i}`).click(()=>{
                        $(`#mContent`).html(`<h1 class="title is-4">Delete ${temp[i].name}?</h1><a class="button is-primary" id="confirmDelete">Confirm</a> <a class="button" id="cancel">Cancel</a>`);
                        $(`#modal`).addClass("is-active");
                        $(`#confirmDelete`).click(()=>{
                            data.Teachers.splice(i, 1);
                            makeForm("Teachers", data);
                            $(`#modal`).removeClass("is-active");
                        });
                        $(`#cancel`).click(()=>{
                            $(`#modal`).removeClass("is-active");
                        });
                        
                    });
                    for (let j in data.Teachers[i].teaching) {
                        $(`#remove-${i}-${j}`).click(()=>{
                            data.Teachers[i].teaching.splice(j, 1);
                            makeForm("Teachers", data);
                        });
                    }
                    $(`#art-${i}`).change(()=>{
                        let jSon = $(`#TeachersForm`).serializeObject();
                        data.Teachers = jSon.f;
                        $(`#total-${i}`).html(getTotal(jSon.f[i].a));
                    });
                });
            }
            html += `</form>`

            $(`#addNew`).html("Add New Teacher").click(()=>{
                $(`#mContent`).html(`
                <h1 class="title is-4">Add Teacher</h1>
                <form id="newTeacher">
                    <p class="nu">
                        <span class="nt">Name:</span>
                        <input class="input" type="text" style="width: 240px;" name="f[name]" placeholder="Name">
                    </p>
                    <table class="table"><thead><tr>
                        <th>Subject</th><th>Class</th><th>Duration</th><th>Times</th></tr></thead>
                        <tbody><tr><td>${selectThing(data.Subjects,"","f[teaching][0][subject]")}</td>
                        <td>${selectThing(data.Classes,"","f[teaching][0][class]")}</td>
                        <td><input type="number" min="0" step="1" class="input is-small wid100" name="f[teaching][0][duration]"></td>
                        <td><input type="number" min="0" step="1" class="input is-small wid100" name="f[teaching][0][times]"></td>
                        </tr></tbody>
                        <tfoot>
                            <tr><td colspan="4">
                            <a class="button is-primary" id="addButton">Add</a>
                        </td></tr></tfoot></table>
                </form>`);
                $(`#modal`).addClass("is-active");
                $(`#addButton`).click(()=>{
                    let jSon = $('#newTeacher').serializeObject();
                    let ft = jSon.f.teaching[0]
                    if (ft.subject && ft.class && isNumber(ft.duration) && isNumber(ft.times) && jSon.f.name) {
                        let a = [];
                        for (let l = 0; l < 5; l++) {
                            a.push([true,true,true,true,true,true,true,true,true]);
                        }
                        jSon.f["a"] = a;
                        data.Teachers.push(jSon.f);
                        makeForm("Teachers", data);
                        $(`#modal`).removeClass("is-active");
                    }
                });
            });
        break;

        case "Classes":
            temp = data.Classes;
            html += `<form id="ClassesForm">`
            for (let i in temp) {
                //let t = temp[i].teacher ? `Class Teacher: ${temp[i].teacher}` : `Assign a Class Teacher`;
                let th = 0;
                for (let h in data.Teachers) {
                    for (let g in data.Teachers[h].teaching) {
                        let dh = data.Teachers[h].teaching[g]
                        if (dh.class == temp[i].name) th += dh.duration * dh.times;
                    }
                }
                html += `<article class="message is-primary mg" id="art-${i}">
                <div class="message-header">
                    <p>${temp[i].name}</p>
                    <input type="hidden" name="f[${i}][name]" value="${temp[i].name}">
                    <a class="delete" id="del-${i}"></a>
                </div>
                <div class="message-body">`
                for (let j = 0; j < 5; j++) {
                    html += `<div class="item"><span class="wd">${weekDays[j]}</span>`
                    for (let k = 0; k < 9; k++) {
                        let checked = temp[i].a[j][k] ? " checked" : "";
                        html += ` ${k} <input type="checkbox" name="f[${i}][a][${j}][${k}]" ${checked}>`;
                    }
                    html += `</div>`
                }
                html += `<hr class="tm"><strong>Lessons assigned: ${th} / <span id="total-${i}">${getTotal(temp[i].a)}</span></strong>
                </div></article>`;

                runAfter.push(()=>{
                    $(`#del-${i}`).click(()=>{
                        data.Classes.splice(i,1);
                        makeForm("Classes", data);
                    });
                    $(`#art-${i}`).change(()=>{
                        let jSon = $(`#ClassesForm`).serializeObject();
                        $(`#total-${i}`).html(getTotal(jSon.f[i].a));
                    });
                });
            }
            html += `</form>`

            $(`#addNew`).html("Add New Class").click(()=>{
                $(`#mContent`).html(`
                <h1 class="title is-4">Add Class</h1>
                <form id="newClass">
                    <p class="nu">
                        <span class="su">Class name:</span>
                        <input class="input" type="text" style="width: 240px;" name="f[name]" placeholder="Name">
                        <span class="su">
                            <a class="button is-primary" id="addButton">Add</a>
                        </span>
                    </p>
                </form>`);
                $(`#modal`).addClass("is-active");
                $(`#addButton`).click(()=>{
                    let jSon = $('#newClass').serializeObject();
                    if (jSon.f.name) {
                        let a = [];
                        for (let l = 0; l < 5; l++) {
                            a.push([true,true,true,true,true,true,true,true,true]);
                        }
                        jSon.f["a"] = a;
                        data.Classes.push(jSon.f);
                        makeForm("Classes", data);
                        $(`#modal`).removeClass("is-active");
                    }
                });
            });
        break;

        case "Subjects":
            temp = data.Subjects;
            html += `<form id="SubjectsForm">`
            for (let i in temp) {
                html += `<article class="message is-danger mg"><div class="message-header">
                <label id="editName-${i}"><p>${temp[i].name}<i class="fas fa-edit editIcon"></i></p><input type="hidden" value="${temp[i].name}" id="hid-${i}"  name="f[${i}][name]"></label><a class="delete" aria-label="delete"></a></div>`;
                /*for (let j in grades) {
                    let checked = temp[i].teaching[j] ? "checked" : "";
                    html += `<label> ${grades[j]} <input type="checkbox" ${checked}></label>`
                }*/
                html += `<div class="message-body">`;
                html += `<div class="item"><span class="wd">Category: </span><input type="text" value="${temp[i].category}" name="f[${i}][category]"></div>`;
                html += `<div class="item"><span class="wd">Location: </span>`;
                //select location
                html += `<div class="se select is-small"><select  name="f[${i}][location]"><option value="own">Own Classroom</option>`;
                for (let k in data.Rooms) {
                    let m = data.Rooms[k].name,
                        n = m === temp[i].location ? " selected" : "";
                    html += `<option value="${m}"${n}>${m}</option>`;
                }
                html += `"</select></div></div></div>`;
                //close div bk
                html += `</article>`;
            
                runAfter.push(()=>{
                    $(`#editName-${i}`).click(()=>{                        
                        $("#mContent").html(`<h1 class="title is-4">Change subject name</h1><span style="font-size:1.25em;">${temp[i].name} -> </span><input class="input" type="text" value="${temp[i].name}" id="nameChange" style="width:240px;"><a class="button" id="confirmName">OK</a>`);
                        $("#modal").addClass("is-active");
                        $(`#confirmName`).click(()=>{
                            let name = $(`#nameChange`).val();
                            if (name) {
                                data.Subjects[i].name = name;
                                makeForm("Subjects", data);
                                $(`#modal`).removeClass("is-active");
                            }
                        });
                    });
                });
            }
            html += `</form>`

            $(`#addNew`).html("Add New Subject").click(()=>{
                let l = temp.length;
                $(`#mContent`).html(`
                <h1 class="title is-4">Add Subject</h1>
                <form id="newSubject">
                    <p class="nu">
                        <span class="nt">Name:</span>
                        <input class="input" type="text" style="width: 240px;" name="f[name]" placeholder="Name">
                    </p>
                    <p class="nu">
                        <span class="nt">Category:</span>
                        <input class="input type="text" style="width:240px;" name="f[category]">
                    </p>
                    <p class="nu">
                        <span class="nt">Location:</span>
                        <input class="input type="text" style="width:240px;" name="f[location]" placeholder="Own Classroom">
                        <span class="su">
                            <a class="button is-primary" id="addButton">Add</a>
                        </span>
                    </p>

                </form>`);
                $(`#modal`).addClass("is-active");
                $(`#addButton`).click(()=>{
                    let jSon = $('#newSubject').serializeObject();
                    data.Subjects.push(jSon.f);
                    makeForm("Subjects", data);
                    $(`#modal`).removeClass("is-active");
                });
            });
        break;

        case "Rooms":
            temp = data.Rooms;
            html += `<form id="RoomsForm">`
            for (let i in temp) {
                html += `<article class="message is-warning mg">`;
                html += `<div class="message-header"><p>${temp[i].name}</p>
                <a class="delete" aria-label="delete"></a>`;
                html += `<input type="hidden" id="hid-${i}" name="f[${i}][name]" value="${temp[i].name}"></div><div class="message-body">`;
                    for (let j = 0; j < 5; j++) {
                        html += `<div class="item"><span class="wd">${weekDays[j]}</span>`
                        for (let k = 0; k < 9; k++) {
                            let checked = temp[i].a[j][k] ? " checked" : "";
                            html += ` ${k} <input type="checkbox" name="f[${i}][a][${j}][${k}]" ${checked}>`;
                        }
                        html += `</div>`
                    }
                //end of div bk
                html += `</div></article>`;
            }
            html += `</form>`
            $(`#addNew`).html("Add New Room").click(()=>{
                $(`#mContent`).html(`
                <h1 class="title is-4">Add Room</h1>
                <form id="newRoom">
                    <p class="nu">
                        <span class="su">Class name:</span>
                        <input class="input" type="text" style="width: 240px;" name="f[name]" placeholder="Name">
                        <span class="su">
                            <a class="button is-primary" id="addButton">Add</a>
                        </span>
                    </p>
                </form>`);
                $(`#modal`).addClass("is-active");
                $(`#addButton`).click(()=>{
                    let jSon = $('#newRoom').serializeObject();
                    if (jSon.f.name) {
                        let a = [];
                        for (let l = 0; l < 5; l++) {
                            a.push([true,true,true,true,true,true,true,true,true]);
                        }
                        jSon.f["a"] = a;
                        data.Rooms.push(jSon.f);
                        makeForm("Rooms", data);
                        $(`#modal`).removeClass("is-active");
                    }
                });
            });
        break;
    }
    $("#app").html(html);
    console.log("BBB");
    for (let i in runAfter) { runAfter[i](); }
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var selectThing = function(d, o, nm) {
    let h = `<div class="se select is-small"><select name="${nm}">`
    if (!o) h += `<option value="">Select subject</option>`
    for (let k in d) {
        let m = d[k].name,
            n = m === o ? " selected" : "";
        h += `<option value="${m}"${n}>${m}</option>`;
    }
    h += `</select></div>`;
    return h;
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
$(`#${state}`).css("color", "red");
makeForm(state, exdata);

for (let i in sels) {
    let t = sels[i];
    $(`#${t}`).click(()=>{
        exdata[state] = organizeForm();
        state = t;
        makeForm(t, exdata);
        for (let j in sels) {
            i == j ? $(`#${t}`).css("color", "red") : $(`#${sels[j]}`).css("color", "");
        }
    });
}

$("#Test").click(()=>{
    organizeForm();
})

function organizeForm() {
    let jSon = new Object;
    jSon = $(`#${state}Form`).serializeObject();
    let f = jSon.f;
    if (state == "Rooms" || state == "Classes" || state == "Teachers") {
        for (let h in f) {
            for (let i = 0; i < 5; i++) {
                if (!("a" in f[h])) f[h]["a"] = [];
                if (f[h].a.length <= i) {
                    f[h].a.push([false,false,false,false,false,false,false,false,false]);
                } else {
                    for (let j = 0; j < 9; j++) {
                        f[h].a[i][j] = f[h].a[i][j] == "on" ? true : false
                    }
                }
            }
        }
    }
    if (state == "Teachers") {
        for (let h in f) {
            if (!("teaching" in f[h])) {
                f[h]["teaching"] = new Array();
            }
        }
    }
    console.log(JSON.stringify(f, null, 2));
    return f;
}

function getTotal(arr) {
    let rv = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            rv += arr[i][j] ? 1 : 0;
        }
    }
    return rv;
}

$("#Save").click(()=>{
    ipcRenderer.send('save', exdata)
})

$("#Restore").click(()=>{
    exdata = ipcRenderer.sendSync('initApp', 'pingping');
    makeForm(state, exdata)
})

$("#makeJSON").click(function() {
    let jSon = exportJSON();
    ipcRenderer.send('classroom', jSon)
    //ipcRenderer.send('update', jSon)
});