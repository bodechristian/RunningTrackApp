import React, { Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

let padToTwo = (number) => (number <= 9 ? `0${number}`: number);
let roundTypes = ["Rest", "Warmup", "400m", "1000m"];

function toTime(h,m,s) {
    let _str = "";
    if(h!==0) {
        _str += h + ':';
        _str += padToTwo(m) + ':';
        _str += padToTwo(s);
    } else if(m!==0) {
        _str += m + ':';
        _str += padToTwo(s);
    } else {
        _str += s;
    }
    return _str;
}

function IntervalTimer(callback, interval) {
    var timerId, startTime, remaining = 0;
    var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.pause = function () {
        if (state != 1) return;

        remaining = interval - (new Date() - startTime);
        clearInterval(timerId);
        state = 2;
    };

    this.resume = function () {
        if (state != 2) return;

        state = 3;
        setTimeout(this.timeoutCallback, remaining);
    };

    this.timeoutCallback = function () {
        if (state != 3) return;

        callback();

        startTime = new Date();
        timerId = setInterval(() => {
            startTime =  new Date();
            callback() }
            , interval);
        state = 1;
    };

    this.end = function () {
        clearInterval(timerId);
        return new Date() - startTime;
    }

    startTime = new Date();
    timerId = setInterval(() => {
        startTime =  new Date();
        callback() }, interval);
    state = 1;
}


class PageRun extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hour: 0,
            min: 0,
            sec: 0,
            start: false,
            paused: false,
            roundType: "",
        }

        this.lapArr = [];
        this.interval = null;
    }

    stopwatchCallback = () => {
        if (this.state.sec !== 59) {
            this.setState({
                sec: ++this.state.sec
            });
        } else if (this.state.min !== 59) {
            this.setState({
                sec: 0,
                min: ++this.state.min,
            })
        } else {
            this.setState({
                sec: 0,
                min: 0,
                hour: ++this.state.hour
            });
        }
    }

    handleRound = (type, h, m, s) => {
        if(type !== "") {
            if (!this.state.start) {
                this.setState({
                    start: true
                })
                this.interval = new IntervalTimer(this.stopwatchCallback, 1000);
            } else {
                // round
                this.setState({
                    hour: 0,
                    min: 0,
                    sec: 0,
                })
                let ms = this.interval.end();
                this.lapArr = [
                    ...this.lapArr,
                    {type, h, m, s, ms}
                ]
                this.interval = new IntervalTimer(this.stopwatchCallback, 1000);
            };
        };
    };

    handlePause = () => {
        if(this.state.paused) {
            this.interval.resume();
        } else {
            this.interval.pause();
        }
        this.setState(
            {
                paused: !this.state.paused,
            },
        );
    };
    
    handleUndo = () => {    
        this.props.getter(this.lapArr);
    };

    handleEnd = () => {
        this.setState({
            hour: 0,
            min: 0,
            sec: 0,
        })
        this.interval.end();
        this.setState({
            roundType: "",
            start: false,
        })
        this.props.handleEnd(this.lapArr);
    };

    handleTypeChange = (_str) => {
        this.setState({
            roundType: _str,
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar hidden={true}></StatusBar>
                <TouchableOpacity style={[styles.btn, styles.btnRound]} onPress={() => this.handleRound(this.state.roundType, 
                    this.state.hour, this.state.min, this.state.sec)}>
                    <Text style={styles.btnText}>
                        {this.state.start?"Round":"Start"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.stopwatch}>
                    <Text style={styles.stopwatchNr}>{this.state.start?toTime(this.state.hour, this.state.min, this.state.sec):'Inactive'}</Text>
                </View>
 
                <View style={styles.row}> 
                    <TouchableOpacity style={styles.btn} onPress={this.handlePause}>
                        <Text style={styles.btnText}>
                        {this.state.paused?'Resume':'Pause'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn} onPress={this.handleUndo}>
                        <Text style={styles.btnText}>
                        Undo
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn} onPress={ this.handleEnd} disabled={!this.state.start}>
                        <Text style={styles.btnText}>
                        End
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    {roundTypes.map((roundType, i) => 
                        <TouchableOpacity 
                        style={[styles.btn, styles.btnType, this.state.roundType==roundType?styles.btnTypeSelected:styles.btnType]}
                        key={i} onPress={() => this.handleTypeChange(roundType)}>
                            <Text style={styles.btnText}>
                                {roundType}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList data={this.lapArr} ref={(ref) => { this.flatListRef = ref; }} style={styles.timeList} inverted renderItem={({item, index}) =>
                    <View style={styles.row} key={index}>
                        <Text style={styles.timeListItem}>{`${index+1}`}</Text>
                        <Text  style={styles.timeListItem}>{`${item.type}`}</Text>
                        <Text  style={styles.timeListItem}>{`${toTime(item.h, item.m, item.s)}.${Math.floor(item.ms/100)}`}</Text>
                    {this.flatListRef.scrollToEnd()}
                    </View>
                }/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#777',
      flexGap: 5,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    btn: {
        borderRadius: 5,
        borderStyle: 'solid',
        borderColor: 'black',
        backgroundColor: "#bbb",
        borderWidth: 1,
        justifyContent: 'center',
        height: 50,
        flexBasis: 1,
        flexGrow: 1,
    },
    btnType: {
      flexBasis: '50%',
    },
    btnTypeSelected: {
        backgroundColor: "olivedrab"
    },
    btnText: {
      alignSelf: 'center',
    },
    btnRound: {
      flexGrow: 0,
      flexBasis: '50%',
    },
    stopwatch: {
        flexDirection: "row",
        borderRadius: 5,
        backgroundColor: '#555',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stopwatchNr: {
        fontSize: 50,
        color: '#eee',
    },
    timeList: {
        backgroundColor: '#999',
        flexGrow: 0,
        width: '100%',
        justifySelf: 'center',
        alignSelf: 'center',
    },
    timeListItem: {
        fontSize: 18,
        textAlign: 'center',
        flexBasis: 1,
        flexGrow: 1,
    }
  });
  

export default PageRun;