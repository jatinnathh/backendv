export function createTrace() {
  const trace = [];

  return {
    get trace() {
      return trace;
    },
    add(step, data = {}) {
      trace.push({
        step,
        timestamp: Date.now(),
        ...data,
      });
    },
  };
}
