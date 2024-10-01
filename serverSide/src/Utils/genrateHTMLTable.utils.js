function genrateHTMLTable(data, weekOfYear, startDate, endDate) {
  // console.log("html - ", data);

  // Days of the week mapping to numbers (1=Monday, 2=Tuesday, ..., 6=Saturday)
  const daysMap = {
    Monday: 2,
    Tuesday: 3,
    Wednesday: 4,
    Thursday: 5,
    Friday: 6,
    Saturday: 7,
  };

  let html = `
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: center;
    }
    th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
    }
    th {
      background-color: #f2f2f2;
      color: #333;
      font-weight: bold;
      font-size: 14px;
    }
    td {
      font-size: 13px;
    }
    table thead tr {
      background-color: #4CAF50;
      color: white;
    }
    table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  </style>
  <H4 style="text-align: center;">Year of Week :- ${weekOfYear}</H4> 
  <H4 style="text-align: center;">Date :- ${startDate} - ${endDate}</H4> 
  <table>
    <thead>
      <tr>
        <th>Day</th>
        ${data.map((user) => `<th colspan="3">${user.name}</th>`).join("")}
      </tr>
      <tr>
        <th></th>
        ${data
          .map(
            () =>
              `<th>First Entry</th><th>Last Entry</th><th>Total Working Time</th>`
          )
          .join("")}
      </tr>
    </thead>
    <tbody>`;

  // Loop through each day of the week
  Object.keys(daysMap).forEach((day) => {
    html += `
    <tr>
      <td>${day}</td>
      ${data
        .map((user) => {
          const dayData = user.AttendanceEntry.find(
            (entry) => entry.dayOfWeek === daysMap[day]
          );
          return `
            <td>${
              dayData && dayData.allEntryTimes.length > 0
                ? dayData.allEntryTimes[0]
                : "Holiday"
            }</td>
            <td>${
              dayData && dayData.allEntryTimes.length > 0
                ? dayData.allEntryTimes[dayData.allEntryTimes.length - 1]
                : "Holiday"
            }</td>
            <td>${
              dayData && dayData.totalWorkingTime.length > 0
                ? dayData.totalWorkingTime.join(":")
                : "00:00:00"
            }</td>
          `;
        })
        .join("")}
    </tr>`;
  });
  html += `
    </tbody>
  </table>`;

  return html;
}

export { genrateHTMLTable };
