const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const FILE = "counter.json";

if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify({ count: 0 }));
}

app.get("/", (req, res) => {
    let data = JSON.parse(fs.readFileSync(FILE));
    data.count += 1;

    fs.writeFileSync(FILE, JSON.stringify(data));

    res.send(`Nombre de visites : ${data.count}`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

