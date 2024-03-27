import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonFooter,
    IonItem,
    IonMenu,
    IonButtons,
    IonMenuButton,
    IonList,
    IonLabel,
    IonCard,
    IonBadge,
    IonFabButton,
    IonSegmentButton,
    useIonModal,
    useIonToast, IonInput
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab2.css';
import React, {useEffect, useRef, useState} from "react";
// @ts-ignore
import factory from 'ggwave';
import {Drivers, Storage} from '@ionic/storage';
import CryptoJS from "crypto-js";
import {OverlayEventDetail} from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import * as mic from '@mozartec/capacitor-microphone'

const storage = new Storage({
    name: '__mydb'
});
storage.create()

function convertTypedArray(src: any, type: any) {
    let buffer = new ArrayBuffer(src.byteLength);
    let baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}

const ModalPassword = ({onDismiss}: {
    onDismiss:
        (data?: string | number | null | undefined, role?: string) => void;
}) => {
    const inputRef = useRef<HTMLIonInputElement>(null);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color="medium" onClick={() => onDismiss(null, 'cancel')}>
                            Cancel
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Welcome</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onDismiss(inputRef.current?.value, 'confirm')} strong={true}>
                            Confirm
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonItem>
                    <IonInput ref={inputRef} labelPlacement="stacked" label="Password"/>
                </IonItem>
            </IonContent>
        </IonPage>
    );
};


const Tab2: React.FC = () => {

    const [present, dismiss] = useIonModal(ModalPassword, {
        onDismiss: (data: string, role: string) => dismiss(data, role),
    });

    const [toast] = useIonToast();
    // State for the text below the button
    const [recognizedTexts, setRecognizedTexts] = useState<string[]>([]); //
    const [buttonText, setButtonText] = useState("Recognize!")// Store multiple recognitions
    const [isRecording, setIsRecording] = useState(false)
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

        await mic.Microphone.requestPermissions()

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

    const decryptText = (cipherText: string, password: string) => {
        const bytes = CryptoJS.AES.decrypt(cipherText, password);
        return bytes.toString(CryptoJS.enc.Utf8);
    };

    function openModal(text: string, index: number) {
        present({
            onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
                if (ev.detail.role === 'confirm') {
                    if (text && ev.detail.data) {

                        let tst = () => toast({
                            message: 'Incorrent password or corrupted message',
                            duration: 1500,
                            position: "bottom",
                        });

                        try {
                            console.log(ev.detail.data)
                            let decrypted = decryptText(text.slice(1), ev.detail.data)
                            if (decrypted.startsWith(ev.detail.data)) {
                                console.log(decrypted)
                                setRecognizedTexts(rt => rt.with(index, '0' + decrypted.slice(ev.detail.data.length)))
                            } else {
                                tst()
                            }
                        } catch (e) {
                            console.log(e)
                            tst()
                        }
                    } else {
                    }
                }
            },
        });
    }

    return (
        <>
            <IonMenu contentId="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Menu</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <IonList>
                        <IonSegmentButton onClick={async () => {
                            setRecognizedTexts(new Array<string>());
                            storage.set('recognizedTexts', new Array<string>());
                        }}>
                            <IonLabel>Clear history</IonLabel>
                        </IonSegmentButton>
                    </IonList>
                </IonContent>
            </IonMenu>
            <IonPage id="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Text recognizing</IonTitle>
                        <IonButtons slot="end">
                            <IonMenuButton></IonMenuButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen className="ion-text-center ion-padding">
                    <div className="cloud-container" ref={cloudContainerRef}>
                        {recognizedTexts.map((text, index) => {
                            return text.startsWith('1') ?
                                <div key={index} className="text-cloud" onClick={() => openModal(text, index)}><b><i><u>TAP TO DECRYPT</u></i></b></div> :
                                <div key={index} className="text-cloud">{text.slice(1)}</div>;
                        })}
                    </div>
                </IonContent>
                <IonFooter>
                    <IonItem>
                        <div className="full-width-button-container">
                            <IonButton className="recognize-button" expand="full" size="large"
                                       onClick={startRecording}>{buttonText}</IonButton>
                        </div>
                    </IonItem>
                </IonFooter>
            </IonPage>
        </>
    );
};

export default Tab2;
