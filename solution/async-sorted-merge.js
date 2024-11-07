"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

// Since Javascript doesnot have a built-in heap, I am using a library implementation of heap. If necessary I can also write a simple min-heap implementation in JS.
// https://www.npmjs.com/package/heap-js - Popular JS heap library
const { Heap } = require("heap-js");

// we need the function to be async
module.exports = async (logSources, printer) => {
  // Custom compare function as we need to setup heap based on entry date
  const customComparator = (a, b) => a.entry.date - b.entry.date;
  const heap = new Heap(customComparator);

  // We can use Promise.all instead of multiple promises
  await Promise.all(
    logSources.map(async (source, index) => {
      // using popAsync and we need to wait for response
      const entry = await source.popAsync();
      if (entry) {
        heap.push({ entry, sourceIndex: index });
      }
    })
  );

  // Step 2: Continuously process the earliest entry from the min-heap
  while (!heap.isEmpty()) {
    // get the top entry and print it out
    const { entry, sourceIndex } = heap.pop();
    printer.print(entry);

    // get the next entry
    const nextEntry = await logSources[sourceIndex].popAsync();
    if (nextEntry) {
      heap.push({ entry: nextEntry, sourceIndex });
    }
  }
  // Print out stats
  console.log("ASYNC STATS: ")
  printer.done();
};
