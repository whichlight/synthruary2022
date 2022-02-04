/**
 * synthruary day 4
 * Prompt: pick a mode
 * 
 * <3 whichlight 
 * 
 * 
 */

let synths=[];
let contextStarted;
let w, h;
const root = 70; 
let g_p;
let g_y;

/*************************
 * synth start boilerplate 
 *************************/
function touchStarted(){
    return false;
}

function touchEnded() {
    if (!contextStarted) {
        Tone.start();
        let a = select('#instructions');
        a.remove();
        background(240, 100, 100);
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
    g_p = 0.01; 
    g_y = h-1; 
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    setupSynths();
    background(260, 100, 100, 100);
    playButton();
    frameRate(20);
    noStroke();
}




function draw() {
    if (contextStarted) {

        fill(260, 100, 100, 0.1);
        rect(0,0,w,g_y);           
        fill(260,100,60,0.1);
        rect(0,g_y,w,h-g_y);
        controls(); 

       

        for(s of synths){
            if(random()<g_p){
                s.pluck(0.8);
                s.see(); 
            }
        }

       

    }
}

function controls(){
    if (mouseIsPressed){
        let y = h-mouseY; 
        g_y = mouseY; 
        let p = map(y, 0, h, 20, 2);
        g_p = (1/p)**2; 
    }
  
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
    let intervals = [0, 0, 2, 3, 5, 7, 7, 9, 10, 12, 12];
    for (i of intervals.slice()) { intervals.push(12 + i); }

    notes = intervals.map((i) => root+i);
    notes.map((i)=>synths.push(new Note(i, root))); 
}

class Note {
    constructor(note, root) {
        this.panner = new Tone.Panner(0).toDestination();
        this.filter = new Tone.Filter(200, "lowpass").connect(this.panner);
        this.synth = new Tone.Synth().connect(this.filter);
        this.synth.oscillator.type = "triangle";
        this.synth.envelope.decay = 0.5;
        this.synth.envelope.release = 0.5;
        this.root = root; 
        this.filter.rolloff=-12;

        this.synth.volume.value = 0;
        this.note = note; 
        this.pitch = Tone.Frequency(this.note, "midi"); 
    }


    pluck(len){
        this.synth.triggerAttackRelease(this.pitch, len);
    }

    see(){
        let r = 100; 
        let x = map(this.note-this.root, 0, 24, w-r, r);
        //let x = r+(r*floor(map(random(r,w-r), r, w-r, 0, (w-r)/(0.5*r)))/2);
        let y = r/2+(r*frameCount/2)%(h-(r)); 
        noStroke(); 
        fill(180,100,100)
        ellipse(w-x, h-y, r, r); 
    }
}


