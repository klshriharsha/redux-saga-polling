import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Icon, InputNumber } from 'antd';
import axios from 'axios';

import { startPolling as startPollingAction, stopPolling as stopPollingAction, updatePollingStats, updateJoke } from './actions';

const App = () => {
    let delay;
    const dispatch = useDispatch();
    const { joke, pollingStats } = useSelector(state => state);

    const fetchJokes = () => {
        return axios.get('https://api.icndb.com/jokes/random');
    }

    const handleJoke = response => {
        if (response && response.data && response.data.value) {
            dispatch(updateJoke(response.data.value.joke));
            return true;
        }

        return false;
    }

    const handleStatsChange = stats => {
        dispatch(updatePollingStats(stats))
    }

    const startPolling = () => {
        dispatch(startPollingAction({
            asyncFetch: fetchJokes,
            callback: handleJoke,
            onStatsChange: handleStatsChange,
            delay: delay || 10,
            retryOnFailure: true,
            retryAfter: 5,
            stopAfterRetries: 2
        }));
    }

    const stopPolling = () => {
        dispatch(updatePollingStats({}));
        dispatch(dispatch(stopPollingAction()))
    }

    const getExtraInfo = () => {
        const { lastResponseStatus, nextPollEta, retries } = pollingStats;
        if (
            lastResponseStatus === 'error' &&
            nextPollEta
        ) {
            return `(Retrying after ${nextPollEta} secs - ${2 - retries} retries left)`;
        }

        if (nextPollEta) {
            return `(ETA: ${nextPollEta} secs)`;
        }

        return '';
    }

    const formatSeconds = value => { return `Delay ${value} seconds`; }

    const setDelay = del => delay = del;

    const { inProgress, lastResponseStatus, fetching } = pollingStats;

    return (
        <div className="container">
            <Alert
                message={`Polling: ${inProgress ? `Yes ${getExtraInfo()}` : 'No'}`}
                type={`${inProgress && lastResponseStatus === 'success' ? 'success' : 'error'}`}
            />
            <br />
            <div className="actions">
                <InputNumber
                    min={5}
                    max={30}
                    formatter={formatSeconds}
                    defaultValue={10}
                    onChange={setDelay}
                />
                <Button
                    type="primary"
                    onClick={startPolling}
                    disabled={inProgress}
                >
                    Start polling
                </Button>
                <Button
                    type="danger"
                    onClick={stopPolling}
                    disabled={!inProgress}
                >
                    Stop polling
                </Button>
            </div>
            <br />
            <div className="joke">
                <h4
                    dangerouslySetInnerHTML={{
                        __html: joke === ''
                            ? 'Start polling to see jokes :)'
                            : joke
                    }}
                />
                {fetching && <div className="loader"><Icon type="loading" /></div>}
            </div>
        </div>
    );
}

export default App;
