"use strict";
// Since Javascript doesnot have a built-in heap, I am using a library implementation of heap. If necessary I can also write a simple min-heap implementation in JS.

// https://www.npmjs.com/package/heap-js - Popular JS heap library

const { Heap } = require("heap-js");

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  // Since we need to heapify comparing the dates, we create a custom compare function
  const customComparator = (a, b) => a.entry.date - b.entry.date;
  const heap = new Heap(customComparator);

  // Populating the heap with the first log entry from each source
  logSources.forEach((source, index) => {
    const entry = source.pop();
    if (entry) {
      heap.push({ entry, sourceIndex: index });
    }
  });

  // Process entries in the heap until all sources are exhausted
  while (!heap.isEmpty()) {
    // Extract the earliest log entry from top of the heap
    const { entry, sourceIndex } = heap.pop();
    printer.print(entry);
    //console.log("SOURCE INDEX : ", sourceIndex);

    // Fetch the next entry 
    const nextEntry = logSources[sourceIndex].pop();
    if (nextEntry) {
      heap.push({ entry: nextEntry, sourceIndex });
    }
  }

  // Print out stats.
  console.log("SYNC STATS: ")
  printer.done();
};
