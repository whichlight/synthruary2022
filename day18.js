/**
 * synthruary day 18
 * Prompt: FM synthesis
 * 
 * <3 whichlight 
 * 
 * 
 */


let contextStarted;
let w, h;
const root = 200;
let group;
let fft;


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
        Tone.start();
        let a = select('#instructions');
        a.remove();
        background(0,100,100);
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(0, 0, 30);

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
    setupSynths();
    background(0,100,100);
    playButton();
    frameRate(50);
    noStroke();
}

function draw() {
    if (contextStarted) {
        background(0,100,100);
        displayGrid();

        if (mouseIsPressed) {
            controls();
            displayParams();
        }
        
    
       // waves();

    }
}

function waves() {
    let waveform = group.fft.getValue(); 
    noFill();
    beginShape();
    strokeWeight(2);
    stroke(0,0,100);
    let maxVal = 0;
    let minVal = 1000;
    for (let i = 0; i < waveform.length; i++) {
        let x = map(i, 0, waveform.length, w, 0);
        let y = map(-1*waveform[i]/2, 0, 110, 0, h);
       vertex(x, y);


    }
    endShape();

}

function displayGrid(){
    strokeWeight(1);

    for(let num = 0; num <8; num++){
        for(let i = 0; i<num; i++){
            let x = i*w/num; 
            let y = i*h/num;
            stroke(0,0,30,0.5);

            line(x,0,x,h);
            line(0,y,w,y);

         }
    }
    

    stroke(0,0,30,1);
    line(0,0,w,h);
    line(0,h,w,0);


}

function displayParams(){
    strokeWeight(2);
    let a = group.display_a; 
    let b = group.display_b; 
    let num = 500; 
    beginShape();
    noFill();
    for(let i=0; i<num; i++){
        let x = w/2+w/2*cos(b*i/root+frameCount);
        let y = h/2+h/2*cos(a*i/root+frameCount);
        stroke(180,100,100);
        vertex(x,y);
    }
    endShape();
}

function controls() {
        let x = map(mouseX, 0, w, 0.01, 40) ** 2;
        let y = map(mouseY, 0, h, 0.01, 40) ** 2;
        group.fm.osc.frequency.value = x;
        group.fm2.osc.frequency.value = y;
        group.synth.osc.frequency.value = y;
        group.display_a = (x); 
        group.display_b = (y);
   
}

function synthOn() {
    group.play();
}

function synthRelease() {
    group.release();
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
    group = new Group();
}

class Note {
    constructor(_root, type) {
        this.root = _root;
        this.note = this.root;
        this.toplay = [];
        this.lowfilter = new Tone.Filter(10000, "lowpass");
        this.highfilter = new Tone.Filter(0, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = type;
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 0;
        this.osc.volume.value = -30;
        this.pitch = Tone.Frequency(this.root);
        this.pos = createVector(w / 2, h / 2);
        this.r = min(100, min(w, h) / 8);
        this.start = millis();
        this.rate = 500;
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
        this.osc.triggerAttack(this.pitch, 0.5);
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
        this.note = p;
        this.pitch = m;
    }

    release() {
        this.osc.triggerRelease();
    }

    update() {

    }

    display() {

    }
}

class Group {
    constructor() {
        this.synths = [];
        this.synth = new Note(root, "square");
        this.fm = new Note(root, "pulse");
        this.fm2 = new Note(root, "sawtooth");



        //disconnect from output, connect to pitch
        this.fm.osc.disconnect();
        this.fm2.osc.disconnect();

        this.fm2.osc.connect(this.synth.osc.frequency);
     //   this.fm2.osc.connect(this.fm.osc.frequency);

        this.fm2.osc.volume.value = 50;
        this.fm2.osc.frequency.value = 100;


        this.fm.osc.connect(this.synth.osc.frequency);
        this.fm.osc.volume.value = 50;
        this.fm.osc.frequency.value = 100;

        this.fft = new Tone.FFT(); 


        this.synth.lowfilter.connect(this.fft);
        this.fft.toDestination();
        this.display_a = 100;
        this.display_b = 100; 
        this.active = false; 

    }

    clicked(x, y) {

    }

    play() {
        this.fm.play();
        this.fm2.play();
        this.synth.play();
        this.active = true; 

    }

    release() {
          this.fm.release();
          this.fm2.release();
         this.synth.release();
         this.active = false; 

    }

    loop() {

    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




