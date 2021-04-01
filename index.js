const express = require('express')
const app = express();
let shell = require('shelljs');
const PORT = process.env.PORT || 5000;


app.use(express.static('public'));

app.listen(PORT);
console.log("Listening on port 8080")