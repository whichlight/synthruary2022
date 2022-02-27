/**
 * synthruary day 15
 * Prompt: Sample and hold 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 50;
let group;
let numSynths = 7;
let notes = [];


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
        background(60, 50, 100, 100);
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
    setupSynths();
    background(60, 50, 100, 100);
    playButton();
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {
        background(0,0,100,0.1);
        if (mouseIsPressed) {

            let x= floor(map(mouseX, 0, w, 10,1));
            let y = floor(map(mouseY, 0, h, 9, 2));

            for (let k = 1; k < 5; k ++) {
                    for (let i = 0; i < 20; i++) {
                        for (let j = 0; j < numSynths; j++) {
                            let r = x*(i+j+k);
                            if (frameCount % r == 0) {
                                let p = quantize(root +i+y*j);
                                group.synths[j].setNote(p);
                                group.synths[j].play(); 
                              //  group.draw();

                                //draw 
                                strokeWeight(2);
                                stroke(0,0,100,0.1);
                                let c = map(group.synths[j].note, 50,100, 0, 180);
                                fill(c, 100,100,0.1);

                                let s = w/4; 
                                rect((k-1)*s, 0, s, h/3); 

                                 s = w/20;
                                rect(i*s, h/3, s, h/3); 


                                 s = w/numSynths;
                                rect(j*s, 2*h/3, s, h/3); 

    
                            }
                        }
                    }
            }
        }
    }
} 

function setupQuantize() {
    notes = [];
    let intervals = [0, 2, 3, 5, 7, 10];
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

function synthOn() {
    group.clicked(mouseX, mouseY);
}

function synthRelease() {
    group.release();
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
    setupQuantize();
    group = new Group();
}

class Note {
    constructor(note = root, pos = createVector(w / 2, h / 2)) {
        this.root = note;
        this.note = note;
        this.toplay = [];
        this.lowfilter = new Tone.Filter(800, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.decay = 0;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 2;
        this.osc.volume.value = -20;
        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = pos;
        this.r = min(100, min(w, h) / 8);
        this.start = millis();
        this.rate = 500;
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
        this.osc.triggerAttackRelease(this.pitch, 0.3);
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
        this.note = p;
        this.pitch = m;
        this.osc.oscillator.frequency.value = m;
    }

    release() {
        //this.osc.triggerRelease();
    }

    update() {
        if (millis() - this.start > this.rate) {

        }
    }

    display() {

    }
}

class Group {
    constructor(synths) {
        this.synths = [];

        for (let i = 0; i < numSynths; i++) {
            this.synths.push(new Note());
        }

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

    draw(){
        this.synths.forEach((s,i) => { 
            let side = w/numSynths; 
            let c = map(s.note, 50,100, 0, 180);
            fill(c, 100,100);
            rect(i*side,(side*frameCount%h), side, side); 
        
        });


    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




