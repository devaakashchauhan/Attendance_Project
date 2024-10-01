function calculateTime(objectOfTime) {
  const onlyTimeData = objectOfTime.entries;
  // console.log("inner :- ", objectOfTime);

  let allTimes = [];
  let allEntryTimes = [];
  let totalWorkingTime = [0, 0, 0];
  let totalBreakTime = [0, 0, 0];

  if (onlyTimeData.length % 2 !== 0) {
    // onlyTimeData.pop();

    let t1 = new Date(onlyTimeData[0]);
    let t2 = new Date(onlyTimeData[0]);

    if (onlyTimeData[0] > t1.setHours(9, 0, 0, 0)) {
      t1.setHours(9, 0, 0, 0);
      onlyTimeData.unshift(t1);
    }
    t2.setHours(18, 0, 0, 0);

    onlyTimeData.push(t2);
  }
  // console.log(onlyTimeData);

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

  // console.log(allEntryTimes);

  const l = onlyTimeData.length;

  for (let i = 0; i < 1; i++) {
    let entryTime = onlyTimeData[i];
    let exitTime = onlyTimeData[onlyTimeData.length - 1];
    let entryTimeInSecondFormat = entryTime.getTime() / 1000;
    let exitTimeInSecondFormat = exitTime.getTime() / 1000;
    let totalTimeDifferentInSeconds =
      exitTimeInSecondFormat - entryTimeInSecondFormat;

    let time = timeCaculation(
      totalTimeDifferentInSeconds,
      i % 2 === 0 ? true : false
    );

    allTimes.push(time);
  }

  function timeCaculation(totalTimeDifferentInSeconds, pass) {
    // Hour calculation
    let totalTimeInHourFormat = totalTimeDifferentInSeconds / 3600;
    let onlyHour = Math.floor(totalTimeInHourFormat);

    // Minutes calculation
    let totalTimeWithoutHour = totalTimeInHourFormat - onlyHour;
    let totalTimeInMinutesFormat = totalTimeWithoutHour * 60;

    // Second calculation
    let onlyMinutes = Math.floor(totalTimeInMinutesFormat);
    let onlySeconds = Math.ceil((totalTimeInMinutesFormat - onlyMinutes) * 60);

    if (pass) {
      totalWorkingTime[0] += onlyHour;
      totalWorkingTime[1] += onlyMinutes;
      totalWorkingTime[2] += onlySeconds;
    } else {
      totalBreakTime[0] += onlyHour;
      totalBreakTime[1] += onlyMinutes;
      totalBreakTime[2] += onlySeconds;
    }

    let time = [onlyHour, onlyMinutes, onlySeconds];
    return time;
  }

  return {
    fulldate: objectOfTime.date,
    // fullname: objectOfTime.fullname,
    allTime: allTimes,
    allEntryTimes: allEntryTimes,
    totalWorkingTime: totalWorkingTime,
    totalBreakTime: totalBreakTime,
    dayOfWeek: objectOfTime.dayOfWeek,
  };
}

export { calculateTime };
