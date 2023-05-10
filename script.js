// Get elements
const typeSelector = document.getElementById("type");
const algorithmSelector = document.getElementById("algorithm");
const visualizationDiv = document.getElementById("visualization");
const timeSpan = document.getElementById("time-counter");
const algorithmsForm = document.getElementById("algorithms-form");
const submitButton = document.getElementById("submit-button");
const interruptButtons = document.querySelectorAll(".interrupt-button");

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
  { value: "lru", text: "Least Recently Used" },
  { value: "lfu", text: "Least Frequently Used" },
  { value: "nru", text: "Not Recently Used" },
];

// Show different algorithms depending on the selector type 
const setAlgorithms = () => {
  // Remove all options
  algorithmSelector.innerHTML = "";

  // Add new options
  const algorithms = typeSelector.value === "scheduling"
    ? schedulingAlgorithms
    : pageReplacementAlgorithms;

  algorithms.forEach(algorithm => {
    const option = document.createElement("option");
    option.value = algorithm.value;
    option.text = algorithm.text;
    algorithmSelector.add(option);
  });
};

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

  // Run the function
  clearLogs();
  const selectedFunction = algorithms[typeSelector.value][algorithmSelector.value];
  try {
    await selectedFunction();
  } catch (error) {  // If interrupted
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

// Sleep function to delay algorithms by milliseconds
const sleep = ms => {
  // If interrupted, throw an error, else wait ms
  if (stop.value) {
    throw new Error(stop.type);
  } else {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class Process {
  constructor(id, arrival, burst, status) {
    this.id = id;
    this.arrival = arrival;
    this.burst = burst;
    this.status = status;
  }
}

// Global variables
let currentTime = 0;
let stop = {
  value: false,
  type: null
};

const fcfsScheduling = async () => console.log('0');
const fifoScheduling = async () => console.log('1');
const rrScheduling = async () => console.log('2');
const sjfScheduling = async () => console.log('3');
const srtScheduling = async () => console.log('4');

const hrrnScheduling = async () => {
  // List of all processes
  let processes = [
    new Process(1, 0, 3, 0),
    new Process(2, 2, 5, 0),
    new Process(3, 4, 4, 0),
    new Process(4, 6, 1, 0),
    new Process(5, 8, 2, 0),
    new Process(6, 8, 2, 0)
  ];

  // Queue, elements who have already arrived
  let queue = [];
  let numProcesses = processes.length;
  let done = 0;

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
      displayLog("Siguiente proceso: " + nextP.id + " con RR " + maxRR, "#dddddd");
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

const mfqScheduling = async () => console.log('6');
const lruPageReplacement = async () => console.log('8');
const lfuPageReplacement = async () => console.log('9');
const nruPageReplacement = async () => console.log('10');

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
    lru: lruPageReplacement,
    lfu: lfuPageReplacement,
    nru: nruPageReplacement
  }
}
