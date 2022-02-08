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


/*************************
 * synth start boilerplate 
 *************************/

const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

function touchStarted() {
    return false;
}

function touchEnded() {
    if (!contextStarted) {
        let a = select('#instructions');
        a.remove();
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(0, 0, 100, 0.8);
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
    setupSynths();
    background(300, 100, 100);
    playButton();
    frameRate(30);
    noStroke();
    rectMode(CENTER);
}

function draw() {
    if (contextStarted) {
        background(300, 100, 100);



    }

    if (mouseIsPressed && contextStarted) {
        group.pressed(mouseX, mouseY);
    }
    if (!mouseIsPressed && contextStarted && group.playing) {
        group.stop();
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

        this.osc = ctx.createOscillator();
        this.osc.frequency.value = freq;
        this.osc.type = "triangle";

        this.osc.connect(this.filter);  
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
        this.osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.1);
    }

    connect(out){
        this.gain.connect(out)
    }
}



class Group {
    constructor() {
        this.root = root;
        this.frange = [50, 500];
        this.playing = false;

        this.waveshaper = ctx.createWaveShaper(); 
        this.waveshaper.curve =  makeDistortionCurve(400);
        this.waveshaper.oversample = '4x';

        this.gain = ctx.createGain();
        this.gain.gain.value = 1;

        this.gain.connect(ctx.destination);
        this.synth = new Synth(this.root);
        this.synth.connect(this.waveshaper);
        this.waveshaper.connect(this.gain)
        
        
    }

    pressed(_x = 0, _y = 0) {
        let x = map(_x, 0, w, this.frange[0], this.frange[1]);
        this.play(this.root + x);
    }

    play(f) {
        this.synth.setNote(f);
        this.synth.play();
        this.playing = true;
    }

    stop() {
        this.synth.release();
        this.playing = false;
    }
}

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  };


/*************************
 * synthy things setup
 *************************/

function setupSynths() {
    group = new Group();
}




