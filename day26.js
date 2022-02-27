/**
 * synthruary day 26
 * Prompt: Synaesthesia
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let group;
let types = ['triangle', 'sawtooth', 'square'];


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
        background(0, 0, 0, 100);
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(0, 0, 100);
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
    background(0, 0, 0, 100);

    playButton();
    frameRate(20);
    noStroke();

    rectMode(CENTER);
}

function draw() {
    if (contextStarted) {
        background(0,0,0,0.1);
 
        stroke(0,0,100,0.1);
        line(w/3, 0, w/3, h); 


        stroke(0,0,100,0.1);
        line(2*w/3, 0, 2*w/3, h); 

        if(mouseIsPressed){
            controls();
        }
    }
}

function controls(){
    let p = quantize(map(mouseY,0,h, 70, 50));
    p = constrain(p,50,70);
    let r = map(p, 50, 70, 100, 300);
    let t = floor(map(mouseX, 0, w, 0,3));
    let c = map(p%12, 0, 11, 0, 300); 
    t = constrain(t, 0, 2);
    group.synths[0].osc.oscillator.type = types[t];
    group.synths[0].setNote(p);
   
    fill(c,100,100);

    push(); 
    translate(mouseX,mouseY); 
    strokeWeight(5);
    stroke(c,50,100);
    if(t==0) ellipse(0, 0, r,r);
    if(t==1) {
        rotate(-PI/2);
        polygon(0, 0, r/2,3);
    }
    if(t==2) rect(0, 0, r,r);
    pop(); 

}

function synthOn() {
    controls();
    group.clicked(mouseX, mouseY);
}

function synthRelease() {
    group.release();
}

function setupQuantize() {
    notes = [];
    let intervals = [0, 2, 4, 5, 7, 9, 10];
    for (j = 0; j < 20; j++) {
        val = intervals.map((i) => (i + 12 * j));
        notes = notes.concat(val);
    }
}

function quantize(p) {
    p = floor(p);
    let q = null;
    let i = 0;
    while (q == null) {
        q = notes.find(s => s == p + i);
        i++;
    }
    if (q == -1) q = 0;
    return q;
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
   
    group = new Group();
    setupQuantize(); 
}

class Note {
    constructor(note=root, pos=createVector(w/2,h/2)) {
        this.root = note;
        this.note = note; 
        this.toplay = [];
        this.effect = new Tone.Reverb(0.7).toDestination();
        this.lowfilter = new Tone.Filter(2000, "lowpass").connect(this.effect);
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 2;
        this.osc.volume.value = 0;
        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = pos;
        this.r = min(100, min(w, h) / 8);
        this.start = millis(); 
        this.rate = 500; 
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r/2)
    }

    play() {
        this.osc.triggerAttack(this.pitch, 0.01);
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
        this.note = p; 
        this.pitch = m;
        this.osc.oscillator.frequency.value = m;
    }

    release() {
        this.osc.triggerRelease();
    }

    update(){
        if(millis() - this.start > this.rate){

        }
    }

    display() {
        
    }
}

class Group {
    constructor(synths) {
        this.synths = [];
        this.synths.push(new Note()); 
   

    }

    clicked(x, y) {
        this.play();
    }

    play() {
        this.synths.forEach((s) => { s.play(); });
    }

    release() {
        this.synths.forEach((s) => { s.release(); });
    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




