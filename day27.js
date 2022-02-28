/**
 * synthruary day 27
 * Prompt: Sample and hold 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 45;
let group;
let notes = []; 
let warpVal = 0; 


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
        background(180, 100, 50, 100);
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
    background(180, 100, 50, 100);
    playButton();
    frameRate(20);
    noStroke();
}



function draw() {
    if (contextStarted) {
        
        if(mouseIsPressed){
           // let w = map(mouseY,0,h,0,1);
            warpVal+=1;
            group.setWarp(warpVal);
        }
        group.loop(); 


    }
}

function synthOn() {
    //group.clicked(mouseX, mouseY);
}

function synthRelease() {
   // group.release();
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
   
    group = new Group();
}

class Note {
    constructor(note=root) {
        this.root = note;
        this.note = note; 
        this.toplay = [];
        this.lowfilter = new Tone.Filter(500, "lowpass");
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.osc = new Tone.MonoSynth().connect(this.highfilter);
        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.decay = 0;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 2;
        this.osc.volume.value = -5;
        this.osc.filterEnvelope.attack = 2;
        this.osc.filterEnvelope.release = 2;
        this.osc.filter.Q.value = 0;
        this.lowfilter.Q.value = 0;

        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = createVector(w/2,h/2);
        this.r = min(100, min(w, h) / 8);
        this.start = millis(); 
        this.rate = 500; 
        this.len = 1; 
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r/2)
    }

    play() {
        this.osc.triggerAttackRelease(this.pitch, this.len);
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
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
        this.reverb = new Tone.Reverb(1).toDestination(); 
        this.delay = new Tone.FeedbackDelay(1, 0.5).connect(this.reverb);
        this.delay.wet.value = 0.2;
        let inotes = [0,7, 12];
        this.lfo = new Tone.Synth();
        this.lfo.oscillator.type = "sine";
        this.lfo.frequency.value = 0.25;
        this.lfo.triggerAttack(100,0.1);

        
        for(let i = 0; i<3; i++){
            let n = new Note(root + inotes[i]); 
            n.lowfilter.connect(this.delay);
            this.lfo.connect(n.osc.frequency);
            this.synths.push(n); 
        }
        this.intervals = [0,0,3, 5, 7, 7, 7, 9,10, 12, 12]; 
        this.dur = [10, 10, 50];
        this.durIndex = 0; 
        this.rate = 10; 
        this.frame = 0; 

        //update these two params with melting time 
        this.lfo.volume.value = 0; //0 to 30, amt of waviness
        this.frameRate = 1.5; // speed of loop  .25-2
        this.warp = 0; 
    }

    setWarp(w){
        this.warp = w; 
        this.frameRate= map(this.warp, 0,1000, 1, 0.25);
        this.lfo.volume.value = map(this.warp,0,1000,5,25);

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

    randInterval(){
        return  this.intervals[floor(random(this.intervals.length))]
    }

    draw(){
        let y = this.warp*h/1000;

        fill(240,100,50, 0.2);
        rect(0,0,w,y);

        fill(180,100,(1-this.warp/1000)*100, 0.2);
        rect(0,y,w,h-y);


        this.synths.forEach((s,i)=>{
            let y = map(s.note, -1, 13, 0, h); 
            let r = min(w,h)/4;

            fill(60,100,100,0.05);
            for(let j = 0; j<20; j++){
                let d = (this.warp/1000)*(j*5);
                ellipse(w/4+i*w/4, y+d, r, r);
            }
        })
    }

    loop(){
        let d = this.dur[this.durIndex]; 
        this.draw();

        if(this.frame > d){

            this.synths.forEach((s,i)=>{
                let n = this.randInterval(); 
                s.note = n; 
                let p = s.root+ n; 
                s.len = (2*1/this.frameRate);
                s.setNote(p);
                s.play(p);
            
            });

      
            this.durIndex+=1; 
            this.durIndex %= this.dur.length; 
            this.frame=0;
        }
        this.frame += this.frameRate; 

       
    }

}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




