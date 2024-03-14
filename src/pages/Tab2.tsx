import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonText,
    IonFooter,
    IonItem
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab2.css';
import React, {useEffect, useRef, useState} from "react";
// @ts-ignore
import factory from 'ggwave';
import {Drivers, Storage} from '@ionic/storage';

const storage = new Storage({
    name: '__mydb'});
storage.create()

function convertTypedArray(src: any, type: any) {
    let buffer = new ArrayBuffer(src.byteLength);
    let baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}


const Tab2: React.FC = () => {
    // State for the text below the button
    const [recognizedTexts, setRecognizedTexts] = useState<string[]>([]); //
    const [buttonText, setButtonText] = useState("Recognize!")// Store multiple recognitions
    const [isRecording, setIsRecording] = useState(false)
    const [db, setDb] = useState<Storage>()
    const [audioContext, setAudioContext] = useState<AudioContext>()

    const cloudContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // Load recognized texts from storage on component mount
        const loadStoredTexts = async () => {
            const storedTexts = await storage.get('recognizedTexts');
            if (storedTexts) {
                setRecognizedTexts(storedTexts);
            }
        };

        loadStoredTexts();
    }, []);

    useEffect(() => {
        if (recognizedTexts.length > 0) {
            // Save recognized texts to storage whenever the array updates
            storage.set('recognizedTexts', recognizedTexts);
        }
    }, [recognizedTexts]);

    useEffect(() => {
        if (cloudContainerRef.current) {
            const {current} = cloudContainerRef;
            current.scrollTop = current.scrollHeight; // Scroll to the bottom of the container
        }
    }, [recognizedTexts]);

    async function startRecording() {
        if (isRecording) {
            await audioContext?.close();
            setIsRecording(false)
            setButtonText("Recognize!");
            return;
        }

        setIsRecording(true)

        setButtonText("Prepare.");

        // await audioContext?.close();
        let context = new AudioContext({sampleRate: 48000});
        setAudioContext(context);
        let ggwave = await factory();

        setButtonText("Prepare..")

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

        setButtonText("Prepare...")
        let mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setButtonText("Prepare....")

        let mediaStreamNode = context.createMediaStreamSource(mediaStream)

        let bufferSize = 1024;
        let numberOfInputChannels = 1;
        let numberOfOutputChannels = 1;

        let recorder = context.createScriptProcessor(
            bufferSize,
            numberOfInputChannels,
            numberOfOutputChannels);

        recorder!.onaudioprocess = function (e) {
            let source = e.inputBuffer;
            let res = ggwave.decode(instance, convertTypedArray(new Float32Array(source.getChannelData(0)), Int8Array));

            if (res && res.length > 0) {
                res = new TextDecoder("utf-8").decode(res);
                setRecognizedTexts(prevTexts => [...prevTexts, res]);
            }
        }

        mediaStreamNode.connect(recorder!);
        recorder!.connect(context.destination);

        setButtonText("Recognizing...")
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Text recognizing</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-text-center ion-padding">
                <div className="custom">
                    <div className="cloud-container" ref={cloudContainerRef}>
                        {recognizedTexts.map((text, index) => (
                            <div key={index} className="text-cloud">{text}</div>
                        ))}
                    </div>
                </div>
            </IonContent>
            <IonFooter >
                <IonItem>
                    <div className="full-width-button-container">
                        <IonButton className="recognize-button"  expand="full" size="large" onClick={startRecording}>{buttonText}</IonButton>
                    </div>
                </IonItem>
            </IonFooter>
        </IonPage>
    );
};

export default Tab2;
