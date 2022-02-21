/**
 * synthruary day 20
 * Prompt: Noise
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let group;
let notes = []; 
let particles = [];


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
        background(180, 100, 100, 100);
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(280, 20, 100);
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
    colorMode(HSB, 360, 100, 100, 100);
    createCanvas(w, h);
    setupSynths();
    background(180, 100, 100);

    playButton();
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {

        if(mouseIsPressed){

            group.pressed(mouseX,mouseY);

                let pos = createVector(mouseX,mouseY); 
                let r = map(mouseY, 0,h,5,200);
                particles.push(new Particle(pos,r));
            
    
        }

        particles.forEach((p)=>{
            p.update();
            p.draw();


            //remove element 
            if(p.alpha<=0){
                const index = particles.indexOf(p);
                if (index > -1) {
                    particles.splice(index, 1); 
                    console.log(particles.length);
                  }
            }
        });

    }
}

class Particle{
    constructor(pos, r){
        this.pos = pos; 
        this.r = r; 
        this.c = 180; 
        this.colormove = 1; 
        this.alpha = 100; 
        
    }

    update(){
        this.r++;
        this.pos.y++; 
        if(this.c>300) this.colormove =-1; 
        if(this.c<180) this.colormove =1; 

        if(this.pos.y>h && this.alpha>0){
            this.alpha--; 
        }

        this.c+=this.colormove; 
        this.c%=360;
    }

    draw(){
        fill(this.c, 80,100, this.alpha);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }

}


/*************************
 * synthy things 
 *************************/

 function synthOn() {
    group.pressed(mouseX, mouseY);
}

function synthRelease() {
    group.release();
}

function setupSynths() {
   
    group = new Group();
    notes = [];
    let intervals = [0,3, 5, 7, 9,10];
    for (j = 0; j < 20; j++) {
        val = intervals.map((i) => (i + 12 * j));
        notes = notes.concat(val);
    }
}

class Note {
    constructor(note=root, interval) {
        this.root = note;
        this.interval = interval;
        this.note = note; 
        this.toplay = [];
        this.pitch = Tone.Frequency(this.root, "midi");
        this.filter = new Tone.Filter(this.pitch, "bandpass");
        this.osc = new Tone.NoiseSynth().connect(this.filter);
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 2;
        this.osc.volume.value = 50;
        this.pos =createVector(w/2,h/2);
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

    setQ(q){
        this.filter.Q.linearRampToValueAtTime(q,0.5);
    }

    setVol(v){
        this.osc.volume.linearRampToValueAtTime(v,0.5);

    }

    setNote(p) {
        let m = Tone.Frequency(quantize(p + this.interval), "midi");
        this.note = p; 
        this.pitch = m;
        this.filter.frequency.linearRampToValueAtTime(m,0.5); 
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

function quantize(p) {
    p = floor(p);
    let q = null;
    let i = 0;
    while (q == null) {
        q = notes.find(s => s == p + i);
        i++;
    }
    if (q==-1) q = 0; 
    return q;
}

class Group {
    constructor(synths) {
        this.synths = [];
        this.synths.push(new Note(root,0)); 
        this.synths.push(new Note(root,5)); 
        this.synths.push(new Note(root,7)); 
        this.synths.push(new Note(root,9)); 

        this.comp = new Tone.Compressor().toDestination();
        this.comp.threshold.value = -30; 
        this.comp.ratio.value = 15; 
        this.comp.release.value = 0.1; 
        this.comp.knee.value = 10; 

        this.delay = new Tone.FeedbackDelay(1, 0.5).connect(this.comp);
        this.delay.wet.value = 0.2;
        this.reverb = new Tone.Reverb(0.5).connect(this.delay);



        this.synths.forEach((s) => { 
            s.filter.connect(this.reverb);
        
        
        });





    }

    pressed(x, y) {
        let p = map(mouseX, 0,w,50,100);
        let q = map(mouseY, 0,h,80,1);
        let volx = map(mouseX, 0,w,50,30);
        let voly = map(mouseY,0,h,20,-10);

        this.synths.forEach((s) => {
            s.setNote(p); 
            s.setQ(q);
            s.setVol(volx+voly-1*s.interval);
        
        });
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




