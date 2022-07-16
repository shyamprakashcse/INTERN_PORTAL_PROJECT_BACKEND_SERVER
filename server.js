const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const router = require("./Routes/router");


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    res.header("Access-control-allow-Origin", "*");
    res.header("Access-control-allow-Headers", "*");
    next();
});



app.use("/api", router);



app.listen(3000, () => {
    console.log("server is running ");
});