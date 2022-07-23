const express = require("express");
const app = express();
const PORT = 3003;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, () => console.log(`Goling server is listening on port ${PORT}.`));