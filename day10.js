/**
 * synthruary day 10
 * Prompt: Rests and silence 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let bgcolor = [120,50,100];
let textcolor = [260, 50, 100];
let breathcolor = [60, 50, 100]; 


/*************************
 * synth start boilerplate 
 *************************/
function touchStarted() {
    if(contextStarted){
        synthPressed(); 
    }
    return false;
}

function touchEnded() {
    if (!contextStarted) {
        Tone.start();
        let a = select('#instructions');
        a.remove();
        background(bgcolor[0], bgcolor[1], bgcolor[2]);
        contextStarted = true;
    }

    if (contextStarted) {
        synthReleased();
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(breathcolor[0],breathcolor[1],breathcolor[2]);
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
    background(bgcolor[0], bgcolor[1], bgcolor[2]);
    playButton();
    frameRate(20);
    noStroke();
    textAlign(CENTER, CENTER);
}

function draw() {
    if (contextStarted) {
        background(bgcolor[0], bgcolor[1], bgcolor[2]);
        group.displayBreath(); 
        group.displayText(); 
        group.loop(); 
    }
}

function synthPressed() {
    group.pressed();
}

function synthReleased() {
    group.released();
}



/*************************
 * synthy things 
 *************************/


function setupSynths() {
    let root = 55;
    let intervals = [0, 5, 7, 16, 19];
    let vols = [-2, -5, -10, -10, -10];
    let synths = [];
    notes = intervals.map((i) => root + i);




    notes.forEach((n, i) => {
        synths.push(new Note(n, vols[i]));
    })

    group = new Group(synths);

}

class Note {
    constructor(note, vol) {
        // this.comp = new Tone.Compressor(-5, 3).toDestination();
        this.lowfilter = new Tone.Filter(1000, "lowpass");
        this.highfilter = new Tone.Filter(200, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.lowfilter.Q.value = 1; 
        this.highfilter.Q.value = 1; 

        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.attack = 5;
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;

        this.osc.envelope.release = 10;
        this.osc.volume.value = -2*abs(vol);
        this.note = note;
        this.pitch = Tone.Frequency(this.note, "midi");
    }

    play() {
        this.osc.triggerAttack(this.pitch);
    }

    release() {
        this.osc.triggerRelease();
    }

}

class Group {
    constructor(synths) {
        this.synths = synths;
        this.activeNoteIndex;
        this.state=2; 
       // this.states = [0, 1, 2, 3];
      //  this.states = ["prompt-in", "counter-in", "prompt-out", "counter-out"];
        this.active = false;
        this.counter = 0; 
        this.compressor = new Tone.Compressor(-40, 20);
        this.compressor.release.value = 0.01;
        this.compressor.toDestination(); 
        this.synths.forEach((s)=>{
            s.lowfilter.connect(this.compressor);  
        });
        this.start = 0; 
        this.elapsed = millis(); 

    }

    displayText(){
        textSize(w/15);
        let s = "press and breathe in. \n let go and breathe out.";
        switch(this.state){
            case 0: 
                s = "gently breathing in";
                this.elapsed = millis()-this.start; 
                this.counter = this.elapsed*2; 
                break;
            case 1: 
                s = "exhale and let go";
                if(this.elapsed>0 && this.counter > 0) {
                    this.counter = this.elapsed*2 + (this.start- millis());
                }; 
                break;
        }
        textFont('Georgia');
        fill(textcolor[0],textcolor[1],textcolor[2]);
        text(s, w/2, h/2);


    }

    displayBreath(){
        let r = map(this.counter/1000,0, 8, 0, min(w,h));
        fill(breathcolor[0],breathcolor[1],breathcolor[2]);
        ellipse(w/2,h/2,r,r);
    }

    pressed() {
        this.active = true;
        if (this.active) {
            this.start = millis(); 
            this.state = 0; 
            this.synths.forEach((s) => {
                s.release();
            });
        }
    }

    released() {
        if (this.active) {
            this.start = millis(); 
            this.state = 1;

            this.activeNoteIndex = map(this.counter/1000, 0, 8, 0, this.synths.length);
            let f = map(this.counter/1000, 0, 8, 0, 1000);

            this.synths.forEach((s,i) => {
                if(i<this.activeNoteIndex){
                    s.play();
                    s.lowfilter.frequency.value = f;
                }
            });
        }

    }

    loop(){
        if(this.active){
            if(this.counter < 0.01){
                this.synths.forEach((s) => {
                    s.release();
                });
            }
        }
    }

}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




