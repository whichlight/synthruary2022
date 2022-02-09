/**
 * synthruary day 9
 * Prompt: Percussions 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted= true;
let w, h;
const root = 70;

/*************************
 * synth start boilerplate 
 *************************/
function touchStarted() {
    return false;
}

function touchEnded() {
    if (!contextStarted) {
        Tone.start();
        let a = select('#instructions');
        a.remove();
        background(280, 100, 50, 100);
        contextStarted = true;
    }
    noteClicked(); 
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
    background(280, 100, 50, 100);
    playButton();
    noStroke();
}

function draw() {
    if (contextStarted) {

        for(s of group.synths){
            s.display(); 
        }
        group.update(); 
    }
}

function noteClicked(){
    group.clicked(mouseX, mouseY);
    
}

/*************************
 * synthy things 
 *************************/


function setupSynths() {
    let intervals = [1,2,3,4,5,6,7,8,9];
    let side = 20; 
    let synths = []; 

    intervals.forEach((n,i)=>{
        let x = map(i,0, intervals.length, 2*side, w-2*side);
        let pos = createVector(x, h/2);
        synths.push(new Note(n, pos));
    })
    group = new Group(synths); 
}

//volume, filtering, and len for successive notes 
// add timing update

class Note {
    constructor(note, pos) {
        this.note = note; 
        this.f = Tone.Frequency(50+100*note); 
        this.filter = new Tone.Filter(this.f, "bandpass").toDestination(); 
        this.osc = new Tone.NoiseSynth().connect(this.filter);
        this.filter.Q.value=10;
        this.osc.envelope.attack = 0.001;
        this.osc.envelope.decay = 0.1;
        this.osc.envelope.sustain = 0;
        this.osc.envelope.release = 0.4;
        this.pos = pos;
        this.r = min(100, min(w,h)/8);
        this.sat = 100; 
        this.active = false; 
    }

    isClicked(m){
        return (p5.Vector.dist(m, this.pos) < this.r)
    }


    pluck(len = 0.5) {
        this.osc.volume.value = -1*(this.note); 
        this.osc.triggerAttack();
    }

    glow(){
        this.sat = 0; 
    }

    display() {
        noStroke();
        let b = 0; 
        if(this.active){b = 100};
        fill(300, this.sat, b)
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
        if(this.sat<100) this.sat+=10; 
    }
}

class Group{
    constructor(synths){
        this.synths = synths; 
        this.ticklen = 100;
        this.tick = 0;
    }

    clicked(x, y){
        let index = this.synths.findIndex((s, i) => s.isClicked(createVector(x,y)));
        this.switch(index);
    }

    switch(index){
        let s = this.synths[index];
        this.synths[index].active = !s.active; 
    }

    play(index){
        let s = this.synths[index]; 
        if(s) {
            s.pluck(); 
            s.glow();             
        }   
    }

    update(){
        this.synths.forEach((s,i)=>{
            let n = floor(this.ticklen/(i+1));
            if(this.tick % n == 0 && s.active){
                this.play(i);
            }
        });

        this.tick++; 
        if(this.tick>=this.ticklen){
            console.log('looping');
        }
        this.tick%=this.ticklen; 
    }

}


function sum(arr){
    return arr.reduce((a,b)=>a+b);
}




