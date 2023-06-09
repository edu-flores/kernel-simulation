// Get elements
const typeSelector = document.getElementById("type");
const algorithmSelector = document.getElementById("algorithm");
const visualizationDiv = document.getElementById("visualization");
const timeSpan = document.getElementById("time-counter");
const algorithmsForm = document.getElementById("algorithms-form");
const submitButton = document.getElementById("submit-button");
const interruptButtons = document.querySelectorAll(".interrupt-button");
const headersRow = document.getElementById("headers-row");
const inputsRow = document.getElementsByClassName("inputs-row");
const topsRow = document.getElementsByClassName("tops-row");
const userDivs = document.getElementsByClassName("user-data");

const schedulingAlgorithms = [
  { value: "fcfs", text: "First Come First Serve" },
  { value: "fifo", text: "First In First Out" },
  { value: "rr", text: "Round Robin" },
  { value: "sjf", text: "Shortest Job First" },
  { value: "srt", text: "Shortest Remaining Time" },
  { value: "hrrn", text: "Highest Response-Ratio Next" },
  { value: "mfq", text: "Multilevel Feedback Queues" },
];

const pageReplacementAlgorithms = [
  { value: "lru", text: "Least Recently Used" },
];

// Show different algorithms depending on the selector type
const setAlgorithms = (event) => {
  // Remove all options
  algorithmSelector.innerHTML = "";

  // Add new options
  const algorithms =
    event.target.value === "scheduling"
      ? schedulingAlgorithms
      : pageReplacementAlgorithms;

  algorithms.forEach((algorithm) => {
    const option = document.createElement("option");
    option.value = algorithm.value;
    option.text = algorithm.text;
    algorithmSelector.add(option);
  });

  // Dispatch change event to set input properties
  algorithmSelector.dispatchEvent(new Event("change"));
};

// Set custom user inputs
const setInputs = (event) => {
  // Set number of properties in the table
  let properties = ["ID"];

  switch (event.target.value) {
    // Scheduling
    case "fcfs":
    case "fifo":
    case "rr":
    case "sjf":
    case "srt":
    case "hrrn":
    case "mfq":
      // Show and hide inputs
      userDivs[1].style.display = 'none';
      userDivs[0].style.display = 'initial';
      algorithmsForm.dataset.type = 'scheduling';

      properties.push("Arrival", "Burst");

      // Set table columns names
      headersRow.innerHTML = "";
      properties.forEach((property) => {
        const th = document.createElement("th");
        th.innerHTML = property;
        headersRow.appendChild(th);
      });

      // Set input elements
      properties.shift();
      Array.from(inputsRow).forEach((row, index) => {
        // Add ID
        row.innerHTML = `<td>${index + 1}</td>`;

        // Add inputs
        properties.forEach(() => {
          row.innerHTML += `<td><input type="number" min="0" value=${Math.floor(Math.random() * 9) + 1} ${index < 4 ? "" : "disabled"} oninput="if (event.target.value == '') { event.target.value = '0'; }" onkeypress="return event.charCode != 45"></td>`;
        });

        // Add checkbox
        row.innerHTML += `<td><input type="checkbox" onchange="modifyInputs(event)" ${index < 4 ? "checked" : ""}></td>`;
      });
      break;
    // Page replacement
    case "lru":
      // Show and hide inputs
      userDivs[0].style.display = 'none';
      userDivs[1].style.display = 'initial';
      algorithmsForm.dataset.type = 'page-replacement';
      break;
  }
};

// Enable or disable inputs on each row
const modifyInputs = (event) => {
  // At least 1 row activated
  if (Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).length === 0) {
    event.target.checked = true;
    return;
  }

  // Get all inputs from that row
  const row = event.target.closest("tr");
  const inputs = row.querySelectorAll("input[type=number]");

  // Enable or disable them
  inputs.forEach((input) => {
    input.disabled = !event.target.checked;
  });
};

// Read time units from a file
const readTime = (event) => {
  // Get file
  const input = event.target;
  const file = input.files[0];

  // Get content
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = () => {
    // Set values
    const content = reader.result;
    timeSpan.textContent = parseInt(content);
    currentTime = parseInt(content);
  };
};

// Show in console
const displayLog = (text, color) => {
  // Display message
  const p = document.createElement("p");
  p.style.color = color;
  p.appendChild(document.createTextNode(text));
  visualizationDiv.appendChild(p);

  // Scroll to bottom
  scrollToBottom();
};

// Clear console
const clearLogs = () => {
  visualizationDiv.innerHTML = "";
};

// Scroll to bottom when updating the visualization div
const scrollToBottom = () => {
  visualizationDiv.scrollTop = visualizationDiv.scrollHeight;
};

// Change each process table row
const updateTableTop = (id, pr=20, ni=0, s='S', time=0) => {
  let topRow = topsRow[id-1];
  const currentTime = +topRow.querySelectorAll("td")[10].textContent + time;
  topRow.innerHTML = `
    <td>${id}</td>
    <td>root</td>
    <td>${pr}</td>
    <td>${ni}</td>
    <td>${Math.floor(Math.random() * (7382947 - 829436 + 1)) + 1829436}</td>
    <td>${Math.floor(Math.random() * (382947 - 29436 + 1)) + 29436}</td>
    <td>${Math.floor(Math.random() * (382947 - 29436 + 1)) + 29436}</td>
    <td>${s}</td>
    <td>${(Math.random() * (99.99 - 0.00 + 1) + 0.00).toFixed(2)}</td>
    <td>${(Math.random() * (99.99 - 0.00 + 1) + 0.00).toFixed(2)}</td>
    <td>${currentTime+1}</td>
    <td>sisop</td>
  `;
};

/**
 *
 * ALGORITHMS
 *
 */

// Execute the selected algorithm
const run = async (event) => {
  // Prevent page reloading
  event.preventDefault();

  // Select the desired function
  clearLogs();
  const selectedFunction = algorithms[typeSelector.value][algorithmSelector.value];

  // Scheduling or page replacement
  switch (algorithmsForm.dataset.type) {
    case 'scheduling':
      // Disable and enable start & stop buttons
      submitButton.disabled = true;
      interruptButtons.forEach((button) => {
        button.disabled = false;
      });

      // Prepare inputs
      const properties = Array.from(headersRow.querySelectorAll("th")).slice(1);
      const userInputs = [];
      let current;

      // For every input row, get every input type number value
      Array.from(topsRow).forEach(row => { row.innerHTML = ""; });
      Array.from(inputsRow).forEach((row, i) => {
        // Check if the process is enabled or disabled
        if (row.querySelector("input[type=checkbox]").checked) {
          current = new Process({});
          current.id = i + 1;

          // Fill top row
          let topRow = topsRow[i];
          topRow.innerHTML = `
            <td>${i+1}</td>
            <td>root</td>
            <td>20</td>
            <td>0</td>
            <td>${Math.floor(Math.random() * (7382947 - 829436 + 1)) + 1829436}</td>
            <td>${Math.floor(Math.random() * (382947 - 29436 + 1)) + 29436}</td>
            <td>${Math.floor(Math.random() * (382947 - 29436 + 1)) + 29436}</td>
            <td>S</td>
            <td>${(Math.random() * (99.99 - 0.00 + 1) + 0.00).toFixed(2)}</td>
            <td>${(Math.random() * (99.99 - 0.00 + 1) + 0.00).toFixed(2)}</td>
            <td>0</td>
            <td>sisop</td>
          `;

          // Add properties from inputs
          Array.from(row.querySelectorAll("input[type=number]")).forEach(
            (input, j) => {
              current[properties[j].innerHTML.toLowerCase()] = parseInt(
                input.value
              );
            }
          );

          // Push that process
          userInputs.push(current);
        }
      });

      // Run algorithm
      stop = false;
      await selectedFunction(userInputs);

      // Disable and enable start & stop buttons
      submitButton.disabled = false;
      interruptButtons.forEach((button) => {
        button.disabled = true;
      });
      break;
    case 'page-replacement':
      // Get input value
      const userInput = document.getElementById("page-references").value;

      // Run the algorithm
      await selectedFunction(userInput);
      break;
  }
};

// Interruptions global variable
let stop = false;

// Send interruption
const interrupt = msg => {
  displayLog(msg, "#d13079");
  stop = true;
}

// Sleep function to delay algorithms by milliseconds
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Process class with optional properties
class Process {
  constructor({
    id = 0,
    arrival = 0,
    burst = 0,
    status = 0,
    priority = 0,
    remaining = 0,
    waiting = 0,
    turnaround = 0,
  }) {
    this.id = id;
    this.arrival = arrival;
    this.burst = burst;
    this.status = status;
    this.priority = priority;
    this.remaining = remaining;
    this.waiting = waiting;
    this.turnaround = turnaround;
  }
}

const fcfsScheduling = async (input) => {
  // List of all processes
  let processes = input;

  // Sort processes based on arrival time
  processes.sort((a, b) => a.arrival - b.arrival);

  // Simulate the FCFS
  let currentTime = 0;
  timeSpan.textContent = currentTime;

  // Variables
  let waitingTime = 0;
  let turnAroundTime = 0;
  stop = false;
  for (let i = 0; i < processes.length; i++) {
    let process = processes[i];

    for (currentTime; currentTime < process.arrival; currentTime++) {
      displayLog("Esperando llegada de un nuevo proceso...", "#e39a0f");
      timeSpan.textContent = currentTime;
      await sleep(1000);
    }

    // Calculate waiting time
    waitingTime += currentTime - process.arrival;

    // Calculate turnaround time
    turnAroundTime += currentTime + process.burst - process.arrival;

    displayLog(`Llegó proceso: ${process.id}`, "#dddddd");
    timeSpan.textContent = currentTime;
    await sleep(1000);

    for (let j = 0; j < process.burst; j++) {
      currentTime++;
      timeSpan.textContent = currentTime;
      displayLog(`Ejecutando proceso ${process.id} en tiempo: ${currentTime}`, "#dddddd");
      updateTableTop(process.id, 20, 0, 'R');
      await sleep(1000);
      // Check for interruptions
      if(stop) {
        currentTime++;
        timeSpan.textContent = currentTime;
        break;
      }
    }
    if(!stop) {
      displayLog(`Proceso: ${process.id} terminado en tiempo ${currentTime}`, "#08967e");
    }
    stop = false;
    updateTableTop(process.id, 20, 0, 'Z', -1);
  }

  // Display stats
  displayLog("Tiempo de retorno promedio: " + (turnAroundTime / processes.length).toFixed(2), "#dddddd");
  displayLog("Tiempo de espera promedio: " + (waitingTime / processes.length).toFixed(2), "#dddddd");
};

const fifoScheduling = async (input) => {
  // List of all processes
  let processes = input;

  // Time
  let currentTime = 0;
  timeSpan.textContent = currentTime;

  // Enqueue all processes
  let queue = [];
  for (let i = 0; i < processes.length; i++) {
    queue.push(processes[i]);
    displayLog(`Proceso encolado: ${processes[i].id} (Llegada: ${processes[i].arrival} | Duración: ${processes[i].burst})`, "#dddddd");
    await sleep(300);
  }
  stop = false;
  // Simulate the FIFO
  while (queue.length > 0) {
    const process = queue.shift();

    // Idle time
    for (currentTime; currentTime < process.arrival; currentTime++) {
      displayLog("Esperando llegada de un nuevo proceso...", "#e39a0f");
      timeSpan.textContent = currentTime;
      await sleep(1000);
    }

    // Execute process
    for (let i = 0; i < process.burst; i++) {
      currentTime++;
      timeSpan.textContent = currentTime;
      displayLog(`Ejecutando proceso ${process.id} en tiempo: ${currentTime}`, "#dddddd");
      updateTableTop(process.id, 20, 0, 'R');
      await sleep(1000);
      if(stop) {
        currentTime++;
        timeSpan.textContent = currentTime;
        break;
      }
    }
    if(!stop) {
    displayLog(`Proceso: ${process.id} terminado en tiempo ${currentTime}`, "#08967e");
    }
    stop = false;
    updateTableTop(process.id, 20, 0, 'Z', -1);
  }

  // Display status
  if (queue.length === 0)
    displayLog(`Todos los procesos han sido ejecutados`, "#dddddd");
  else displayLog(`La cola no se ha vaciado completamente`, "#dddddd");

  // Update time
  timeSpan.textContent = currentTime;
};

const rrScheduling = async (input) => {
  // List of all processes
  let processes = input;

  // Sort processes based on arrival time
  processes.sort((a, b) => a.arrival - b.arrival);

  // Variables
  let totalTime = 0;
  let quantum = 0;
  while (quantum <= 0) {
    const input = prompt("Ingresa el valor de quantum:");
    quantum = parseInt(input);
  
    if (isNaN(quantum) || quantum <= 0) {
      alert("Por favor, ingresa un número válido mayor a 0.");
    }
  }

  // Time
  let currentTime = 0;
  timeSpan.textContent = currentTime;

  // Sum their bursts
  processes.forEach((process) => {
    totalTime += process.burst;
  });

  // While there's still total time remaining
  while (totalTime > 0) {
    for (let i = 0; i < processes.length; i++) {

      // Wait for a process to arrive
      for (currentTime; currentTime < processes[i].arrival; currentTime++) {
        displayLog("Esperando llegada de un nuevo proceso...", "#e39a0f");
        timeSpan.textContent = currentTime;
        await sleep(1000);
      }

      // New process
      displayLog(`Proceso a ejecutar: ${processes[i].id}`, "#dddddd");
      timeSpan.textContent = currentTime;

      if (processes[i].burst > 0) {
        // Execute process
        for (let j = 0; j < processes[i].burst && j < quantum; j++) {
          currentTime++;
          timeSpan.textContent = currentTime;
          displayLog(`Ejecutando el proceso ${processes[i].id} durante el quantum de duración: ${quantum}`, "#dddddd");
          updateTableTop(processes[i].id, 20, 0, 'R');
          await sleep(1000);
          if(stop) {
            currentTime++;
            timeSpan.textContent = currentTime;
            break;
          }
        }

        // Finished or not
        if (processes[i].burst <= quantum || stop) {
          if(!stop) {
            displayLog(`Proceso: ${processes[i].id} terminado en tiempo ${currentTime}`, "#08967e");
          }
          updateTableTop(processes[i].id, 20, 0, 'Z', -1);
          totalTime -= processes[i].burst;
          processes[i].burst = 0;
        } else {
          displayLog(`Proceso: ${processes[i].id} parcialmente terminado`, "#e39a0f");
          updateTableTop(processes[i].id, 20, 0, 'S', -1);
          totalTime -= quantum;
          processes[i].burst -= quantum;
        }
          stop = false;

        displayLog("--- Nuevo Quantum ---", "#4790d2");
      }
    }
  }

  // End
  displayLog("Todos los procesos han finalizado", "#dddddd");
};

const sjfScheduling = async (input) => {
  // List of all processes
  let processes = input;

  // Length of the processes
  let processesLength = input.length;

  // Sort processes based on arrival time and burst time
  processes.sort((a, b) => {
    if (a.arrival === b.arrival) {
      return a.burst - b.burst;
    }
    return a.arrival - b.arrival;
  });

  // Time
  let currentTime = 0;
  timeSpan.textContent = currentTime;

  // Variables
  let waitingTime = 0;
  let turnAroundTime = 0;
  stop = false;
  // Execute the processes in SJF order
  while (processes.length > 0) {
    // Filter processes with arrival time less or equal to current time
    let availableProcesses = processes.filter(
      (process) => process.arrival <= currentTime
    );

    // Sort available processes based on burst time and process ID
    availableProcesses.sort((a, b) => {
      if (a.burst === b.burst) {
        return a.id - b.id;
      }
      return a.burst - b.burst;
    });

    if (availableProcesses.length > 0) {
      let process = availableProcesses[0];

      // Calculate waiting time
      let processWaitingTime = currentTime - process.arrival;
      waitingTime += processWaitingTime;

      // Calculate turnaround time
      let processTurnAroundTime = processWaitingTime + process.burst;
      turnAroundTime += processTurnAroundTime;

      displayLog(`Ejecutando proceso: ${process.id}`, "#dddddd");
  
      // Execute process
      for (let i = 0; i < process.burst; i++) {
        currentTime++;
        timeSpan.textContent = currentTime;
        displayLog(`Ejecutando proceso ${process.id} en tiempo: ${currentTime}`, "#dddddd");
        updateTableTop(process.id, 20, 0, 'R');
        await sleep(1000);
        if(stop) {
          currentTime++;
          timeSpan.textContent = currentTime;
          break;
        }
      }
      if(!stop) {
        displayLog(`Proceso: ${process.id} terminado en tiempo ${currentTime}`, "#08967e");
      }
      stop = false;
      updateTableTop(process.id, 20, 0, 'Z', -1);

      // Remove executed process from list
      processes.splice(processes.indexOf(process), 1);
    } else {
      // If no process is available, increase the current time
      currentTime++;
      timeSpan.textContent = currentTime;
      displayLog("Esperando llegada de un nuevo proceso...", "#e39a0f");
      await sleep(1000);
    }
  }

  // Display stats
  displayLog("Tiempo de retorno promedio: " + (turnAroundTime / processesLength).toFixed(2), "#dddddd");
  displayLog("Tiempo de espera promedio: " + (waitingTime / processesLength).toFixed(2), "#dddddd");

  // Update time
  timeSpan.textContent = currentTime;
};

const srtScheduling = async (input) => {
  // List of all processes
  // Creates a new array processes by cloning each object from the input array.
  let processes = input.map((process) => ({ ...process }));

  // Time
  let currentTime = 0;
  timeSpan.textContent = currentTime;

  // Variables
  let completedProcesses = 0;
  let totalTurnaroundTime = 0;
  stop = false;
  // Simulate SRT
  while (completedProcesses < processes.length) {
    let shortestTime = Infinity;
    let shortestIndex = -1;

    // Find the processes with the shortest remaining time
    for (let i = 0; i < processes.length; i++) {
      if (
        processes[i].arrival <= currentTime &&
        processes[i].burst < shortestTime &&
        processes[i].burst > 0
      ) {
        shortestTime = processes[i].burst;
        shortestIndex = i;
      }
    }

    if (shortestIndex === -1) {
      currentTime++;
      timeSpan.textContent = currentTime;
      displayLog("Esperando un proceso disponible...", "#e39a0f");
      await sleep(1000);
      continue;
    }

    // Execute the process for 1 time unit
    processes[shortestIndex].burst--;
    currentTime++;
    timeSpan.textContent = currentTime;
    displayLog(`Ejecutando proceso: ${processes[shortestIndex].id} en tiempo ${currentTime}`, "#dddddd");
    updateTableTop(processes[shortestIndex].id, 20, 0, 'R');
    await sleep(1000);
  
    if(stop) {
      currentTime++;
      timeSpan.textContent = currentTime;
      processes[shortestIndex].burst = 0;
    }
    // Check if the process is completed
    if (processes[shortestIndex].burst === 0) {
      completedProcesses++;
      processes[shortestIndex].completionTime = currentTime;
      if(!stop) {
        displayLog(`Proceso: ${processes[shortestIndex].id} terminado`, "#08967e");
        totalTurnaroundTime += processes[shortestIndex].completionTime - processes[shortestIndex].arrival;
      }
      updateTableTop(processes[shortestIndex].id, 20, 0, 'Z', -1);
      timeSpan.textContent = processes[shortestIndex].completionTime;
    }
    stop = false;
  }

  // Display stats
  displayLog("Tiempo de retorno promedio: " + (totalTurnaroundTime / processes.length).toFixed(2), "#dddddd");

  // Update time
  timeSpan.textContent = currentTime;
};

const hrrnScheduling = async (input) => {
  // List of all processes
  let processes = input;

  // Queue, elements who have already arrived
  let queue = [];
  let numProcesses = processes.length;
  let done = 0;
  stop = false;
  // Time
  let currentTime = 0;
  timeSpan.textContent = currentTime;

  // Simulate HRRN
  while (done != numProcesses) {
    // See if new processes have arrived, add them to queue if so
    for (let i = 0; i < numProcesses; i++) {
      if (processes[i].arrival <= currentTime && processes[i].status == 0) {
        queue.push(processes[i]);
        processes[i].status = 1;
        displayLog(`Llegó proceso: ${processes[i].id}`, "#dddddd");
      }
    }

    // Check if there are any processes on the queue
    // If not, continue
    if (queue.length == 0) {
      displayLog("Cola vacía, esperando un nuevo proceso...", "#e39a0f");
      currentTime++;
      timeSpan.textContent = currentTime;
      await sleep(1000);
      continue;
    }

    // If there is only one process, execute it
    if (queue.length == 1) {
      for (let i = 0; i < queue[0].burst; i++) {
        currentTime++;
        timeSpan.textContent = currentTime;
        displayLog(`Ejecutando proceso ${queue[0].id} en tiempo: ${currentTime}`, "#dddddd");
        updateTableTop(queue[0].id, 20, 0, 'R');
        await sleep(1000);
        if(stop) {
          currentTime++;
          timeSpan.textContent = currentTime;
          break;
        }
      }
      displayLog(`Proceso: ${queue[0].id} terminado en tiempo ${currentTime}`, "#08967e");
      updateTableTop(queue[0].id, 20, 0, 'Z', -1);

      // Dequeue element
      queue.pop();
      done++;
      continue;
    }

    // If there are more than one processes queued up, find next
    if (queue.length > 1) {
      // Find next process
      let nextP = queue[0];
      let maxRR = (currentTime - queue[0].arrival + queue[0].burst) / queue[0].burst;

      for (let i = 1; i < queue.length; i++) {
        let RR = (currentTime - queue[i].arrival + queue[i].burst) / queue[i].burst;
        if (RR > maxRR) {
          maxRR = RR;
          nextP = queue[i];
        }
      }
      displayLog(`Siguiente proceso: ${nextP.id} con RR ${(maxRR).toFixed(2)}`, "#dddddd");
      await sleep(1000);

      // Execute process
      for (let i = 0; i < nextP.burst; i++) {
        currentTime++;
        timeSpan.textContent = currentTime;
        displayLog(`Ejecutando proceso ${nextP.id} en tiempo: ${currentTime}`, "#dddddd");
        updateTableTop(nextP.id, 20, 0, 'R');
        await sleep(1000);
        if(stop) {
          currentTime++;
          timeSpan.textContent = currentTime;
          break;
        }
      }
      if(!stop) {
        displayLog(`Proceso: ${nextP.id} terminado en tiempo ${currentTime}`, "#08967e");
        stop = false;
      }
      updateTableTop(nextP.id, 20, 0, 'Z', -1);
      done++;

      // Remove process from queue
      let index = queue.indexOf(nextP);
      queue.splice(index, 1);
    }
  }

  // Done
  displayLog("Todos los procesos han sido ejecutados", "#dddddd");
};

const mfqScheduling = async (input) => {
  // List of all processes
  let processes = input;
  stop = false;
  // Sort algorithms by arrival time
  for (let i = 0; i < processes.length - 1; i++) {
    for (let j = 0; j < processes.length - 1; j++) {
      if (processes[j].arrival > processes[j + 1].arrival) {
        let temp = processes[j];
        processes[j] = processes[j + 1];
        processes[j + 1] = temp;
      }
    }
  }

  // Set remaining time as burst time
  for (let i = 0; i < processes.length; i++) {
    processes[i].remaining = processes[i].burst;
    processes[i].priority = 1;
  }

  // Define priority queues
  let q1 = []; // Al processes begin in the first queue
  let q2 = [];
  let q3 = [];

  let currentTime = 0;

  // Quantum
  let quantum = 0;
  while (quantum <= 0) {
    const input = prompt("Ingresa el valor de quantum:");
    quantum = parseInt(input);
  
    if (isNaN(quantum) || quantum <= 0) {
      alert("Por favor, ingresa un número válido mayor a 0.");
    }
  }
   
  // Repeat until all processes are completed
  while(!(q1.length === 0 && q2.length === 0 && q3.length === 0) || processes.length > 0) {
    // For every unit of time, check if new processes have arrived
    if(processes.length > 0 && currentTime <= processes[0].arrival) {
      // New processes are added to q1 always
      q1.push(processes[0]);
      processes.shift();
    }
    // First queue is emptied first
    if(q1.length !== 0) {
      // Apply round robin, run each process for a quantum and move to next queue if not done
      while(q1.length > 0) {
        // Execute algorithm for quantum time
        displayLog("Ejecutando proceso: " + q1[0].id, "#dddddd");
          for(let j = 0; j < quantum; j++) {
            displayLog("Ejecutando proceso en tiempo " + currentTime, "#dddddd");
            updateTableTop(q1[0].id, 20-q1[0].priority, q1[0].priority, 'R');
            q1[0].remaining -= 1;
            currentTime += 1;
            // For every unit of time, check if new processes have arrived
            if(processes.length > 0 && currentTime <= processes[0].arrival) {
              // New processes are added to q1 always
              q1.push(processes[0]);
              processes.shift();
            }
            timeSpan.textContent = currentTime;
            await sleep(1000);
            if(q1[0].remaining === 0) {
              displayLog("Proceso " + q1[0].id + " terminado en tiempo: " + currentTime, "#08967e");
              updateTableTop(q1[0].id, 20-q1[0].priority, q1[0].priority, 'Z', -1);
              break;
            }
            // Check for interruptions
            if(stop) {
              currentTime++;
              timeSpan.textContent = currentTime;
              // Stop execution
              break;
            }
          }
        // If process is not done, move to next queue
        if(q1[0].remaining > 0) {
          if(!stop) {
            displayLog("Tiempo restante para el proceso " + q1[0].id + ": " + q1[0].remaining, "#e39a0f");
            updateTableTop(q1[0].id, 20-q1[0].priority, q1[0].priority, 'S', -1);
            q1[0].priority = 2;
            q2.push(q1[0]); 
          }
          else {
            stop = false;
          }
        }
        // Remove from queue
        q1.shift();
      }
    }   
    // Second queue is emptied Second
    else if(q2.length != 0) {
      // Apply round robin, run each process for a quantum and move to next queue if not done
      while(q2.length > 0) {
        // Execute algorithm for quantum time
        displayLog("Ejecutando proceso: " + q2[0].id, "#dddddd");
        for(let j = 0; j < quantum; j++) {
          displayLog("Ejecutando proceso en tiempo " + currentTime, "#dddddd");
          updateTableTop(q2[0].id, 20-q2[0].priority, q2[0].priority, 'R');
          q2[0].remaining -= 1;
          currentTime += 1;// For every unit of time, check if new processes have arrived
          if(processes.length > 0 && currentTime <= processes[0].arrival) {
            // New processes are added to q1 always
            q1.push(processes[0]);
            processes.shift();
          }
          timeSpan.textContent = currentTime;
          await sleep(1000);
          if(q2[0].remaining === 0) {
            displayLog("Proceso " + q2[0].id + " terminado en tiempo: " + currentTime, "#08967e");
            updateTableTop(q2[0].id, 20-q2[0].priority, q2[0].priority, 'Z', -1);
            break;
          }
          // Check for interruptions
          if(stop) {
            currentTime++;
            timeSpan.textContent = currentTime;
            // Stop execution
            break;
          }
        }
        // If process is not done, move to next queue
        if(q2[0].remaining > 0) {
          if(stop) {
            displayLog("Tiempo restante para el proceso " + q2[0].id + ": " + q2[0].remaining, "#e39a0f");
            updateTableTop(q2[0].id, 20-q2[0].priority, q2[0].priority, 'S', -1);
            q2[0].priority = 3;
            q3.push(q2[0]); 
          }
          else {
            stop = false;
          }
        }
        // Remove from queue
        q2.shift();
      }
    }
    // Third queue is emptied last
    else if(q3.length != 0) {
      // Apply FCFS to deal with remaining processes
      while(q2.length > 0) {
        displayLog("Ejecutando proceso: " + q3[0].id);
        for(let j = 0; j < q3[0].burst; j++) {
          displayLog("Ejecutando proceso en tiempo " + currentTime, "#dddddd");
          updateTableTop(q3[0].id, 20-q3[0].priority, q3[0].priority, 'R');
          currentTime += 1;// For every unit of time, check if new processes have arrived
          if(processes.length > 0 && currentTime <= processes[0].arrival) {
            // New processes are added to q1 always
            q1.push(processes[0]);
            processes.shift();
          }
          timeSpan.textContent = currentTime;
          q3[0].remaining -= 1;
          await sleep(1000);
          if(q3[0].remaining === 0) {
            displayLog("Proceso " + q3[0].id + " terminado en tiempo: " + currentTime, "#08967e");
            updateTableTop(q3[0].id, 20-q3[0].priority, q3[0].priority, 'Z', -1);
            break;
          }
          // Check for interruptions
          if(stop) {
            currentTime++;
            timeSpan.textContent = currentTime;
            // Stop execution
            stop = false;
            break;
          }
        }
        q3.shift();
      }
    }
    currentTime++;
    timeSpan.textContent = currentTime;
    await sleep(1000);
  }
};

const lruPageReplacement = async (input) => {
  // Initialize cache
  // The cache used will be able to store 3 memory addresses at the same time
  // Initialize with -1 to be able to access addresses directly
  let pages = input;
  let cache = [-1, -1, -1];
  let faults = 0;
  let hits = 0;
  for(let i = 0; i < pages.length; i++) {
    // Parse digit from string to base 10 int
    let page = parseInt(pages[i], 10);

    // Check if page is included in cache
    if(cache[0] === page || cache[1] === page || cache[2] === page) {
      // Page found, this is a hit
      hits++;
      displayLog("Página " + page + " encontrada en cache", "#08967e");
    }
    else {
      // If not found, implement LRU
      faults++; 
      displayLog("Página " + page + " no encontrada en cache", "#e39a0f");
      // Check if cache is empty
      if(cache[0] === -1) {
        cache[0] = page;
        displayLog("Página " + page + " guardada en cache", "#dddddd");
        displayLog("Cache actual: " + cache[0] + " " + cache[1] + " " + cache[2], "#dddddd");
      }

      else if(cache[1] === -1) {
        cache[1] = page;
        displayLog("Página " + page + " guardada en cache", "#dddddd");
        displayLog("Cache actual: " + cache[0] + " " + cache[1] + " " + cache[2], "#dddddd");
      }

      else if(cache[2] === -1) {
        cache[2] = page;
        displayLog("Página " + page + " guardada en cache", "#dddddd");
        displayLog("Cache actual: " + cache[0] + " " + cache[1] + " " + cache[2], "#dddddd");
      }

      // If not empty, find least recently used
      else {
        displayLog("Cache no vacío: ejecutar LRU", "#dddddd");
        let indexes = new Map();
        let found = 0;
        let j = i-1; // Index to check the string backwards
        //  Look for the indexes of addresses in cache
        while(found !== 3 && j > -1) {
          // Check for first address 
          if(pages[j] == cache[0] && !indexes.has(cache[0])) {
            indexes.set(cache[0], j);
            found++;
          }
          else if(pages[j] == cache[1] && !indexes.has(cache[1])) {
            indexes.set(cache[1], j);
            found++;
          }
          else if(pages[j] == cache[2] && !indexes.has(cache[2])) {
            indexes.set(cache[2], j);
            found++;
          }
          j--;
        }
        // Find least recently used
        let minV = indexes.get(cache[0]);
        let minK = cache[0];
        for(j = 1; j < 3; j++) {
          if(indexes.get(cache[j]) < minV) {
            minV = indexes.get(cache[j]);
            minK = cache[j];
          }
        }
        displayLog("LRU: " + minK, "#dddddd")
        // Replace LRU with newest page
        cache[cache.indexOf(minK)] = page;
        displayLog("Reemplazando " + minK + " con " + page, "#dddddd");

        displayLog("Cache actual: " + cache[0] + " " + cache[1] + " " + cache[2], "#4790d2");
      }
    }

    // Wait
    await sleep(1000);
    timeSpan.textContent = +timeSpan.textContent + 1;
  }
  displayLog("Page faults: " + faults, "#08967e");
};

 
// Object containing all algorithms
const algorithms = {
  scheduling: {
    fcfs: fcfsScheduling,
    fifo: fifoScheduling,
    rr: rrScheduling,
    sjf: sjfScheduling,
    srt: srtScheduling,
    hrrn: hrrnScheduling,
    mfq: mfqScheduling,
  },
  pageReplacement: {
    lru: lruPageReplacement,
  },
};

// Initial setup
typeSelector.dispatchEvent(new Event("change"));
algorithmSelector.dispatchEvent(new Event("change"));
