import pLimit from "p-limit";

// Restrict to max 2 concurrent AI generations globally to prevent quota spikes
export const aiQueue = pLimit(2);
