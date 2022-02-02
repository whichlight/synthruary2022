/**
 * synthruary day 1
 * Prompt: minimalism 
 * 
 * <3 whichlight 
 * 
 * ref: https://p5js.org/examples/sound-note-envelope.html
 * 
 */

let osc, envelope, fft;

// r      3       5    
//54 57 59 61
let bnote = 62;
let mnote = 55; 
let n1 = 50; 
let n2 = 48; 
let n3 = 47; 
let n4 = 57;

let notes = [n1, n2, n1, n3, n4, n2, n1, n3, n1, n2, n1, n3];
let noteIndex = 0; 
let w, h;
let noteLens = [500]; 
let contextStarted = false; 
let timer = 0; 

function touchStarted() {
    if(!contextStarted){
        getAudioContext().resume();
        contextStarted =true;
        let a = select('#instructions');
        a.remove();
    }

    if(contextStarted){
        envelope.setADSR(0.001, 0, 0.8, 1.5);
       // envelope.setADSR(1, 1, 0.5, 1);

        let midiValue = notes[noteIndex];
        let freqValue = midiToFreq(midiValue);
        osc.freq(freqValue);
        envelope.play(osc,0,1);
        envelope.play(osc2,0,1);
        envelope.play(osc3,0,1);
        timer=0;
        noteIndex++;
        noteIndex%=notes.length; 
    }

    return false;
}

function setup() {
    w = windowWidth;
    h = windowHeight;
    colorMode(HSB,360,100,100);
    createCanvas(w, h);
    background(300,30,100);

    osc = new p5.Oscillator('sawtooth')
    osc2 = new p5.Oscillator('sawtooth')
    osc3 = new p5.Oscillator('sawtooth')



    // Instantiate the envelope
    envelope = new p5.Envelope();

    // set attackTime, decayTime, sustainRatio, releaseTime
    envelope.setADSR(1, 1, 0.5, 1);


    // set attackLevel, releaseLevel
    envelope.setRange(0.5, 0);
    osc.start();
    osc2.start();
    osc3.start();
    osc2.freq(midiToFreq(bnote));
    osc3.freq(midiToFreq(mnote));

    fft = new p5.FFT();
    drawTriangle();
}


function draw() {
    timer+=1;

    let r = noteLens[floor(random(noteLens.length))];   
    
    if (timer % r === 0 || frameCount === 1) {
        envelope.setADSR(2, 0, 1, 3);

        let midiValue = notes[floor(random(notes.length))];
        let freqValue = midiToFreq(midiValue);
        osc.freq(freqValue);

        envelope.play(osc,0,3);
        envelope.play(osc2,0,3);
        envelope.play(osc3,0,3);
    }


    let spectrum = fft.analyze();
    for (let i = 0; i < spectrum.length / 20; i++) {
        if(spectrum[i]>0){
            noStroke();
            fill(spectrum[i]/4, 40+(spectrum[i] / 5), 100);
            rect(0, height-20*i, width, spectrum.length / 20);
        }
        
    }
}

function drawTriangle(){
    push();
    translate(width * 0.5, height * 0.5);
    fill(180,100,100);
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

