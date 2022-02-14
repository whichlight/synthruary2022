/**
 * synthruary day 13
 * Prompt: Voice 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let mic, fft; 
let ctx, pitch; 
let modelIsLoaded = false; 
let synthActive = false; 

/*************************
 * synth start boilerplate 
 *************************/
function touchStarted() {
    if (contextStarted) {
        synthOn();
    }
    return false;
}

function touchEnded() {
    if (contextStarted) {
        synthRelease();
    }

    if (!contextStarted) {
        setupSynths();
        let a = select('#instructions');
        a.remove();
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(180, 100, 100);
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


/*************************
 * p5 main fxns
 *************************/

function setup() {
    w = windowWidth;
    h = windowHeight;
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    background(300, 100, 100, 100);
    playButton();
    frameRate(20);
    rectMode(CENTER);
    strokeWeight(5);

}

function drawMic(){
    let spectrum = fft.analyze();
    fill(300,100,100);
    stroke(180,100,100);
    let len = 50; 
    for (i = 0; i < len; i++) {
        let x = map(spectrum[i], 0, 255, h/len, w);
        let y = map(i,0, len, h, 0)-7.5;
        push()
        translate(w/2,y);
        rect(0,0,x,h/len);
        pop();
    }
}

function draw() {
    if (contextStarted && modelIsLoaded) {
        if(synthActive){
            background(60,100,100);
        }
        else{
            background(300,100,100);
            group.release();  
        }

        drawMic(); 


        if(synthActive){
            pitch.getPitch(function(err, frequency) {
                if (frequency) {
                    group.play(frequency);
                    group.draw(frequency);
                    console.log(frequency);
                } else{
                    group.release();  
                }
              });
        }
    }
}



function synthOn() {
    synthActive = true; 
}

function synthRelease() {
    synthActive = false; 
}

/*************************
 * synthy things 
 *************************/

 function startPitch() {
    pitch = ml5.pitchDetection('./model/', ctx , mic.stream, modelLoaded);
  }

  function modelLoaded() {
    background(300, 100, 100, 100);
    console.log('model loaded');
    modelIsLoaded = true; 
  }

function setupSynths() {

    userStartAudio();
    ctx = getAudioContext(); 
    mic = new p5.AudioIn();
    mic.start(startPitch);
    fft = new p5.FFT();
    fft.setInput(mic);


    let root = 0;
    let intervals = [0, 7, 12, 16];
    let synths = [];
    notes = intervals.map((i) => root + i);
    synths = notes.map((n) => new Note(n, createVector(w/2,h/2)));
    group = new Group(synths);
    fft = new p5.FFT();
    fft.setInput(mic);
}

class Note {
    constructor(interval, pos) {
        this.root = 50;
        this.lowfilter = new p5.LowPass();
        this.lowfilter.freq(800); 
        this.synth = new p5.MonoSynth();
        this.synth.oscillator.oscillator.type = "sawtooth";
        this.synth.setADSR(0.01, 1, 1, 0.1);
        this.vol = 10;
        this.synth.amp(this.vol);
        this.pitch = midiToFreq(this.root)
        this.interval = interval; 
        this.pos = pos;
        this.r = min(100, min(w, h) / 8);
        this.sat = 100;
        this.d = 5;
        this.playing = false;
        this.col = 240;
        this.synth.disconnect(); 
        this.synth.connect(this.lowfilter)


    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    setNote(p) {
        let m = freqToMidi(p)+this.interval;
        this.pitch = midiToFreq(m);
    }

    play() {
        this.playing = true;
        this.synth.triggerAttack(this.pitch);

    }


    release() {
        this.synth.triggerRelease();
        this.playing = false;
    }

    glow() {
        this.sat = 0;
    }


    display() {

    }
}

class Group {
    constructor(synths) {
        this.synths = synths;
        this.playing = false;

    }


    clicked(x, y) {
        this.play();
    }

    play(p) {
        this.synths.forEach((s) => { s.setNote(p); });
        this.synths.forEach((s) => { s.play(); });
        this.playing = true;
    }

    release() {
        this.synths.forEach((s) => { s.release(); });
        this.playing = false;
    }

    draw(f){
        let r = min(w,h)/10;
        let a = map(f, 0, 500, h, 0);
        stroke(180,100,100,100);
        fill(0,100,100,100);
        push();
        translate(w/2,a);
        rotate(PI/4);
        rect(0, 0, r,r);
        pop();
    }

}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




