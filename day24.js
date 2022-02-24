/**
 * synthruary day 24
 * Prompt: ASMR
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let group;
let pos_i, pos_f; 
let side; 
let col = 60; 
let diff = -0.01; 


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
        contextStarted = true;
        background(50,100,100);
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
    setupSynths();
    background(50,100,100);

    playButton();
    frameRate(20);
    noStroke();
    side = min(100, min(w, h) / 8);

}

function draw() {
    if (contextStarted) {
        if(mouseIsPressed && group.active ){
            background(50,100,100,0.02);
            pos_f = createVector(mouseX, mouseY); 
            let v = p5.Vector.sub(pos_i, pos_f);
            console.log(v.mag());
            (v.mag()>0) ? group.play() : group.release(); 
            let f = map(v.mag(),0,200, 1500, 5000); 
            f = constrain(f, 500, 5000);
            group.synths[0].setFreq(f);

            stroke(col,100,100);
            strokeWeight(side);
            line(pos_i.x, pos_i.y, pos_f.x, pos_f.y);
           // ellipse(mouseX,mouseY,side,side);
           pos_i = pos_f; 
           col+=diff;
           if(col < 30) diff = -1*diff; 
           if(col > 60) diff = -1*diff; 

        } 
    }
}

function synthOn() {
    group.active = true; 
    pos_i = createVector(mouseX, mouseY); 
    group.clicked(mouseX, mouseY);
}

function synthRelease() {
    group.active = false; 
    group.release();
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
   
    group = new Group();
}

class Note {
    constructor(note=root, pos=createVector(w/2,h/2)) {
        this.root = note;
        this.note = note; 
        this.toplay = [];
        this.f = 2000
        this.lowfilter = new Tone.Filter(this.f, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(3000, "highpass").connect(this.lowfilter);
        this.osc = new Tone.NoiseSynth().connect(this.highfilter);
        this.osc.envelope.attack = 0.5;
        this.osc.envelope.decay = 0;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 0.1;
        this.lowfilter.Q.value = 0; 
        this.osc.volume.value = 30;
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

    setFreq(f){
        this.f = f; 
        group.synths[0].lowfilter.frequency.linearRampToValueAtTime(this.f, 0.5); 
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
        this.note = p; 
        this.pitch = m;
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
        this.active = false; 
   

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




