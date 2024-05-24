function calculateTime(objectOfTime) {
  const onlyTimeData = objectOfTime.allEntries;
  const l = onlyTimeData.length;
  let allTimes = [];
  let totalWorkingTime = [0, 0, 0];
  let totalBreakTime = [0, 0, 0];

  if (objectOfTime.allEntries.length % 2 !== 0) {
    objectOfTime.allEntries.pop();
  }

  for (let i = 0; i < l - 1; i++) {
    let entryTimeInSecondFormat = objectOfTime.allEntries[i].getTime() / 1000;
    let exitTimeInSecondFormat =
      objectOfTime.allEntries[i + 1].getTime() / 1000;
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

  // return {
  //   date: objectOfTime.date,
  //   allTime: allTimes,
  //   totalWorkingTime: totalWorkingTime,
  //   totalBreakTime: totalBreakTime,
  // };
}
