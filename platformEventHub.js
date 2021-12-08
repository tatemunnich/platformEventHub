import { LightningElement } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class EmpApiLWC extends LightningElement {
    channelName = '/event/ContactIntegration__e'; //prefilled channel
    subscription = {};
    isSubscribeDisabled = false;
    isUnsubscribeDisabled = true;
    eventLog = '';
    replayIdNumber = '-1'; //initial replay Id -1 is new events from the sibscribed point in time

    // Fires right away
    connectedCallback() {       
        // Register error listener       
        this.registerErrorListener();
    }

    // Tracks changes to channelName text field
    handleChannelName(event) {
        this.channelName = event.target.value;
    }

    // Handles subscribe button click - Subscribe to the specified channel
    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const messageCallback = (response) => {
            this.eventLog = JSON.stringify(response, null, 2) + '\n\n' + this.eventLog; //put last event into the string
        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, this.replayIdNumber, messageCallback).then(response => {
            // Response contains the subscription information on successful subscribe call
            if(response){
                this.subscription = response;
                this.isSubscribeDisabled = true;
                this.isUnsubscribeDisabled = false;
                //send toast successful subscribe
                const evt = new ShowToastEvent({
                    message: `Subscribed to : ${JSON.stringify(response.channel)}`,
                    variant: 'success',
                });
                this.dispatchEvent(evt);
            }
        });

    }

    registerErrorListener() {
        // Invoke onError empApi method
        // Error contains the server-side error
        onError(error => {
            //send error toast
            console.log('Received error from server: ', JSON.stringify(error));
            const evt = new ShowToastEvent({
                title: error.subscription,
                message: error.error,
                variant: 'error',
            });
            this.dispatchEvent(evt);
        });
    }

    //clear events log
    handleClear(){
        this.eventLog = '';
    }

    handleUnsubscribe(){
        this.channelName = '/event/';
        this.isSubscribeDisabled = false;
        this.isUnsubscribeDisabled = true;

        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, (response) => {});

        this.subscription = {};
    }

}
