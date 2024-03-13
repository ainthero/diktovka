import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonRadioGroup, IonListHeader, IonLabel, IonItem, IonRadio, IonRange } from '@ionic/react';
import React, { useState } from 'react';
import './Tab1.css';
// @ts-ignore
import factory from 'ggwave';

const Tab1: React.FC = () => {
  const [text, setText] = useState('');
  const [transmissionType, setTransmissionType] = useState('ultrasound');
  const [transmissionSpeed, setTransmissionSpeed] = useState(1);

  const speedLabels: { [key: number]: string } = {1: 'normal', 2: 'fast', 3: 'fastest'};

  function convertTypedArray(src: any, type: any) {
    let buffer = new ArrayBuffer(src.byteLength);
    let baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
  }

  const handlePlayAudio = () => {
    factory().then(function(ggwave: any) {
      let context = new AudioContext({sampleRate: 48000});
      let parameters = ggwave.getDefaultParameters();
      let instance = ggwave.init(parameters);

      let payload = text;

      let protocol = ggwave.ProtocolId[`GGWAVE_PROTOCOL_${transmissionType.toUpperCase()}_${speedLabels[transmissionSpeed].toUpperCase()}`];

      let waveform = ggwave.encode(instance, payload, protocol, 10);
      let buf = convertTypedArray(waveform, Float32Array);
      let buffer = context.createBuffer(1, buf.length, context.sampleRate);
      buffer.getChannelData(0).set(buf);
      let source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(0);
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Text to Audio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-text-center ion-padding">
        <div className='custom'>
        <IonItem>
            <IonInput value={text} placeholder="Enter text" onIonChange={e => setText(e.detail.value!)} />
          </IonItem>
          <IonItem>
          <IonButton onClick={handlePlayAudio}>Play Audio</IonButton>
          </IonItem>
          <IonRadioGroup value={transmissionType} onIonChange={e => setTransmissionType(e.detail.value)}>
          <IonItem>
            <IonListHeader>
              <IonLabel>Transmission Type</IonLabel>
            </IonListHeader>
            </IonItem>
            <IonItem>
              <IonLabel>Ultrasound</IonLabel>
              <IonRadio slot="start" value="ultrasound" />
            </IonItem>
            <IonItem>
              <IonLabel>Audible</IonLabel>
              <IonRadio slot="start" value="audible" />
            </IonItem>
          </IonRadioGroup>
          <IonItem>
          <IonListHeader>
            <IonLabel>Transmission Speed</IonLabel>
          </IonListHeader>
          </IonItem>
          <IonItem>
          <IonRange min={1} max={3} snaps={true} ticks={true} value={transmissionSpeed} onIonChange={e => setTransmissionSpeed(e.detail.value as number)}>
            <IonLabel slot="start">Normal</IonLabel>
            <IonLabel slot="end">Fastest</IonLabel>
          </IonRange>
          </IonItem>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
