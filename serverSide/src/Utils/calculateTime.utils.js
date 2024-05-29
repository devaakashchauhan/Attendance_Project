function calculateTime(objectOfTime) {
  const onlyTimeData = objectOfTime.allEntries;
  let allTimes = [];
  let allEntryTimes = [];
  let totalWorkingTime = [0, 0, 0];
  let totalBreakTime = [0, 0, 0];
  if (onlyTimeData.length % 2 !== 0) {
    onlyTimeData.pop();
  }

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  onlyTimeData.map((ele) => {
    allEntryTimes.push(new Date(ele).toLocaleTimeString("en-US", options));
  });

  const l = onlyTimeData.length;

  for (let i = 0; i < l - 1; i++) {
    let entryTime = onlyTimeData[i];
    let exitTime = onlyTimeData[i + 1];
    let entryTimeInSecondFormat = entryTime.getTime() / 1000;
    let exitTimeInSecondFormat = exitTime.getTime() / 1000;
    let totalTimeDifferentInSeconds =
      exitTimeInSecondFormat - entryTimeInSecondFormat;

    let time = timeCaculation(
      totalTimeDifferentInSeconds,
      i % 2 === 0 ? true : false
    );

    allTimes.push(time);
    // allEntry.push(new Date(entryTime).toLocaleTimeString("en-US", options));
    // allExit.push(new Date(entryTime).toLocaleTimeString("en-US", options));
    // console.log(new Date(entryTime).toLocaleTimeString("en-US", options));
    // console.log(new Date(exitTime).toLocaleTimeString("en-US", options));
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
    date: objectOfTime.date,
    fullname: objectOfTime.fullname,
    allTime: allTimes,
    allEntryTimes: allEntryTimes,
    totalWorkingTime: totalWorkingTime,
    totalBreakTime: totalBreakTime,
  };
}

export { calculateTime };
