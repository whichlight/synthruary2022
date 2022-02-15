/**
 * synthruary day 14
 * Prompt: Deep listening 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let group; 
const pMin = 30; 
const pMax = 60; 
const breatheTime = 4;


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
    fill(0, 100, 100);
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
    background(0, 100, 50);
    playButton();
    frameRate(20);
}



function draw() {
    if (contextStarted) {
        background(240,100,100);
       
      
        group.drawPitches(); 

      
        if(group.you.isReady() && !group.matched){
            group.youPlay(); 
        }

        if(group.isMatch() && !group.matched){
            group.matched = true; 
        }

        if(group.matched && group.you.isReady() && group.me.isReady()){
            group.youNextNote(); 
            group.matched = false; 
        }

    }
}


/*************************
 * synthy things 
 *************************/

function synthOn(){
    if(group.me.isReady()){
       group.clicked(mouseX, mouseY);
    }

}

function synthRelease(){
 //   group.release();

}


function setupSynths() {
    group = new Group();
}

class Note {
    constructor(root, pos) {
        this.note = root;
        this.playing = false; 

        this.lowfilter = new Tone.Filter(500, "lowpass");
        this.highfilter = new Tone.Filter(200, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.lowfilter.Q.value = 1; 
        this.highfilter.Q.value = 1; 

        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.attack = 2;
        this.osc.envelope.decay = 0;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 20;

        this.osc.volume.value = -10;
        this.pitch = Tone.Frequency(this.root, "midi");
    }

    getLevel(){
        return this.osc.getLevelAtTime(); 
    }

    isReady(){
        return (this.osc.getLevelAtTime() <0.05);
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
        this.note = p; 
        this.pitch = m;
    }

    play() {
        this.osc.triggerAttack(this.pitch);
    }

    breathe(){
        this.osc.triggerAttackRelease(this.pitch, breatheTime);
    }

    release() {
        this.osc.triggerRelease();
    }

    glow() {
        this.sat = 0;
    }


    display() {

    }
}

class Group {
    constructor(synths) {
        this.me = new Note();
        this.you = new Note();
        this.matched = false;
        this.youNextNote()
        this.youPlay(); 

        this.reverb = new Tone.Reverb().toDestination();
        this.reverb.decay = 20; 
        this.me.lowfilter.connect(this.reverb);
        this.you.lowfilter.connect(this.reverb);
    }

    isMatch(){
        return (this.you.getLevel() >0.1 && this.me.getLevel() > 0.1 && this.me.note == this.you.note) 
    }

    youNextNote(){
        let p = floor(random(pMin, pMax));
        this.you.setNote(p);
    }

    youPlay(){
        this.you.playing = true; 
        this.you.breathe();
    }

    clicked(x, y) {
        let p = floor(map(y, h, 0, pMin, pMax));
        this.me.setNote(p);
        this.me.breathe(); 
        this.me.playing = true; 
    }



    release() {
        this.me.playing = false; 
        this.me.release(); 
    }

    drawPitches(){
        let num = pMax - pMin; 
        let side = h/num; 
        for(let i=0; i<num; i++){
            stroke(0,0,50);
            let c = map(i%12,0,12,100,0);
            let v = this.you.getLevel(); 
            let b = map(v, 0,1,0,100); 
            fill(0,b,c);
            rect(0,i*side,w,side);
        }
        
        if(this.me.playing && !this.me.isReady()){
            let i = this.me.pitch.toMidi() - pMin+1;
            let v = this.me.getLevel(); 
            let b = map(v, 0,1,0,100); 
            let c = 240; 
            if(this.matched) c = 120; 
            fill(c,b,100);
            rect(0,h-i*side,w,side);
        }
    }

}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




