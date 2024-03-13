import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import React,  { useState } from 'react';
// @ts-ignore
import factory from 'ggwave';

const Tab1: React.FC = () => {
  const [text, setText] = useState('');

  function convertTypedArray(src: any, type: any) {
    var buffer = new ArrayBuffer(src.byteLength);
    var baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
  }

  const handlePlayAudio = () => {
    factory().then(function(ggwave: any) {
      var context = new AudioContext({sampleRate: 48000});
      var parameters = ggwave.getDefaultParameters();
      var instance = ggwave.init(parameters);
      var payload = text;
      var waveform = ggwave.encode(instance, payload, ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_NORMAL, 10);
      var buf = convertTypedArray(waveform, Float32Array);
      var buffer = context.createBuffer(1, buf.length, context.sampleRate);
      buffer.getChannelData(0).set(buf);
      var source = context.createBufferSource();
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
      <div className="centered-content">
        <IonInput value={text} placeholder="Enter text" onIonChange={e => setText(e.detail.value!)} />
        <IonButton onClick={handlePlayAudio}>Play Audio</IonButton>
      </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
