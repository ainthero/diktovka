import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonRadioGroup, IonListHeader, IonLabel, IonItem, IonRadio, IonRange } from '@ionic/react';
import React, { useState } from 'react';
import './Tab1.css';
// @ts-ignore
import factory from 'ggwave';

const Tab1: React.FC = () => {
  const [text, setText] = useState('');
  const [transmissionType, setTransmissionType] = useState('ultrasound');
  const [transmissionSpeed, setTransmissionSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  

  const speedLabels: { [key: number]: string } = {1: 'normal', 2: 'fast', 3: 'fastest'};

  const visualize = (analyser: any) => {
    const canvas = document.getElementById('audio-visualizer') as HTMLCanvasElement;
    if (!canvas) return; // Safety check

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return; // Check for context as well
    const bufferLength = 2048;
    const dataArray = new Uint8Array(bufferLength);
  
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const barWidth = (WIDTH / bufferLength) * 2.5;
  
    const draw = () => {
      requestAnimationFrame(draw);
  
      analyser.getByteFrequencyData(dataArray);
  
      canvasCtx.fillStyle = '#1e1e1e';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  
      let barHeight;
      let x = 0;
  
      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
  
        canvasCtx.fillStyle = 'rgb(50,50,' + (barHeight+100) + ')';
        canvasCtx.fillRect(x, HEIGHT-barHeight/2, barWidth, barHeight);
  
        x += barWidth + 1;
      }
    };
  
    draw();
  };

  function convertTypedArray(src: any, type: any) {
    let buffer = new ArrayBuffer(src.byteLength);
    let baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
  }

  const handlePlayAudio = () => {
    if (isPlaying) return;
    factory().then(function(ggwave: any) {
      var context = new AudioContext({sampleRate: 48000});
      var analyser = context.createAnalyser();
      analyser.fftSize = 512; // Can be adjusted for different levels of detail
      var parameters = ggwave.getDefaultParameters();
      var instance = ggwave.init(parameters);

      let payload = text;

      let protocol = ggwave.ProtocolId[`GGWAVE_PROTOCOL_${transmissionType.toUpperCase()}_${speedLabels[transmissionSpeed].toUpperCase()}`];

      let waveform = ggwave.encode(instance, payload, protocol, 10);
      let buf = convertTypedArray(waveform, Float32Array);
      let buffer = context.createBuffer(1, buf.length, context.sampleRate);
      buffer.getChannelData(0).set(buf);
      let source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      analyser.connect(context.destination);
      source.connect(context.destination);
      source.onended = function() {
        setIsPlaying(false); // Stop the animation
      };
      setIsPlaying(true); // Start the animation
      visualize(analyser);
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
          <IonItem lines="none">
          <div className="full-width-button-container">
          <IonButton expand="full" onClick={handlePlayAudio}>Play Audio</IonButton>
        </div>
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
          <canvas id="audio-visualizer" width="300" height="150"></canvas>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
