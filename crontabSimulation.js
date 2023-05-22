var intervalId;
  
function job() {
  var outputDiv = document.getElementById('output');
  outputDiv.innerHTML += 'Tarea programada ejecutada<br>';
}

function infoTask() {
// Get input values
  var dateInput = document.getElementById('date-input');
  var hourInput = document.getElementById('hour-input');
  var minuteInput = document.getElementById('minute-input');
  var intervalInput = document.getElementById('interval-input');

  // Parse input values
  var date = parseInt(dateInput.value);
  var hour = parseInt(hourInput.value);
  var minute = parseInt(minuteInput.value);
  var interval = parseInt(intervalInput.value);

  // Create the current date and time
  var currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), date);
  currentDate.setHours(hour, minute, 0, 0);

  // Display task information
  var outputDiv = document.getElementById('output');
  outputDiv.innerHTML += `Tarea establecida para el ${currentDate.toLocaleString()}<br>`;

  // Check if the scheduled date and time have passed
  if (currentDate < new Date()) {
    outputDiv.innerHTML += `La fecha y hora ya han pasado<br>`;
    stopTask();
  }
}

function scheduleTask() {
  // Get input values
  var dateInput = document.getElementById('date-input');
  var hourInput = document.getElementById('hour-input');
  var minuteInput = document.getElementById('minute-input');
  var intervalInput = document.getElementById('interval-input');

  // Parse input values
  var date = parseInt(dateInput.value);
  var hour = parseInt(hourInput.value);
  var minute = parseInt(minuteInput.value);
  var interval = parseInt(intervalInput.value);

  // Create the current date and time
  var currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), date);
  currentDate.setHours(hour, minute, 0, 0);

  // Calculate the time until the scheduled task
  var msUntilScheduledTime = currentDate.getTime() - Date.now();
  var msInOneDay = 24 * 60 * 60 * 1000;
  
  // Schedule the task if the scheduled time is in the future
  if (msUntilScheduledTime > 0 && currentDate > new Date()) {
    setTimeout(() => {
      var outputDiv = document.getElementById('output');
      outputDiv.innerHTML += `Tarea programada ejecutada el ${currentDate.toLocaleString()}<br>`;
      intervalId = setInterval(job, interval * 1000);
    }, msUntilScheduledTime);
  } else {
    // Calculate the time until the next day
    var msUntilNextDay = msInOneDay - Math.abs(msUntilScheduledTime);
    setTimeout(() => {
      var outputDiv = document.getElementById('output');
      outputDiv.innerHTML += `Tarea programada ejecutada el ${currentDate.toLocaleString()}<br>`;
      intervalId = setInterval(job, interval * 1000);
    }, msUntilNextDay);
  }
}

function stopTask() {
  clearInterval(intervalId);
}

function clearOutput() {
  var outputDiv = document.getElementById('output');
  outputDiv.innerHTML = '';
}