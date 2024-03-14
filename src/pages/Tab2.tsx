import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab2.css';
import React, {useEffect, useRef, useState} from "react";
// @ts-ignore
import factory from 'ggwave';
import {Storage} from '@ionic/storage';

function convertTypedArray(src: any, type: any) {
    let buffer = new ArrayBuffer(src.byteLength);
    let baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}


const Tab2: React.FC = () => {
    // State for the text below the button
    const [recognizedTexts, setRecognizedTexts] = useState<string[]>([]); //
    const [buttonText, setButtonText] = useState("Recognize!")// Store multiple recognitions
    const cloudContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cloudContainerRef.current) {
            const {current} = cloudContainerRef;
            current.scrollTop = current.scrollHeight; // Scroll to the bottom of the container
        }
    }, [recognizedTexts]);

    async function startRecording() {
        setButtonText("Prepare...")

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
                setRecognizedTexts(prevTexts => [...prevTexts, res]);
            }
        }

        mediaStreamNode.connect(recorder);
        recorder.connect(context.destination);

        setButtonText("Recognizing...")
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Tab 2</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-text-center ion-padding">
                <div className="custom">
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Text recognizing</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <div className="cloud-container" ref={cloudContainerRef}>
                        {recognizedTexts.map((text, index) => (
                            <div key={index} className="text-cloud">{text}</div>
                        ))}
                    </div>
                    <div className="full-width-button-container">
                        <IonButton className="recognize-button" onClick={startRecording}>{buttonText}</IonButton>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Tab2;
