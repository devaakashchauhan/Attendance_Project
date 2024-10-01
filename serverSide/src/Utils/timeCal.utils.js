function timeCal(objectOfTime) {
  const onlyTimeData = objectOfTime.entries;
  // console.log("inner :- ", objectOfTime);

  let allTimes = [];
  let allEntryTimes = [];
  let totalWorkingTime = [0, 0, 0];
  let totalBreakTime = [0, 0, 0];

  if (onlyTimeData.length % 2 !== 0) {
    // onlyTimeData.pop();
    // let sixOClock = new Date(onlyTimeData[0]);
    // sixOClock.setHours(18, 0, 0, 0); // Set time to 18:00:00 (6 PM)
    // onlyTimeData.push(sixOClock);
  }

  const options = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  onlyTimeData.map((ele) => {
    allEntryTimes.push(new Date(ele).toLocaleTimeString("en-IN", options));
  });

  console.log(allEntryTimes);
}
