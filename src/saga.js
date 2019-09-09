import { call, put, take, all, race, delay } from 'redux-saga/effects';

import {
    startPolling,
    stopPolling
} from './actions';

function* poll(action) {
    const params = {...action.params};
    const stats = {
        inProgress: false,
        fetching: false,
        nextPollEta: null,
        retries: null,
        lastResponseStatus: null
    };

    while(true) {
        // Start polling
        stats.inProgress = true;

        try {
            // Make the API call
            stats.fetching = true;
            params.onStatsChange(stats);
            const response = yield call(params.asyncFetch);

            // API call was successful
            stats.fetching = false;
            stats.nextPollEta = params.delay;
            const shouldContinue = params.callback(response, stats);

            if (shouldContinue) {
                stats.retries = 0;
                stats.lastResponseStatus = 'success';
                params.onStatsChange(stats);
            } else {
                params.onStatsChange(stats);
                throw new Error('Error while fetching data.');
            }

            for (let i = 1; i <= params.delay; ++i) {
                yield delay(1000);
                stats.nextPollEta = params.delay - i;
                params.onStatsChange(stats);
            }
        } catch (e) {
            // API call was unsuccessful
            console.log(e);
            const shouldRetry = params.retryOnFailure && stats.retries < params.stopAfterRetries;

            stats.fetching = false;
            stats.lastResponseStatus = 'error';
            stats.nextPollEta = shouldRetry ? params.retryAfter : null;
            params.onStatsChange(stats);
            params.callback(e, stats);

            if (shouldRetry) {
                // Update number of retries
                for (let i = 1; i <= params.retryAfter; ++i) {
                    yield delay(1000);
                    stats.nextPollEta = params.retryAfter - i;
                    params.onStatsChange(stats);
                }

                ++stats.retries;
                yield put(startPolling(params));
            } else {
                stats.inProgress = false;
                params.onStatsChange(stats);
                yield put(stopPolling());
            }
        }
    }
}

function* watchPollingTasks() {
    while(true) {
        const action = yield take(startPolling().type);
        yield race([
            call(poll, action),
            take(stopPolling().type)
        ]);
    }
}

export default function* rootSaga() {
    yield all([watchPollingTasks()]);
}
