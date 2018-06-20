const fs = require("fs");

fs.readFile("data/classes.json", function(e, data) {
    var d = JSON.parse(data);
    console.log(Object.keys(d).length);
});