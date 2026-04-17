
// Dummy worker implementation to disable Redis dependency
const quotationWorker = {
    on: () => { },
    close: async () => { }
};

export default quotationWorker;

