// Get elements
const typeSelector = document.getElementById("type");
const algorithmSelector = document.getElementById("algorithm");

// Create elements
const fcfs = document.createElement("option");
fcfs.value = "fcfs";
fcfs.text = "First Come First Serve";
const fifo = document.createElement("option");
fifo.value = "fifo";
fifo.text = "First In First Out";
const rr = document.createElement("option");
rr.value = "rr";
rr.text = "Round Robin";
const sjf = document.createElement("option");
sjf.value = "sjf";
sjf.text = "Shortest Job First";
const srt = document.createElement("option");
srt.value = "srt";
srt.text = "Shortest Remaining Time";
const hrrn = document.createElement("option");
hrrn.value = "hrrn";
hrrn.text = "Highest Response-Ratio Next";
const mfq = document.createElement("option");
mfq.value = "mfq";
mfq.text = "Multilevel Feedback Queues";
const lru = document.createElement("option");
lru.value = "lru";
lru.text = "Least Recently Used";
const lfu = document.createElement("option");
lfu.value = "lfu";
lfu.text = "Least Frequently Used";
const nru = document.createElement("option");
nru.value = "nru";
nru.text = "Not Recently Used";
const rpo = document.createElement("option");
rpo.value = "rpo";
rpo.text = "Reemplazo de Página Optimal";

// Show different algorithms depending on the selector type 
const setAlgorithms = () => {
    // Remove all options
    Array.from(algorithmSelector.options).forEach(option => {
        algorithmSelector.remove(option.index);
    });

    // Add new options
    if (typeSelector.value == "scheduling") {
        algorithmSelector.add(fcfs);
        algorithmSelector.add(fifo);
        algorithmSelector.add(rr);
        algorithmSelector.add(sjf);
        algorithmSelector.add(srt);
        algorithmSelector.add(hrrn);
        algorithmSelector.add(mfq);
    } else {
        algorithmSelector.add(fcfs);
        algorithmSelector.add(lru);
        algorithmSelector.add(lfu);
        algorithmSelector.add(nru);
        algorithmSelector.add(rpo);
    }
    fcfs.selected = true;
}

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
