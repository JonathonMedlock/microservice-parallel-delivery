import React from 'react';
import logo from './logo.svg';
import './App.css';

const axios = require('axios');

const API_ROOT = 'https://r7jkrrwdrb.execute-api.us-east-2.amazonaws.com/dev';

class ProjectPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            topicBox: "",
            messageBox: "",
            messageList: []
        }
        this.retrieveTableData = this.retrieveTableData.bind(this);
        this.updateTopic = this.updateTopic.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
        this.submitMessage = this.submitMessage.bind(this);
    }

    async retrieveTableData() {
        const current = this;
        return axios.get(API_ROOT + '/messages').then((resp) => {
            const rawMessages = resp.data;
            const messageDateFormatted = rawMessages.map((itemRaw) => {
                console.log(itemRaw);
                const item = itemRaw;
                return {
                    topic: item.Topic,
                    sender: item.Source,
                    message: item.Message,
                    date: new Date(parseInt(item.Timestamp,10))
                }
            });
            current.setState({
                topicBox: current.state.topicBox,
                messageBox: current.state.messageBox,
                messageList: messageDateFormatted.sort((first, second) => {
                    console.log("first: " + first.date.getTime());
                    console.log("second: " + second.date.getTime());
                    return second.date.getTime() - first.date.getTime();
                })
            })
        }).catch((err) => {
            console.log("ERROR: Problem retrieving messages from service", err);
        })
    }

    updateTopic(event){
        this.setState({
            topicBox: event.target.value,
            messageBox: this.state.messageBox,
            messageList: this.state.messageList
        });
    }

    updateMessage(event){
        this.setState({
            topicBox: this.state.topicBox,
            messageBox: event.target.value,
            messageList: this.state.messageList
        });
    }

    async submitMessage() {
        // POST axios to API Gateway
        axios.post(API_ROOT + '/messages', {
            topic: this.state.topicBox,
            message: this.state.messageBox
        }).then(async (resp) => {
            console.log("Successfully posted");
            this.setState({
                topicBox: "",
                messageBox: "",
                messageList: this.state.messageList
            });
        }).catch((err) => {
            console.log("Error posting message to service.", err);
        })
    }

    printTableLine(position) {
        return (
            <tr key={position}>
                <td>{this.state.messageList[position].date.toString()}</td>
                <td>{this.state.messageList[position].topic}</td>
                <td>{this.state.messageList[position].sender}</td>
                <td>{this.state.messageList[position].message}</td>
            </tr>
        );
    }

    componentDidMount() {
        //this.interval = setInterval(() => this.retrieveTableData(), 10000);
        this.retrieveTableData();
    }

    componentWillUnmount() {
        //clearInterval(this.interval);
    }

    render() {
        return (
            <div align="left">
                <div>
                    <p>This page is a list of messages received by ms-cli-1, sorted by received time. The topics this client is subscribed to are Billing, Ordering, and Reviews. This client is authorized to send messages. Check the governor page for details on all currently used topics.</p>
                    {/*<p>This page is a list of all messages that have been sent by all clients of the program, sorted by time sent. Currently used topics are Billing, Ordering, Reviews, Distribution, Subscriptions, and Registration. A message may be sent with any topic from these and will be delivered to the subscribing clients. A message with a different topic is still valid, but will only be shown here. Valid clients are ms-cli-1, ms-cli-2, and ms-cli-3.</p>*/}
                </div>
                <div/>
                <button onClick={this.retrieveTableData}>Refresh Table</button>
                <div/>
                <div>
                    <label>Topic:
                        <input type="text" value={this.state.topicBox} onChange={this.updateTopic}/>
                    </label>
                    <label>Message:
                        <input type="text" value={this.state.messageBox} onChange={this.updateMessage}/>
                    </label>
                    <button onClick={this.submitMessage}>Post Message</button>
                </div>
                <div/>
                <table>
                    <thead>
                        <tr>
                            <td>Date</td>
                            <td>Topic</td>
                            <td>Sender</td>
                            <td>Message</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.messageList.map((item, index) => { return this.printTableLine(index)})}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ProjectPage;