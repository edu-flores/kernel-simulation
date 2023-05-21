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

const schedulingAlgorithms = [
  { value: "fcfs", text: "First Come First Serve" },
  { value: "fifo", text: "First In First Out" },
  { value: "rr", text: "Round Robin" },
  { value: "sjf", text: "Shortest Job First" },
  { value: "srt", text: "Shortest Remaining Time" },
  { value: "hrrn", text: "Highest Response-Ratio Next" },
  { value: "mfq", text: "Multilevel Feedback Queues" }
];

const pageReplacementAlgorithms = [
  { value: "lru", text: "Least Recently Used" }
];

// Show different algorithms depending on the selector type 
const setAlgorithms = event => {
  // Remove all options
  algorithmSelector.innerHTML = "";

  // Add new options
  const algorithms = event.target.value === "scheduling"
    ? schedulingAlgorithms
    : pageReplacementAlgorithms;

  algorithms.forEach(algorithm => {
    const option = document.createElement("option");
    option.value = algorithm.value;
    option.text = algorithm.text;
    algorithmSelector.add(option);
  });

  // Dispatch change event to set input properties
  algorithmSelector.dispatchEvent(new Event('change'));
}

// Set custom user inputs
const setInputs = event => {
  // Set number of properties in the table
  let properties = ["ID"];
  switch (event.target.value) {
    case "fcfs":
      properties.push("Arrival", "Burst");
      break;
    case "fifo":
      properties.push("Arrival", "Burst");
      break;
    case "rr":
      properties.push("Burst");
      break;
    case "sjf":
      properties.push("Arrival", "Burst");
      break;
    case "srt":
      properties.push("Arrival", "Burst");
      break;
    case "hrrn":
      properties.push("Arrival", "Burst");
      break;
    case "mfq":
      properties.push("Arrival", "Burst", "Priority", "Remaining");
      break;
    case "lru":
      properties.push("Atributo #1", "Atributo #2", "Atributo #3", "Atributo #4");
      break;
  }

  // Set table columns names
  headersRow.innerHTML = "";
  properties.forEach(property => {
    const th = document.createElement("th");
    th.innerHTML = property;
    headersRow.appendChild(th);
  });

  // Set input elements
  properties.shift();
  Array.from(inputsRow).forEach((row, index) => {
    // Add ID
    row.innerHTML = `<td>${index+1}</td>`;

    // Add inputs
    properties.forEach(() => {
      row.innerHTML += `<td><input type="number" min="0" value=${Math.floor(Math.random()*9)+1} ${index < 4 ? '' : 'disabled'} oninput="if (event.target.value == '') { event.target.value = '0'; }" onkeypress="return event.charCode != 45"></td>`;
    });

    // Add checkbox
    row.innerHTML += `<td><input type="checkbox" onchange="modifyInputs(event)" ${index < 4 ? 'checked' : ''}></td>`;
  });
}

// Enable or disable inputs on each row
const modifyInputs = event => {
  // Get all inputs from that row
  const row = event.target.closest("tr");
  const inputs = row.querySelectorAll("input[type=number]"); 

  // Enable or disable them
  inputs.forEach(input => {
    input.disabled = !event.target.checked;
  });
}

// Read time units from a file
const readTime = event => {
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
  }
}

// Show in console
const displayLog = (text, color) => {
  const p = document.createElement("p");
  p.style.color = color;
  p.appendChild(document.createTextNode(text));
  visualizationDiv.appendChild(p);
}

// Clear console
const clearLogs = () => {
  visualizationDiv.innerHTML = "";
}

/**
  *
  * ALGORITHMS 
  * 
  */

// Execute the selected algorithm
const run = async (event) => {
  // Prevent page reloading
  event.preventDefault();

  // Disable and enable start & stop buttons
  submitButton.disabled = true;
  interruptButtons.forEach(button => {
    button.disabled = false;
  });

  // Select the desired function
  clearLogs();
  const selectedFunction = algorithms[typeSelector.value][algorithmSelector.value];
  
  // Run the function
  try {
    // Prepare inputs
    const properties = Array.from(headersRow.querySelectorAll("th")).slice(1);
    const userInputs = [];
    let current;

    // For every input row, get every input type number value
    Array.from(inputsRow).forEach((row, i) => {

      // Check if the process is enabled or disabled
      if (row.querySelector("input[type=checkbox]").checked) {
        current = new Process({});
        current.id = i + 1;

        // Add properties from inputs
        Array.from(row.querySelectorAll("input[type=number]")).forEach((input, j) => {
          current[properties[j].innerHTML.toLowerCase()] = parseInt(input.value);
        });

        // Push that process
        userInputs.push(current);
      }
    });

    // Run algorithm
    await selectedFunction(userInputs);
  } catch (error) {
    // Return to defaults
    stop.value = false;
    stop.type = null;

    // Get all messages to display
    let messages = [];
    switch (error.message) {
      case "io":
        messages.push("Leyendo archivo de entrada 'datos.txt'...");
        messages.push("Procesando datos...");
        messages.push("Escritura de resultados en archivo 'resultados.txt'...");
        messages.push("Operación de I/O completada correctamente.");
        break;
      case "normal":
        messages.push("Proceso finalizado correctamente.");
        messages.push("Tiempo de ejecución: 00:02:35");
        messages.push("Memoria utilizada: 256 MB");
        break;
      case "date":
        messages.push("Ingrese la fecha en el formato YYYY-MM-DD: 2023-05-09");
        break;
      case "error":
        messages.push("¡Error! Se ha producido una excepción en el archivo 'script.js', línea 157.");
        messages.push("Mensaje de error: 'ZeroDivisionError: division by zero'");
        break;
      case "quantum":
        messages.push("Interrupción por quantum expirado.");
        messages.push("Asignando CPU a proceso de mayor prioridad...");
        break;
      case "zombie":
        messages.push("Se ha detectado un proceso zombi.");
        messages.push("Eliminando entrada de la tabla de procesos...");
        break;
      case "end":
        messages.push("Proceso detenido por señal SIGKILL (-9).");
        messages.push("Liberando memoria y otros recursos asociados...");
        break;
    }

    // Display messages in visualization box
    for (const message of messages) {
      displayLog(message, "#d13079");
    }
  }

  // Disable and enable start & stop buttons
  submitButton.disabled = false;
  interruptButtons.forEach(button => {
    button.disabled = true;
  });
}

// Stop any running algorithms
const interrupt = error => {
  stop.value = true;
  stop.type = error;
}

// Interruptions object
let stop = {
  value: false,
  type: null
};

// Sleep function to delay algorithms by milliseconds
const sleep = ms => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (stop.value) {
        reject(new Error(stop.type));
        timeSpan.textContent = parseInt(timeSpan.textContent) + 1;
      } else {
        resolve();
      }
    }, ms);
  });
}

// Process class with optional properties
class Process {
  constructor({ id=0, arrival=0, burst=0, status=0, priority=0, remaining=0, waiting=0, turnaround=0 }) {
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
  processes.sort((a,b) => a.arrival - b.arrival);

  // Simulate the FCFS
  let currentTime = 0;
  let waitingTime = 0;
  let turnAroundTime = 0;

  for (let i = 0; i < processes.length; i++) {
    let process = processes[i];
    
    if (currentTime < process.arrival) {
      currentTime = process.arrival;
    }

    // Calculate waiting time
    waitingTime += currentTime - process.arrival;

    // Calculate turnaround time
    turnAroundTime += currentTime + process.burst - process.arrival;

    displayLog(`Llego proceso: ${process.id}`, "#dddddd");
    displayLog(`Tiempo de llegada: ${currentTime}`, "#dddddd");
    displayLog(`-- Se ejecuto el proceso: ${process.id} --`, "#dddddd");
    currentTime += process.burst;
    timeSpan.textContent = currentTime;
    await sleep(1000);
  }
  displayLog("Tiempo actual: " + currentTime, "#dddddd");
  displayLog("Promedio tiempo de retorno: " + (turnAroundTime / processes.length).toFixed(2), "#dddddd");
  displayLog("Promedio tiempo de espera: " + (waitingTime / processes.length).toFixed(2), "#dddddd");
  timeSpan.textContent = currentTime;
}

const fifoScheduling = async (input) => {
  // List of all processes
  let processes = input;

  let queue = [];

  for (let i = 0; i < processes.length; i++) {
    queue.push(processes[i]);
    displayLog(`Proceso encolado: ${processes[i].id} (Llegada: ${processes[i].arrival}, Duración: ${processes[i].burst})`, "#dddddd");
    await sleep(1000);
  }

  let currentTime = 0;

  while (queue.length > 0) {
    const currentProcess = queue.shift();

    if (currentProcess.arrival > currentTime) {
      const idleTime = currentProcess.arrival - currentTime;
      displayLog(`Tiempo de inactividad durante ${idleTime} unidades de tiempo`, "#dddddd");
      await sleep(1000);
      currentTime += idleTime;
    }

    displayLog(`Ejecutando proceso ${currentProcess.id} (Duración: ${currentProcess.burst} unidades de tiempo)`, "#dddddd");
    await sleep(currentProcess.burst);
    currentTime += currentProcess.burst;
    timeSpan.textContent = currentTime;

    displayLog(`Proceso ${currentProcess.id} completado. Tiempo de ejecución actual: ${currentTime}`, "#dddddd");
    await sleep(1000);
  }

  if (queue.length === 0)
    displayLog(`Todos los procesos han sido ejecutados`, "#dddddd");
  else
    displayLog(`La cola no se ha vaciado completamente`, "#dddddd");

  timeSpan.textContent = currentTime;
}

const rrScheduling = async (input) => {
  // List of all processes
  let processes = input;
  let quantum = 4;
  let totalTime = 0;
  let currentTime = 0;

  // Sum their bursts
  processes.forEach(process => {
    totalTime += process.burst;
  });

  // While there's still total time remaining
  while (totalTime > 0) {
    for (let i = 0; i < processes.length; i++) {
      if (processes[i].burst > 0) {
        await sleep(1000);
        displayLog(`Ejecutando el proceso ${processes[i].id} durante el quantum ${quantum}`, "#dddddd");
        if (processes[i].burst <= quantum) {
          currentTime += processes[i].burst;
          timeSpan.textContent = currentTime;
          totalTime -= processes[i].burst;
          processes[i].burst = 0;
        } else {
          currentTime += quantum;
          timeSpan.textContent = currentTime;
          totalTime -= quantum;
          processes[i].burst -= quantum;
        }
      }
    }
  }

  // End
  displayLog("Todos los procesos han finalizado", "#dddddd");
}

const sjfScheduling = async (input) => {
  // List of all processes
  let processes = input;

  // Length of the processes
  let processesLength = input.length;

  // Sort processes based on arrival time and burst time
  processes.sort((a,b) => {
    if(a.arrival === b.arrival) {
        return a.burst - b.burst;
    }
    return a.arrival - b.arrival;
  });

  let currentTime = 0;
  let waitingTime = 0;
  let turnAroundTime = 0;

  // Execute the processes in SJF order
  while(processes.length > 0) {
    // Filter processes with arrival time less or equal to current time
    let availableProcesses = processes.filter(process => process.arrival <= currentTime);

    // Sort available processes based on burst time and process ID
    availableProcesses.sort((a,b) => {
      if(a.burst === b.burst) {
          return a.id - b.id;
      }
      return a.burst - b.burst;
    });

    if(availableProcesses.length > 0) {
      let process = availableProcesses[0];

      // Calculate waiting time
      let processWaitingTime = currentTime - process.arrival;
      waitingTime += processWaitingTime;

      // Calculate turnaround time
      let processTurnAroundTime = processWaitingTime + process.burst;
      turnAroundTime += processTurnAroundTime;

      displayLog(`Llego proceso: ${process.id}`, "#dddddd");
      displayLog(`Tiempo de llegada: ${currentTime}`, "#dddddd");
      displayLog(`-- Se ejecuto el proceso: ${process.id} --`, "#dddddd");
      
      // Execute the process for its burst time
      currentTime += process.burst;
      timeSpan.textContent = currentTime;
      await sleep(1000);

      // Remove executed process from list
      processes.splice(processes.indexOf(process), 1);
    } else {
      // If no process is available, increase the current time
      currentTime++;
      timeSpan.textContent = currentTime;
      await sleep(1000);
    }
  }

  displayLog("Tiempo actual: " + currentTime, "#dddddd");
  displayLog("Promedio tiempo de retorno: " + (turnAroundTime / processesLength).toFixed(2), "#dddddd");
  displayLog("Promedio tiempo de espera: " + (waitingTime / processesLength).toFixed(2), "#dddddd");
  timeSpan.textContent = currentTime;
}

const srtScheduling = async (input) => {
  // List of all processes
  let processes = input;

  let currentTime = 0;
  let completedProcesses = 0;
  let totalTurnaroundTime = 0;

  while (completedProcesses < processes.length) {
    let shortestTime = Infinity;
    let shortestIndex = -1;

    // Find the processes with the shortest remaining time
    for (let i = 0; i < processes.length; i++) {
      if (processes[i].arrival <= currentTime && processes[i].burst < shortestTime && processes[i].burst > 0) {
        shortestTime = processes[i].burst;
        shortestIndex = i;
      }
    }

    if (shortestIndex == -1) {
      currentTime++;
      continue;
    }

    // Execute the process for 1 time unit
    processes[shortestIndex].burst--;
    currentTime++;

    // Check if the process is completed
    if (processes[shortestIndex].burst === 0) {
      completedProcesses++;
      processes[shortestIndex].completionTime = currentTime;
      totalTurnaroundTime += processes[shortestIndex].completionTime - processes[shortestIndex].arrival;
      displayLog("Llego proceso: " + processes[shortestIndex].id, "#dddddd");
      displayLog("Tiempo de llegada: " + processes[shortestIndex].completionTime, "#dddddd");
      timeSpan.textContent = processes[shortestIndex].completionTime;
    }
    await sleep(1000);
  }

  let avgTurnaroundTime = totalTurnaroundTime / processes.length;

  displayLog("Tiempo actual: " + currentTime, "#dddddd");
  displayLog("Promedio tiempo de retorno: " + avgTurnaroundTime, "#dddddd");
  timeSpan.textContent = currentTime;
};

const hrrnScheduling = async (input) => {
  // List of all processes
  let processes = input;

  // Queue, elements who have already arrived
  let queue = [];
  let numProcesses = processes.length;
  let done = 0;
  let currentTime = 0;

  while (done != numProcesses) {

    // See if new processes have arrived
    // Add them to queue if so
    for (let i = 0; i < numProcesses; i++) {
      if (processes[i].arrival <= currentTime && processes[i].status == 0) {
        queue.push(processes[i]);
        processes[i].status = 1;
        displayLog("Llego proceso: " + processes[i].id, "#dddddd");
        displayLog("Tiempo de llegada: " + processes[i].arrival, "#dddddd");
        await sleep(1000);
      }
    }
    // Check if there are any processes on the queue
    // If not, continue
    if (queue.length == 0) {
      displayLog("Cola vacía", "#dddddd");
      currentTime += 1;
      timeSpan.textContent = currentTime;
      continue;
    }

    // If there is only one process, execute it
    if (queue.length == 1) {
      displayLog("-- Se ejecuto el proceso: " + queue[0].id + " --", "#dddddd");
      await sleep(1000);
      currentTime += queue[0].burst;
      timeSpan.textContent = currentTime;
      queue.pop();
      done += 1;
      continue;
    }

    // If there are more than one processes queued up, find next
    if (queue.length > 1) {

      // Find next process
      let nextP = queue[0];
      let maxRR = ((currentTime-queue[0].arrival)+queue[0].burst)/queue[0].burst;

      for (let i = 1; i < queue.length; i++) {
        let RR = ((currentTime-queue[i].arrival)+queue[i].burst)/queue[i].burst;
        if (RR > maxRR) {
          maxRR = RR;
          nextP = queue[i];
        }
      }
      displayLog("Siguiente proceso: " + nextP.id + " con RR " + parseFloat(maxRR).toFixed(2), "#dddddd");
      displayLog("Tiempo actual: " + currentTime, "#dddddd");
      await sleep(1000);

      // Execute process
      currentTime += nextP.burst;
      timeSpan.textContent = currentTime;
      done += 1;

      // Remove process from queue
      let index = queue.indexOf(nextP);
      queue.splice(index, 1);
    }
  }
}

const mfqScheduling = async (input) => {
  let processes = input;

  // Sort algorithms by arrival time
  for(let i = 0; i < processes.length-1; i++){
    for(let j = 0; j < processes.length-1; j++) {
      if(processes[j].arrival > processes[j+1].arrival) {
        let temp = processes[j];
        processes[j] = processes[j+1];
        processes[j+1] = temp;
      }
    }   
  }
  
  // Set remaining time as burst time
  for(let i = 0; i < processes.length; i++) {
    processes[i].remaining = processes[i].burst;
    processes[i].priority = 1;
  }

  // Define priority queues
  let q1 = []; // Al processes begin in the first queue
  let q2 = [];
  let q3 = [];

  let currentTime = 0;

  // Quantum for each queue
  let quantum1 = 4;
  let quantum2 = 8;

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
        for(let j = 0; j < quantum1; j++) {
          displayLog("Ejecutando proceso en tiempo " + currentTime, "#dddddd");
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
            displayLog("Proceso " + q1[0].id + " terminado en tiempo: " + currentTime, "#00D100");
            break;
          }
        }
        // If process is not done, move to next queue
        if(q1[0].remaining > 0) {
          displayLog("Tiempo restante para el proceso " + q1[0].id + ": " + q1[0].remaining, "#FFFF00");
          q1[0].priority = 2;
          q2.push(q1[0]); 
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
          for(let j = 0; j < quantum2; j++) {
            displayLog("Ejecutando proceso en tiempo " + currentTime, "#dddddd");
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
              displayLog("Proceso " + q2[0].id + " terminado en tiempo: " + currentTime, "#00D100");
              break;
            }
          }
          // If process is not done, move to next queue
          if(q2[0].remaining > 0) {
            displayLog("Tiempo restante para el proceso " + q2[0].id + ": " + q2[0].remaining, "#FFFF00");
            q2[0].priority = 3;
            q3.push(q2[0]); 
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
              displayLog("Proceso " + q3[0].id + " terminado en tiempo: " + currentTime, "#00D100");
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
}

const lruPageReplacement = async () => console.log('');

// Object containing all algorithms
const algorithms = {
  scheduling: {
    fcfs: fcfsScheduling,
    fifo: fifoScheduling,
    rr: rrScheduling,
    sjf: sjfScheduling,
    srt: srtScheduling,
    hrrn: hrrnScheduling,
    mfq: mfqScheduling
  },
  pageReplacement: {
    lru: lruPageReplacement
  }
}

// Initial setup
typeSelector.dispatchEvent(new Event('change'));
algorithmSelector.dispatchEvent(new Event('change'));
