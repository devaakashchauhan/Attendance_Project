const fs = require("fs");
const chokidar = require("chokidar");
const axios = require("axios");

const filePath =
  "F:/PROJECT/OFFICE_PROJECT/Attendances/clientSide/inputField.txt"; // Replace with the actual path to your notepad file
let lastSize = 0;

// Function to read new lines added to the file
const readNewLines = (currSize) => {
  const stream = fs.createReadStream(filePath, {
    start: lastSize,
    end: currSize,
    encoding: "utf8",
  });

  stream.on("data", (data) => {
    const lines = data.split("\n").filter((line) => line.trim() !== "");
    lines.forEach((line) => {
      const rfid = line.trim();
      axios
        .post("http://localhost:3000/record", { rfid }) // Make sure your server's endpoint is correct
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error posting RFID data:", error);
        });
    });
  });

  lastSize = currSize;
};

// Watch for changes in the file
const watcher = chokidar.watch(filePath, { persistent: true });

watcher.on("change", () => {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error("Error reading file stats:", err);
      return;
    }
    const currSize = stats.size;
    if (currSize > lastSize) {
      readNewLines(currSize);
    }
  });
});

watcher.on("error", (error) => {
  console.error("Error watching file:", error);
});

console.log(`Watching for changes in ${filePath}`);
