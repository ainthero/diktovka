import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonRadioGroup,
    IonLabel,
    IonItem,
    IonRadio,
    IonRange,
    IonGrid,
    IonRow,
    IonCol,
    IonTextarea,
    IonToggle,
    IonFooter
} from '@ionic/react';
import React, {useState} from 'react';
import './Tab1.css';
// @ts-ignore
import factory from 'ggwave';

const Tab1: React.FC = () => {
    const [text, setText] = useState('');
    const [transmissionType, setTransmissionType] = useState('audible');
    const [transmissionSpeed, setTransmissionSpeed] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [password, setPassword] = useState('');
    const [usePassword, setUsePassword] = useState(false);


    const speedLabels: { [key: number]: string } = {1: 'normal', 2: 'fast', 3: 'fastest'};

    const visualize = (analyser: any) => {
        const canvas = document.getElementById('audio-visualizer') as HTMLCanvasElement;
        if (!canvas) return; // Safety check

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return; // Check for context as well
        const bufferLength = 200;
        const dataArray = new Uint8Array(bufferLength);

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        const desiredNumberOfBars = 20;

        const draw = () => {
            requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = '#1e1e1e';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            const segmentSize = Math.floor(bufferLength / desiredNumberOfBars);
            let x = 0;
            const barSpacing = 1; // spacing between bars
            const barWidth = (WIDTH / desiredNumberOfBars) - barSpacing; // adjust bar width

            for (let i = 0; i < desiredNumberOfBars; i++) {
                let sum = 0;
                for (let j = 0; j < segmentSize; j++) {
                    sum += dataArray[i * segmentSize + j];
                }
                let avg = sum / segmentSize;
                let barHeight = avg * 2;

                canvasCtx.fillStyle = 'rgb(66, 140,' + (barHeight + 150) + ')';
                canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + barSpacing;
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
        factory().then(function (ggwave: any) {
            var context = new AudioContext({sampleRate: 48000});
            var analyser = context.createAnalyser();
            analyser.fftSize = 512; // Can be adjusted for different levels of detail
            var parameters = ggwave.getDefaultParameters();
            var instance = ggwave.init(parameters);

            let payload = usePassword ? `${text}:${password}` : text;

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
            source.onended = function () {
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
                        <IonTextarea class="large-text-field" value={text} placeholder="Enter text"
                                     onIonInput={e => setText(e.detail.value!)}/>
                    </IonItem>
                    <IonItem>
                        <IonGrid>
                            <IonRow class="compact-row">
                                <IonCol size="10">
                                    <IonInput
                                        value={password}
                                        onIonChange={e => setPassword(e.detail.value!)}
                                        type="password"
                                        placeholder="Enter Password"
                                        disabled={!usePassword}
                                    />
                                </IonCol>
                                <IonCol size="1">
                                    <IonToggle
                                        checked={usePassword}
                                        onIonChange={e => setUsePassword(e.detail.checked)}
                                    />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonItem>
                    <IonRadioGroup value={transmissionType} onIonChange={e => setTransmissionType(e.detail.value)}>
                        <IonItem>
                            <IonLabel>Ultrasound</IonLabel>
                            <IonRadio slot="start" value="ultrasound"/>
                        </IonItem>
                        <IonItem>
                            <IonLabel>Audible</IonLabel>
                            <IonRadio slot="start" value="audible"/>
                        </IonItem>
                    </IonRadioGroup>
                    <IonItem>
                        <IonRange min={1} max={3} snaps={true} ticks={true} value={transmissionSpeed}
                                  onIonChange={e => setTransmissionSpeed(e.detail.value as number)}>
                            <IonLabel slot="start">Normal</IonLabel>
                            <IonLabel slot="end">Fastest</IonLabel>
                        </IonRange>
                    </IonItem>
                    <IonItem>
                        <canvas id="audio-visualizer" width="300" height="150"></canvas>
                    </IonItem>
                </div>
            </IonContent>
            <IonFooter>
                <IonItem>
                    <div className="full-width-button-container">
                        <IonButton expand="full" size="large" onClick={handlePlayAudio}>Play Audio</IonButton>
                    </div>
                </IonItem>
            </IonFooter>
        </IonPage>
    );
};

export default Tab1;
