/**
 * synthruary day 8
 * Prompt: West Coast Synthesis
 * 
 * <3 whichlight 
 * 
 * 
 */



let synths = [];
let contextStarted;
let w, h;
const root = 100;
let ctx;

let fft;
let dataArray;
let bufferLength;


/*************************
 * synth start boilerplate 
 *************************/




function touchStarted() {
    return false;
}

function touchEnded() {
    if (!contextStarted) {
        let a = select('#instructions');
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioContext();
        reverbjs.extend(ctx);
        fft = ctx.createAnalyser();

        fft.fftSize = 2048;
        bufferLength = fft.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);


        setupSynths();
        a.remove();
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(0, 0, 0, 0.8);
    noStroke();
    polygon(0, 0, 50, 3);
    pop();
}

function polygon(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function sum(arr) {
    return arr.reduce((a, b) => a + b);
}


/*************************
 * p5 main fxns
 *************************/

function setup() {
    w = windowWidth;
    h = windowHeight;
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    background(60, 100, 100);
    playButton();
    frameRate(30);
    noStroke();
    rectMode(CENTER);

}

function draw() {
    if (contextStarted) {
        background(60, 0, 40);

        fft.getByteFrequencyData(dataArray);

        let y = 0;
        let ystep = h * 1.0 / bufferLength;
        for (var i = 0; i < (1*bufferLength); i+=2) {
            let v = dataArray[i] / 128.0;
            let x = v *100;
            y = i*ystep;
            v=v**(1/2.);
            v=v*1.3;

            let c= (180*v)%360; 
            fill(c, 100, 100);
           // fill((200+90*v)%360, 100, 100);
            let r = v*(min(w,h)/2); 
            let h2 = h-r/4; 
            ellipse(w/2,(h2/h)*h-y, r, r/2);
        }


        if (mouseIsPressed) {
            group.pressed(mouseX, mouseY);
        }


        if (!mouseIsPressed && group.playing) {
            group.stop();
        }

    }



}


/*************************
 * synthy things objects
 *************************/

class Synth {
    constructor(freq) {
        this.gain = ctx.createGain();
        this.gain.gain.value = 0;

        this.filter = ctx.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.frequency.setValueAtTime(1000, ctx.currentTime)
        this.filter.Q.value = 1;

        this.waveshaper = ctx.createWaveShaper();
        this.waveshaper.curve = makeDistortionCurve(400);
        this.waveshaper.oversample = '4x';

        this.osc = ctx.createOscillator();
        this.osc.frequency.value = freq;
        this.osc.type = "triangle";

        this.osc.connect(this.waveshaper);
        this.waveshaper.connect(this.filter);
        this.filter.connect(this.gain);
        this.osc.start();
    }

    play() {
        this.gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.1);
    }

    release() {
        this.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    }

    setNote(freq) {
        this.osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.001);
    }

    setFilter(freq) {
        this.filter.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.001);
    }

    connect(out) {
        this.gain.connect(out)
    }
}



class Group {
    constructor() {
        this.root = root;
        this.prange = [2, 15];
        this.frange = [3, 50];
        this.playing = false;


        this.gain = ctx.createGain();
        this.gain.gain.value = 1;
        this.synth = new Synth(this.root);

        // Create a compressor node
        this.compressor = ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-50, ctx.currentTime);
        this.compressor.knee.setValueAtTime(40, ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, ctx.currentTime);
        this.compressor.attack.setValueAtTime(0, ctx.currentTime);
        this.compressor.release.setValueAtTime(0.01, ctx.currentTime);

        let compressor = this.compressor;


        //trying our different reverbs
        // var reverbUrl = "http://reverbjs.org/Library/R1NuclearReactorHall.m4a";
        // var reverbUrl = "http://reverbjs.org/Library/TerrysTypingRoom.m4a";
        // var reverbUrl = "http://reverbjs.org/Library/MidiverbMark2Preset29.m4a";
        //var reverbUrl = "http://reverbjs.org/Library/KinoullAisle.m4a";
        //var reverbUrl = "http://reverbjs.org/Library/Basement.m4a";
        let reverbUrl = "audio/ErrolBrickworksKiln.mp4";




        let reverb = ctx.createReverbFromUrl(reverbUrl, function () {
            reverb.connect(compressor);
        });
        this.reverb = reverb;

        this.synth.connect(this.gain);
        this.gain.connect(this.reverb);
        this.compressor.connect(fft);
        fft.connect(ctx.destination)


    }

    pressed(_x = 0, _y = 0) {
        let x = map(_x, 0, w, this.prange[0], this.prange[1]) ** 3;
        let y = map(_y, h, 0, this.frange[0], this.frange[1]) ** (2);

        let a = map(_x, 0, w, 1, 1000);
        let b = map(_y, h, 0, 1, 1000);

        this.synth.setNote(x);
        this.synth.setFilter(y);
        this.synth.waveshaper.curve = makeDistortionCurve(400, a, b);



        this.play();
    }

    play() {
        this.synth.play();
        this.playing = true;
    }

    stop() {
        this.synth.release();
        this.playing = false;
    }
}

function makeDistortionCurve(amount, a = 100, b = 10) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;

    for (; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = b * sin(a * x) + a * sin(b * x);
    }
    return curve;
};


/*************************
 * synthy things setup
 *************************/

function setupSynths() {
    group = new Group();
}




