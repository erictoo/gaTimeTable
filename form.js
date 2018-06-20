var rooms = ["Computer","STEM","Lab","Music","Playground","VA"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

var makeForm = function() {
    let html = new String();
    for (let h = 0; h < rooms.length; h++) {
        html += `<div class="bk"><h3>${rooms[h]}</h3>`
        for (let i = 0; i < 5; i++) {
            html += `<span class="wd">${weekDays[i]} :</span>`;
            for (let j = 1; j < 9; j++) {
                html += `${j} <input type="checkbox" checked="checked" id="${rooms[h]}-${i}-${j}" class="cb">`;
            }
            html += `<br>`;
        }
        html += `</div>`;
    }
    return html;
};

var exportJSON = function() {
    let output = new Object();
    for (let h = 0; h < rooms.length; h++) {
        let m = new Array();
        for (let i = 0; i < 5; i++) {
            let n = new Array();
            for (let j = 1; j < 9; j++) {
                let temp = $(`#${rooms[h]}-${i}-${j}`).is(":checked");
                //console.log(`${rooms[h]} - ${temp}`)
                n.push(temp);
            }
            m.push(n);
        }
        output[rooms[h]] = m;
    }
    let str = JSON.stringify(output);
    return str;
};