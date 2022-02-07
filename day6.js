/**
 * synthruary day 6
 * Prompt: Drones 
 * 
 * <3 whichlight 
 * 
 * 
 */


let synths = [];
let contextStarted;
let w, h;
const root = 70;



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
        contextStarted = true;
    }

    if(contextStarted){
        synthReleased(); 
    }

    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(180, 0, 100,0.5);
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
    background(0);
    playButton();
    frameRate(20);
    noStroke();
    rectMode(CENTER);
}

function draw() {
    if (contextStarted) {
        background(0);
        group.display(); 
    }
}

function mouseDragged(){
    synthPressed(); 
}

function synthPressed(){
    group.pressed(mouseX, mouseY);
}

function synthReleased(){
    group.released(); 
}


/*************************
 * synthy things 
 *************************/

class Note {
    constructor(freq, vol) {
        this.lowfilter = new Tone.Filter(800, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(40, "highpass").connect(this.lowfilter);
        this.synth = new Tone.Synth().connect(this.highfilter);
        this.synth.oscillator.type = "sawtooth";
        this.synth.envelope.attack = 0.001;
        this.synth.envelope.decay = 1;
        this.synth.envelope.sustain = 1;
        this.synth.envelope.release = 0.7;
        this.synth.volume.value = vol;
        this.pitch = Tone.Frequency(freq);
        this.offset=0; 
      //  this.pos = pos;
    }

    isClicked(m){
        return (p5.Vector.dist(m, this.pos) < this.r)
    }

    play(){
        this.synth.triggerAttack(this.pitch); 
    }

    pause(){
        this.synth.triggerRelease();
    }

    setNote(freq, offset=0){
        this.pitch = Tone.Frequency(freq + offset); 
        this.offset = offset; 
        this.synth.setNote(this.pitch);
    }

    display() {
     
    }
}

class Group{
    constructor(num=10){
        this.root = 100; 
        this.num = num;
        this.synths = []; 
        this.pos = createVector(w/2,h/2);
        this.playing = false; 
        this.frange = [50,200];
        this.orange = [0,50];
        
        for(let i = 0; i<this.num; i++){
            this.synths.push(new Note(this.root, -1*num));
        }

    }

    pressed(x,y){
        this.pos.x = x;
        this.pos.y = y; 
        let f = map(this.pos.y, height, 0, this.frange[0], this.frange[1]);
        this.root = f; 
        let xw = abs(w/2 - this.pos.x);
        let offset = map(xw, 0, w/2, this.orange[0], this.orange[1]);
        this.synths.forEach((s,i)=>{
            
            s.setNote(f,i*offset);
        });
        
        this.play();
    }

    released(){
        this.synths.forEach(s=>s.pause())
        this.playing = false; 
    }

    play(){
        if(!this.playing){
            this.synths.forEach(s=>s.play())
            this.playing = true; 
        }
    }

    setNote(f){
        this.synths.forEach(s=>s.setNote(f))
    }

    display(){

        if(this.playing){
            this.synths.forEach((s,j)=>{
                //s.offset
                for(let i=0; i<h; i+=10){
                    push();
                    translate(w/2,i);
                    translate((w/2)*sin(frameCount + i*this.root)+s.offset*j,0);
                    fill(0,0,100);
                    rect(0,0,10,10);
                    pop();
                }
            });  
        }
        else{
            for(let i=0; i<h; i+=10){
                push();
                translate(w/2,i);
                fill(0,0,100);
                rect(0,0,10,10);
                pop();
            }

        }
       
    }

}

function sum(arr){
    return arr.reduce((a,b)=>a+b);
}

function setupSynths() {    
    group = new Group(5); 
}




