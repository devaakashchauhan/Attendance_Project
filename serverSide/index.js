const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());

app.post("/record", (req, res) => {
  const { rfid } = req.body;

  if (!rfid) {
    return res.status(400).json({ error: "RFID is required" });
  }

  console.log(rfid);
  res.send(rfid);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
