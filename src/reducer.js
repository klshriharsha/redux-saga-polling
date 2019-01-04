const initState = {
    joke: '',
    pollingStats: {}
};

export default (state = initState, action) => {
    switch (action.type) {
        case 'UPDATE_JOKE':
            return {...state, joke: action.joke};

        case 'UPDATE_POLLING_STATS':
            return {...state, pollingStats: action.stats};

        default:
            return state;
    }
}
