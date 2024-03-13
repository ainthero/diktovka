import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab2.css';
import React, {useState} from "react";
// @ts-ignore
import factory from 'ggwave';

const Tab2: React.FC = () => {
    // State for the text below the button
    const [buttonText, setButtonText] = useState('Initial Text');

    async function handleClick() {

        let ggwave = await factory()
        // create ggwave instance with default parameters
        let parameters = ggwave.getDefaultParameters();

        parameters.operatingMode |= ggwave.GGWAVE_OPERATING_MODE_USE_DSS;

        let instance = ggwave.init(parameters);
        console.log('instance: ' + instance);

        let payload = 'hello js';
        setButtonText("kek")
        // generate audio waveform for string "hello js"
        let waveform = ggwave.encode(instance, payload, ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_FAST, 10);

        // setButtonText(waveform)
        // decode the audio waveform back to text
        let res = ggwave.decode(instance, waveform);

        setButtonText(new TextDecoder("utf-8").decode(res))

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
                    <IonButton onClick={handleClick}>Click Me</IonButton>
                    <IonText>{buttonText}</IonText>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Tab2;
