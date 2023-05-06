// Get elements
const typeSelector = document.getElementById("type");
const algorithmSelector = document.getElementById("algorithm");

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
    { value: "fcfs", text: "First Come First Serve" },
    { value: "lru", text: "Least Recently Used" },
    { value: "lfu", text: "Least Frequently Used" },
    { value: "nru", text: "Not Recently Used" },
    { value: "rpo", text: "Reemplazo de Página Optimal" },
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
  
    algorithmSelector.value = "fcfs";
};

function Process(id, arrival, burst, status) {
    this.id = id;
    this.arrival = arrival;
    this.burst = burst;
    this.status = status;
}

// List of all processes
let processes =[
    new Process(0, 0, 3, 0),
    new Process(1, 2, 5, 0),
    new Process(2, 4, 4, 0),
    new Process(3, 6, 1, 0),
    new Process(4, 8, 2, 0)
];

// Queue, elements who have already arrived
let queue = [];

let currentTime = 0;
let numProcesses = processes.length;
let done = 0;

while(done != numProcesses) {
   
    // document.getElementById('currentTime').innerHTML = currentTime;

    // See if new processes have arrived
    // Add them to queue if so
    for(let i = 0; i < numProcesses; i++) {
        if(processes[i].arrival <= currentTime && processes[i].status == 0) {
            queue.push(processes[i]);
            processes[i].status = 1;
            console.log("Llego proceso: ", processes[i].id);
            console.log("Tiempo de llegada: ", processes[i].arrival);
        }
    }

    // Check if there are any processes on the queue
    // If not, continue
    if(queue.length == 0) {
        console.log("Cola vacia");
        currentTime += 1;
        continue;
    }

    // If there is only one process, execute it
    if(queue.length == 1) {
        console.log("-- Se ejecuto el proceso: ", queue[0].id, "--");
        currentTime += queue[0].burst;
        queue.pop();
        done += 1;
        continue;
    }

    // If there are more than one processes queued up, find next
    if(queue.length > 1) {
        
        // Find next process
        let nextP = queue[0];
        let maxRR = ((currentTime-queue[0].arrival)+queue[0].burst)/queue[0].burst;

        for(let i = 1; i < queue.length; i++) {
            let RR = ((currentTime-queue[i].arrival)+queue[i].burst)/queue[i].burst;
            if(RR > maxRR) {
                maxRR = RR;
                nextP = queue[i];
            }
        }
        console.log("Siguiente proceso: ", nextP.id, " con RR ", maxRR); 
        console.log("Tiempo actual: ", currentTime);
        // document.getElementById('currentTime').innerHTML = currentTime;
        // Execute process
        currentTime += nextP.burst;
        done += 1;
        
        // Remove process from queue
        let index = queue.indexOf(nextP);
        queue.splice(index, 1);
    }
}
