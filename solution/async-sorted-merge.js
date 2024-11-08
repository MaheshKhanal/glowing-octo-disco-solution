"use strict";

const { Heap } = require("heap-js");

// I have added batch size, this can be adjusted based on requirement. However, the tradeoff is memory usage. Higher batch size can increase throughput but will use significanty more memory
const BATCH_SIZE = 100;

module.exports = async (logSources, printer) => {
  const customComparator = (a, b) => a.entry.date - b.entry.date;
  const heap = new Heap(customComparator);

  // const to store batches for each source
  const sourceBuffers = Array(logSources.length).fill(null).map(() => []);

  // Helper function to fetch a batch of entries from a source
  const fetchBatch = async (source, index) => {
    const batch = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const entry = await source.popAsync();
      if (!entry) break;
      batch.push(entry);
    }
    sourceBuffers[index].push(...batch);

    // Push the earliest entry from the batch into the heap
    if (sourceBuffers[index].length > 0) {
      heap.push({ entry: sourceBuffers[index][0], sourceIndex: index });
    }
  };

  // Initial batch fetch for each source
  await Promise.all(logSources.map((source, index) => fetchBatch(source, index)));

  // process entries
  while (!heap.isEmpty()) {
    const { entry, sourceIndex } = heap.pop();
    printer.print(entry);
   // console.log("SOURCE INDEX : ", sourceIndex)

    // we have to remove the entry after printing
    sourceBuffers[sourceIndex].shift();

    // now if the buffer is empty we fetch next batch
    if (sourceBuffers[sourceIndex].length === 0) {
      await fetchBatch(logSources[sourceIndex], sourceIndex);
    }

    // Push the next entry from this source’s buffer if its available
    if (sourceBuffers[sourceIndex].length > 0) {
      heap.push({ entry: sourceBuffers[sourceIndex][0], sourceIndex: sourceIndex });
    }
  }
  console.log("ASYNC STATS: ")
  printer.done();
};
