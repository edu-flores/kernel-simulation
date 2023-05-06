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