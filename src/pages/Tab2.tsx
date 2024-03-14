import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab2.css';
import React, {useState} from "react";
// @ts-ignore
import factory from 'ggwave';
import {VoiceRecorder} from "capacitor-voice-recorder";

async function startRecording() {
    if (await VoiceRecorder.hasAudioRecordingPermission()) {
        await VoiceRecorder.requestAudioRecordingPermission();
    }
    let record = await VoiceRecorder.startRecording();
}

async function stopRecording() {
    return await VoiceRecorder.stopRecording()
}

function convertTypedArray(src: any, type: any) {
    let buffer = new ArrayBuffer(src.byteLength);
    let baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}


const Tab2: React.FC = () => {
        // State for the text below the button
        const [buttonText, setButtonText] = useState('Initial Text');

        async function onPress() {
            setButtonText("Prepare...")
            if (await VoiceRecorder.hasAudioRecordingPermission()) {
                await VoiceRecorder.requestAudioRecordingPermission();
            }

            setButtonText("Prepare2...")

            let context = new AudioContext({sampleRate: 48000});
            let ggwave = await factory();

            setButtonText("Prepare3...")

            let parameters = ggwave.getDefaultParameters();
            parameters.sampleRateInp = context.sampleRate;
            parameters.sampleRateOut = context.sampleRate;
            let instance = ggwave.init(parameters);

            let constraints = {
                audio: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false
                }
            };

            setButtonText("Prepare4...")
            let mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setButtonText("Prepare5...")

            let mediaStreamNode = context.createMediaStreamSource(mediaStream)

            let bufferSize = 1024;
            let numberOfInputChannels = 1;
            let numberOfOutputChannels = 1;

            let recorder = context.createScriptProcessor(
                bufferSize,
                numberOfInputChannels,
                numberOfOutputChannels);

            recorder.onaudioprocess = function (e) {
                console.log("asdfasdf")
                let source = e.inputBuffer;
                let res = ggwave.decode(instance, convertTypedArray(new Float32Array(source.getChannelData(0)), Int8Array));

                if (res && res.length > 0) {
                    res = new TextDecoder("utf-8").decode(res);
                    setButtonText(res)
                }
            }

            mediaStreamNode.connect(recorder);
            recorder.connect(context.destination);

            setButtonText("Recording...")
        }

        async function onRelease() {
            //
            // let recData = await stopRecording()
            // let ggwave = await factory()
            //
            // let parameters = ggwave.getDefaultParameters();
            // parameters.operatingMode |= ggwave.GGWAVE_OPERATING_MODE_USE_DSS;
            //
            // let instance = ggwave.init(parameters);
            //
            // let decodedRecData = atob(recData.value.recordDataBase64);
            //
            // let string = ggwave.decode(decodedRecData)
            //
            // let res = ggwave.decode(instance, convertTypedArray(new Float32Array(decodedRecData, Int8Array));
            //
            // if (res && res.length > 0) {
            //     res = new TextDecoder("utf-8").decode(res);
            //     rxData.value = res;
            // }
        }

        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Tab 2</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen className="ion-text-center ion-padding">
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Tab 2</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <ExploreContainer name="Tab 2 page"/>
                    {/* Container for centered content */}
                    <div className="centered-content">
                        <IonButton onMouseDown={onPress} onMouseUp={onRelease}>Recognize!</IonButton>
                        <IonText>{buttonText}</IonText>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
;

export default Tab2;
