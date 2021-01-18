


let compressorSliders = document.getElementsByClassName("slider");
//let filterSliders = document.getElementsByClassName("filterSlider");
//let filterSelectList = document.querySelector("#filterSelectList");

// Web Audio Nodes

let context = new AudioContext();

let sound = new Audio("guitar.wav");
let source = context.createMediaElementSource(sound);
let gain = context.createGain();
let stereoPanner = context.createStereoPanner();
    //let delay = context.createDelay(4.0);
let convoler = context.createConvolver();
let compressor = context.createDynamicsCompressor();
    //let filter = context.createBiquadFilter();
let distortion = context.createWaveShaper();

// Initialwerte setzen
distortion.curve = makeDistortionCurve(0);
distortion.oversample = "4x";
loadImpulseResponse("room");



// GAIN ---
document.querySelector("#gainSlider").addEventListener("input", function (e) {
    let gainValue = (this.value / 10);
    document.querySelector("#gainOutput").innerHTML = gainValue + " dB";
    gain.gain.value = gainValue;
});

// STEREOPANNER
document.querySelector("#panningSlider").addEventListener("input", function (e) {
    let panValue = ((this.value - 50) / 50);
    document.querySelector("#panningOutput").innerHTML = panValue + " LR";
    stereoPanner.pan.value = panValue;
});

// DISTORTION
document.querySelector("#distortionSlider").addEventListener("input", function() {
    document.querySelector("#distortionOutput").innerHTML = this.value;
    distortion.curve = makeDistortionCurve(this.value);
});

function makeDistortionCurve(amount) {    
    let n_samples = 44100,
        curve = new Float32Array(n_samples);
    
    for (var i = 0; i < n_samples; ++i ) {
        var x = i * 2 / n_samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + (amount * Math.abs(x)));
    }
    return curve;
};





/*document.querySelector("#delaySlider").addEventListener("input", function (e) {
    let delayValue = (this.value / 25);
    document.querySelector("#delayOutput").innerHTML = delayValue + " sec";
    delay.delayTime.value = delayValue;
}); */


// CONVOLVER
document.querySelector("#reverbTitle").addEventListener("change", function (e) {
    let name = e.target.options[e.target.selectedIndex].value;
    loadImpulseResponse(name);
});

function loadImpulseResponse(name) {
    fetch("/impulseResponses/" + name + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            if (convoler) {convoler.disconnect();}

            convoler = context.createConvolver();
            convoler.buffer = audioBuffer;
            convoler.normalize = true;

            // Hier wird der Audiograph zusammengebaut
            source.connect(gain);
            gain.connect(stereoPanner);
            // delay.connect(stereoPanner);
            stereoPanner.connect(compressor);
            compressor.connect(distortion);
            //filter.connect(distortion);
            distortion.connect(convoler);
            convoler.connect(context.destination);
        })
        .catch(console.error);
}


// COMPRESSOR
for (let i = 0; i < compressorSliders.length; i++) {
    compressorSliders[i].addEventListener("mousemove", changeCompressorParameter)
}

function changeCompressorParameter() {
    switch (this.id) {
        case "thresholdSlider":
            compressor.threshold.value = (this.value - 100);
            document.querySelector("#thresholdOutput").innerHTML = (this.value - 100) + " dB";
            break;
        case "ratioSlider":
            compressor.ratio.value = (this.value / 5);
            document.querySelector("#ratioOutput").innerHTML = (this.value / 5) + " dB";
            break;
        case "kneeSlider":
            compressor.knee.value = (this.value / 2.5);
            document.querySelector("#kneeOutput").innerHTML = (this.value / 2.5) + " degree";
            break;
        case "attackSlider":
            compressor.attack.value = (this.value / 1000);
            document.querySelector("#attackOutput").innerHTML = (this.value / 1000) + " sec";
            break;
        case "releaseSlider":
            compressor.release.value = (this.value / 1000);
            document.querySelector("#releaseOutput").innerHTML = (this.value - 100) + " sec";
            break;
        case "reductionSlider":
            compressor.release.value = (this.value / 1000);
            document.querySelector("#reductionOutput").innerHTML = (this.value - 100) + " sec";
             break;
    }
}

// Filter
/*for (var i = 0; i < filterSliders.length; i++) {
    filterSliders[i].addEventListener('mousemove', changeFilterParameter, false);
}

filterSelectList.addEventListener("change", function (e) {
    filter.type = filterSelectList.options[filterSelectList.selectedIndex].value;
});
*/

/*function changeFilterParameter() {
    switch (this.id) {
    case "frequencySlider":
        filter.frequency.value = (this.value);
        document.querySelector("#frequencyOutput").innerHTML = (this.value) + " Hz";
        break;
    case "detuneSlider":
        filter.detune.value = (this.value);
        document.querySelector("#detuneOutput").innerHTML = (this.value) + " cents";
        break;
    case "qSlider":
        filter.Q.value = (this.value);
        document.querySelector("#qOutput").innerHTML = (this.value) + " ";
        break;
    case "gainFilterSlider":
        filter.gain.value = (this.value);
        document.querySelector("#gainOutput").innerHTML = (this.value) + " dB";
        break;
    }
}
*/

// Sound Wiedergabe
playStopButton.addEventListener("click", function() {
    if (isPlaying) {
        sound.pause();
        playStopButton.innerHTML = "Play";
    } else {
        playStopButton.innerHTML = "Stop";
        sound.play();
    }

    isPlaying = !isPlaying;
});

sound.addEventListener("ended", function () {
    isPlaying = false;
    playStopButton.innerHTML = "Play";
})