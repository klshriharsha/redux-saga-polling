export const updateJoke = joke => ({
    type: 'UPDATE_JOKE',
    joke
});

export const updatePollingStats = stats => ({
    type: 'UPDATE_POLLING_STATS',
    stats
});

export const startPolling = params => ({
    type: 'POLL_START',
    params
});

export const stopPolling = () => ({
    type: 'POLL_STOP'
});
