// Hilfsvariablen & HTML Elemente

let playStopButton = document.querySelector("#playStopButton");

let iconButtons = document.querySelectorAll(".icon");

let reverbRoomButton = document.querySelector("#reverbRoom");
let reverbCaveButton = document.querySelector("#reverbCave");
let reverbChurchButton = document.querySelector("#reverbChurch");
let reverbGarageButton = document.querySelector("#reverbGarage");
let reverbButton = document.querySelector("#reverbOnOffSwitch");

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
var prevGain = 1;

let stereoPanner = context.createStereoPanner();
    //let delay = context.createDelay(4.0);
let convolver = context.createConvolver();
let compressor = context.createDynamicsCompressor();
    //let filter = context.createBiquadFilter();
let distortion = context.createWaveShaper();

// Initialwerte setzen
let hasReverb = false;
let currentReverbType = "";

let tempNote;

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
            document.querySelector("#ratioOutput").innerHTML = (this.value / 5) + " dB";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
        case "kneeSlider":
            setBar(this.id, "knee");
            compressor.knee.value = (this.value / 2.5);
            document.querySelector("#kneeOutput").innerHTML = (this.value / 2.5) + " degree";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
        case "attackSlider":
            setBar(this.id, "attack");
            compressor.attack.value = (this.value / 1000);
            document.querySelector("#attackOutput").innerHTML = (this.value / 1000) + " sec";
            //document.querySelector("#reductionOutput").innerHTML = compressor.reduction.value;
            break;
        case "releaseSlider":
            setBar(this.id, "release");
            compressor.release.value = (this.value / 1000);
            document.querySelector("#releaseOutput").innerHTML = (this.value - 100) + " sec";
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
        /*    
        case "distortionSlider":
            setBar(this.id, "distortion", "misc");
            document.querySelector("#distortionOutput").innerHTML = this.value;
            distortion.curve = makeDistortionCurve(this.value);
            break;*/
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

/*
reverbRoomButton.addEventListener("click", function() {
    //console.log(currentReverbType);
    if(hasReverb) {
        //console.log(currentReverbType.localeCompare("room"));
        if (currentReverbType.localeCompare("room") == 0) {
            //console.log("Here");
            convolver.disconnect();

            distortion.connect(gain);
            hasReverb = false;
            reverbRoomButton.style.background = "rgb(233, 235, 237)";
        } else {
            //console.log("Moin");
            loadImpulseResponse("room");    
        }
    } 
    else { 
        loadImpulseResponse("room");
        
        if(convolver) {convolver.disconnect();}

        distortion.disconnect();

        distortion.connect(convolver);
        convolver.connect(gain);

        hasReverb = true;
    }   
});

reverbGarageButton.addEventListener("click", function() {
    //console.log(currentReverbType);
    if(hasReverb) {
        //console.log(currentReverbType.localeCompare("garage"));
        if (currentReverbType.localeCompare("garage") == 0) {
            console.log("Here");
            convolver.disconnect();

            distortion.connect(gain);
            hasReverb = false;
            reverbGarageButton.style.background = "rgb(233, 235, 237)";
        } else {
            //console.log("Moin");
            loadImpulseResponse("garage");    
        }
    } 
    else { 
        loadImpulseResponse("garage");
        
        if(convolver) {convolver.disconnect();}

        distortion.disconnect();

        distortion.connect(convolver);
        convolver.connect(gain);

        hasReverb = true;
    }   
});

reverbCaveButton.addEventListener("click", function() {
    //console.log(currentReverbType);
    if(hasReverb) {
        //console.log(currentReverbType.localeCompare("room"));
        if (currentReverbType.localeCompare("cave") == 0) {
            console.log("Here");
            convolver.disconnect();

            distortion.connect(gain);
            hasReverb = false;
            reverbCaveButton.style.background = "rgb(233, 235, 237)";
        } else {
            //console.log("Moin");
            loadImpulseResponse("cave");    
        }
    } 
    else { 
        loadImpulseResponse("cave");
        
        if(convolver) {convolver.disconnect();}

        distortion.disconnect();

        distortion.connect(convolver);
        convolver.connect(gain);

        hasReverb = true;
    }   
});

reverbChurchButton.addEventListener("click", function() {
    //console.log(currentReverbType);
    if(hasReverb) {
        //console.log(currentReverbType.localeCompare("room"));
        if (currentReverbType.localeCompare("church") == 0) {
            console.log("Here");
            convolver.disconnect();

            distortion.connect(gain);
            hasReverb = false;
            reverbChurchButton.style.background = "rgb(233, 235, 237)";
        } else {
            //console.log("Moin");
            loadImpulseResponse("church");    
        }
    } 
    else { 
        loadImpulseResponse("church");
        
        if(convolver) {convolver.disconnect();}

        distortion.disconnect();

        distortion.connect(convolver);
        convolver.connect(gain);

        hasReverb = true;
    }   
});*/


function loadImpulseResponse(name) {
    if(name == undefined)
        name = "room";

    fetch("/impulseResponses/" + name + ".wav")
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => context.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            if (convolver) {convolver.disconnect();}
            
            /*
            hasReverb = true;
            currentReverbType = name;

            switch (name) {
                case "room":
                    reverbRoomButton.style.background = "rgb(242, 187, 5)";

                    reverbChurchButton.style.background = "rgb(233, 235, 237)";
                    reverbCaveButton.style.background = "rgb(233, 235, 237)";
                    reverbGarageButton.style.background = "rgb(233, 235, 237)";
                    break;
                case "church":
                    reverbRoomButton.style.background = "rgb(233, 235, 237)";

                    reverbChurchButton.style.background = "rgb(242, 187, 5)";

                    reverbCaveButton.style.background = "rgb(233, 235, 237)";
                    reverbGarageButton.style.background = "rgb(233, 235, 237)";
                    break;
                case "cave":
                    reverbRoomButton.style.background = "rgb(233, 235, 237)";
                    reverbChurchButton.style.background = "rgb(233, 235, 237)";

                    reverbCaveButton.style.background = "rgb(242, 187, 5)";

                    reverbGarageButton.style.background = "rgb(233, 235, 237)";
                    break;
                case "garage":
                    reverbRoomButton.style.background = "rgb(233, 235, 237)";
                    reverbChurchButton.style.background = "rgb(233, 235, 237)";
                    reverbCaveButton.style.background = "rgb(233, 235, 237)";

                    reverbGarageButton.style.background = "rgb(242, 187, 5)";
                    break;
            }*/

            convolver = context.createConvolver();
            convolver.buffer = audioBuffer;
            convolver.normalize = true;

            // Hier wird der Audiograph zusammengebaut
            oscillator.connect(stereoPanner);
            
            // delay.connect(stereoPanner);
            stereoPanner.connect(compressor);
            compressor.connect(distortion);
            //filter.connect(distortion);
            distortion.connect(convolver);
            convolver.connect(gain);
            gain.connect(context.destination);
        })
        .catch(console.error);
}

window.setInterval(function()
{
    document.getElementById("outputImage").src = "output.jpg?random="+new Date().getTime(); 
}, 50);


function startNote(note) {
    oscillator.frequency.value = allFrequencies[note];
    gain.gain.value = prevGain;
       
}

function stopNote(note) {
    console.log("stopnote "+ note);
    if(gain.gain.value > 0)
        prevGain = gain.gain.value;  
    gain.gain.value = 0;    
}

function controlChange(controllerNr, value) {
    switch(value)     
    {
        case 1:     
            loadImpulseResponse("room");
            distortion.curve = makeDistortionCurve(0);
            break;
        case 2:
            loadImpulseResponse("room");
            distortion.curve = makeDistortionCurve(1);
            break;
        case 3:
            loadImpulseResponse("church");
            distortion.curve = makeDistortionCurve(0);
            break;
        case 4:
            loadImpulseResponse("church");
            distortion.curve = makeDistortionCurve(1);
            break;
    }
}

function programChange(program, channel) {
    //tempNote = program;
}


playStopButton.addEventListener("click", function() {
    if (isPlaying) {
        oscillator.stop();
        playStopButton.innerHTML = "Play";
    } else {
        oscillator = context.createOscillator();
        oscillator.frequency = 5000;    
        oscillator.start();
        loadImpulseResponse();
        playStopButton.innerHTML = "Stop";
    }

    isPlaying = !isPlaying;
}); 


var allFrequencies = [
    8.1757989156,       8.6619572180,       9.1770239974,
    9.7227182413,       10.3008611535,      10.9133822323,
    11.5623257097,      12.2498573744,      12.9782717994,
    13.7500000000,      14.5676175474,      15.4338531643,
    16.351597831287414, 17.323914436054505, 18.354047994837977,
    19.445436482630058, 20.601722307054366, 21.826764464562746,
    23.12465141947715,  24.499714748859326, 25.956543598746574,
    27.5,               29.13523509488062,  30.86770632850775,
    32.70319566257483,  34.64782887210901,  36.70809598967594,
    38.890872965260115, 41.20344461410875,  43.653528929125486,
    46.2493028389543,   48.999429497718666, 51.91308719749314,
    55,                 58.27047018976124,  61.7354126570155,
    65.40639132514966,  69.29565774421802,  73.41619197935188,
    77.78174593052023,  82.4068892282175,   87.30705785825097,
    92.4986056779086,   97.99885899543733,  103.82617439498628,
    110,                116.54094037952248, 123.47082531403103,
    130.8127826502993,  138.59131548843604, 146.8323839587038,
    155.56349186104046, 164.81377845643496, 174.61411571650194,
    184.9972113558172,  195.99771799087463, 207.65234878997256,
    220,                233.08188075904496, 246.94165062806206,
    261.6255653005986,  277.1826309768721,  293.6647679174076,
    311.1269837220809,  329.6275569128699,  349.2282314330039,
    369.9944227116344,  391.99543598174927, 415.3046975799451,
    440,                466.1637615180899,  493.8833012561241,
    523.2511306011972,  554.3652619537442,  587.3295358348151,
    622.2539674441618,  659.2551138257398,  698.4564628660078,
    739.9888454232688,  783.9908719634985,  830.6093951598903,
    880,                932.3275230361799,  987.7666025122483,
    1046.5022612023945, 1108.7305239074883, 1174.6590716696303,
    1244.5079348883237, 1318.5102276514797, 1396.9129257320155,
    1479.9776908465376, 1567.981743926997,  1661.2187903197805,
    1760,               1864.6550460723597, 1975.533205024496,
    2093.004522404789,  2217.4610478149766, 2349.31814333926,
    2489.0158697766,    2637.02045530296,   2793.825851464031,
    2959.955381693075,  3135.9634878539946, 3322.437580639561,
    3520,               3729.3100921447194, 3951.066410048992,
    4186.009044809578,  4434.922095629953,  4698.63628667852,
    4978.031739553295,  5274.04091060592,   5587.651702928062,
    5919.91076338615,   6271.926975707989,  6644.875161279122,
    7040,               7458.620184289437,  7902.132820097988,
    8372.018089619156,  8869.844191259906,  9397.272573357044,
    9956.06347910659,   10548.081821211836, 11175.303405856126,
    11839.8215267723,   12543.853951415975];