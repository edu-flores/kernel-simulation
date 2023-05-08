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
  { value: "fcfs", text: "First Come First Serve" },
  { value: "lru", text: "Least Recently Used" },
  { value: "lfu", text: "Least Frequently Used" },
  { value: "nru", text: "Not Recently Used" },
  { value: "rpo", text: "Reemplazo de Página Optimal" }
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

  // Select first option as default
  algorithmSelector.value = "fcfs";
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
  await selectedFunction();

  // Disable and enable start & stop buttons
  submitButton.disabled = false;
  interruptButtons.forEach(button => {
    button.disabled = true;
  });
}

// Show in console
const displayLog = text => {
  visualizationDiv.appendChild(document.createElement("p")).appendChild(document.createTextNode(text));
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

// Sleep function to delay algorithms by milliseconds
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
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
        displayLog("Llego proceso: " + processes[i].id);
        displayLog("Tiempo de llegada: " + processes[i].arrival);
        await sleep(1000);
      }
    }
    // Check if there are any processes on the queue
    // If not, continue
    if (queue.length == 0) {
      displayLog("Cola vacía");
      currentTime += 1;
      timeSpan.textContent = currentTime;
      continue;
    }

    // If there is only one process, execute it
    if (queue.length == 1) {
      displayLog("-- Se ejecuto el proceso: " + queue[0].id + " --");
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
      displayLog("Siguiente proceso: " + nextP.id + " con RR " + maxRR);
      displayLog("Tiempo actual: " + currentTime);
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
const fcfsPageReplacement = async () => console.log('7');
const lruPageReplacement = async () => console.log('8');
const lfuPageReplacement = async () => console.log('9');
const nruPageReplacement = async () => console.log('10');
const rpoPageReplacement = async () => console.log('11');

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
    fcfs: fcfsPageReplacement,
    lru: lruPageReplacement,
    lfu: lfuPageReplacement,
    nru: nruPageReplacement,
    rpo: rpoPageReplacement
  }
}
