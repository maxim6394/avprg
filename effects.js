// Hilfsvariablen & HTML Elemente

let playStopButton = document.querySelector("#playStopButton");

let iconButtons = document.querySelectorAll(".icon");

let sliders = document.querySelectorAll(".itemCompressor .slider");
let miscs = document.querySelectorAll(".itemGain .slider");
let fills = document.querySelectorAll(".bar .fill");

let isPlaying = false;

// Web Audio Nodes

let context = new AudioContext();

let oscillator = context.createOscillator();
oscillator.frequency.value = 1000;
//oscillator.start();

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

let rgb1 = [242, 187, 5];
let rgb2 = [215, 78, 9];

let rgb3 = [66, 122, 161];
let rgb4 = [111, 125, 140];

let initRGB = [[242, 187, 5, "threshold"], [242, 187, 5, "ratio"], [242, 187, 5, "knee"], [242, 187, 5, "attack"], [242, 187, 5, "release"]];
let miscRGB = [[66, 122, 161, "gain"], [66, 122, 161, "panning"], [66, 122, 161, "distortion"]];

for (let i = 0; i < sliders.length; i++) {
    console.log("Miep?")
    sliders[i].addEventListener("input", changeCompressorParameter);
}

for (let i = 0; i < miscs.length; i++) {
    console.log("Miep?")
    miscs[i].addEventListener("input", changeMiscParameters);
}

function setBar(id, type, section) {
    var min = parseInt(document.querySelector("#" + id).getAttribute("min"));
    var max = parseInt(document.querySelector("#" + id).getAttribute("max"));
    var val = parseInt(document.querySelector("#" + id).value);
    var percent = ((val - min) / (max - min)) * 100;

    document.querySelector("#" + type + "Fill").style.height = percent + "%";
    setRGB(percent, id, section);
}

function setRGB(percent, id, section) {
    
    if (section.localeCompare("compressor") == 0) {
        var rgb = calRGB(rgb1, rgb2, percent);

        switch (id) {
            case "thresholdSlider":
                initRGB[0][0] = rgb[0];
                initRGB[0][1] = rgb[1];
                initRGB[0][2] = rgb[2];
                break;
            case "ratioSlider":
                initRGB[1][0] = rgb[0];
                initRGB[1][1] = rgb[1];
                initRGB[1][2] = rgb[2];
                break;
            case "kneeSlider":
                initRGB[2][0] = rgb[0];
                initRGB[2][1] = rgb[1];
                initRGB[2][2] = rgb[2];
                break;
            case "attackSlider":
                initRGB[3][0] = rgb[0];
                initRGB[3][1] = rgb[1];
                initRGB[3][2] = rgb[2];
                break;
            case "releaseSlider":
                initRGB[4][0] = rgb[0];
                initRGB[4][1] = rgb[1];
                initRGB[4][2] = rgb[2];
                break;
        }
    
        var temp = '';
    
        for (let i = 0; i < initRGB.length; i++) {
            temp += "#" + initRGB[i][3] + "Slider::-webkit-slider-thumb {background-color: rgb(" + initRGB[i][0] + ", " + initRGB[i][1] + ", " + initRGB[i][2] + ");} ";
        }
    }
    else if (section.localeCompare("misc") == 0) {
        var rgb = calRGB(rgb3, rgb4, percent);

        switch (id) {
            case "gainSlider":
                miscRGB[0][0] = rgb[0];
                miscRGB[0][1] = rgb[1];
                miscRGB[0][2] = rgb[2];
                break;
            case "panningSlider":
                miscRGB[1][0] = rgb[0];
                miscRGB[1][1] = rgb[1];
                miscRGB[1][2] = rgb[2];
                break;
            case "distortionSlider":
                miscRGB[2][0] = rgb[0];
                miscRGB[2][1] = rgb[1];
                miscRGB[2][2] = rgb[2];
                break;
        }
    
        var temp = '';
    
        for (let i = 0; i < miscRGB.length; i++) {
            temp += "#" + miscRGB[i][3] + "Slider::-webkit-slider-thumb {background-color: rgb(" + miscRGB[i][0] + ", " + miscRGB[i][1] + ", " + miscRGB[i][2] + ");} ";
        }
    }

    //console.log(temp);
        
    document.querySelector("#rgbStyle").innerHTML = temp;
}

function calPercent(s, e, p) {
    return ((e - s) * (p / 100) + s);
}

function calRGB(array1, array2, percent) {
    var r = calPercent(array1[0], array2[0], percent);
    var g = calPercent(array1[1], array2[1], percent);
    var b = calPercent(array1[2], array2[2], percent);

    return [r, g, b]
}

function changeCompressorParameter() {
    switch (this.id) {
        case "thresholdSlider":
            compressor.threshold.value = (this.value - 100);
            setBar(this.id, "threshold", "compressor");
            document.querySelector("#thresholdOutput").innerHTML = (this.value - 100) + " dB";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
        case "ratioSlider":
            setBar(this.id, "ratio");
            compressor.ratio.value = (this.value / 5);
            document.querySelector("#ratioOutput", "compressor").innerHTML = (this.value / 5) + " dB";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
        case "kneeSlider":
            setBar(this.id, "knee");
            compressor.knee.value = (this.value / 2.5);
            document.querySelector("#kneeOutput", "compressor").innerHTML = (this.value / 2.5) + " degree";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
        case "attackSlider":
            setBar(this.id, "attack");
            compressor.attack.value = (this.value / 1000);
            document.querySelector("#attackOutput", "compressor").innerHTML = (this.value / 1000) + " sec";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
        case "releaseSlider":
            setBar(this.id, "release");
            compressor.release.value = (this.value / 1000);
            document.querySelector("#releaseOutput", "compressor").innerHTML = (this.value - 100) + " sec";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
    }
}


function changeMiscParameters() {
    switch(this.id) {
        case "gainSlider":
            setBar(this.id, "gain", "misc");
            let gainValue = (this.value / 10);
            document.querySelector("#gainOutput").innerHTML = gainValue + " dB";
            gain.gain.value = gainValue;
            console.log(gain.gain.value);
            break;
        case "panningSlider":
            setBar(this.id, "panning", "misc");
            let panValue = ((this.value - 50) / 50);
            document.querySelector("#panningOutput").innerHTML = panValue + " LR";
            stereoPanner.pan.value = panValue;
            console.log(stereoPanner.pan.value);
            break;
        case "distortionSlider":
            setBar(this.id, "distortion", "misc");
            document.querySelector("#distortionOutput").innerHTML = this.value;
            distortion.curve = makeDistortionCurve(this.value);
            break;
    }
}

function makeDistortionCurve(amount) {    
    let n_samples = 44100,
        curve = new Float32Array(n_samples);
    
    for (var i = 0; i < n_samples; ++i ) {
        var x = i * 2 / n_samples - 1;
        curve[i] = (Math.PI + amount) * x / (Math.PI + (amount * Math.abs(x)));
    }
    return curve;
};




for (let i = 0; i < iconButtons.length; i++) {
    console.log("Miep?")
    iconButtons[i].addEventListener("click", changeCompressorParameter);
}

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
            oscillator.connect(gain);
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


/*
playStopButton.addEventListener("click", function() {
    if (isPlaying) {
        sound.pause();
        playStopButton.innerHTML = "Play";
    } else {
        playStopButton.innerHTML = "Stop";
        sound.play();
    }

    isPlaying = !isPlaying;
}); */