import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Icon, InputNumber } from 'antd';
import axios from 'axios';

import { startPolling, stopPolling, updatePollingStats, updateJoke } from './actions';

class App extends Component {
    fetchJokes() {
        return axios.get('https://api.icndb.com/jokes/random');
    }

    handleJoke = response => {
        if (response && response.data && response.data.value) {
            this.props.updateJoke(response.data.value.joke);
            return true;
        }

        return false;
    }

    handleStatsChange = stats => {
        this.props.updatePollingStats(stats);
    }

    startPolling = () => {
        this.props.startPolling({
            asyncFetch: this.fetchJokes,
            callback: this.handleJoke,
            onStatsChange: this.handleStatsChange,
            delay: this.delay || 10,
            retryOnFailure: true,
            retryAfter: 5,
            stopAfterRetries: 2
        });
    }

    stopPolling = () => {
        this.props.updatePollingStats({});
        this.props.stopPolling();
    }

    getExtraInfo = () => {
        const { lastResponseStatus, nextPollEta, retries } = this.props;
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

    formatSeconds(value) { return `Delay ${value} seconds`; }

    setDelay = delay => this.delay = delay;

    render() {
        const { inProgress, lastResponseStatus, fetching, joke } = this.props;

        return (
            <div className="container">
                <Alert
                    message={`Polling: ${inProgress ? `Yes ${this.getExtraInfo()}` : 'No'}`}
                    type={`${inProgress && lastResponseStatus === 'success' ? 'success' : 'error'}`}
                />
                <br />
                <div className="actions">
                    <InputNumber
                        min={5}
                        max={30}
                        formatter={this.formatSeconds}
                        defaultValue={10}
                        onChange={this.setDelay}
                    />
                    <Button
                        type="primary"
                        onClick={this.startPolling}
                        disabled={inProgress}
                    >
                        Start polling
                    </Button>
                    <Button
                        type="danger"
                        onClick={this.stopPolling}
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
}

const mapStateToProps = ({ joke, pollingStats }) => ({
    joke,
    ...pollingStats
});
const mapDispatchToProps = dispatch => ({
    startPolling: params => dispatch(startPolling(params)),
    stopPolling: () => dispatch(stopPolling()),
    updatePollingStats: stats => dispatch(updatePollingStats(stats)),
    updateJoke: joke => dispatch(updateJoke(joke))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
