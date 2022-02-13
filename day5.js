/**
 * synthruary day 5
 * Prompt: Aleatoric 
 * 
 * <3 whichlight 
 * 
 * 
 */

let synths = [];
let contextStarted;
let w, h;
const root = 70;
const glen = 0.5; 
let gdb = 0; 


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
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {
        group.displayEdges(); 

        for(s of synths){
            s.display(); 
        }
    }
}

function noteClicked(){
    group.clicked(mouseX, mouseY);
    
}

/*************************
 * synthy things 
 *************************/

 function hexPoints(x, y, radius) {
    let angle = TWO_PI / 6;
 
    let points = []
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        points.push([sx, sy]);
    }
    return points; 
}

function setupSynths() {
    let root = 55;
    let intervals = [0, 3, 5, 7, 10, 12];
    notes = intervals.map((i)=>root+i);
    let num = 3;     

    let hpoints = hexPoints(w/2,h/2,0.4*min(w,h));

    notes.forEach((n,i)=>{
        let pos = createVector(hpoints[i][0], hpoints[i][1]);
        synths.push(new Note(n, pos));
    })

    group = new Group(synths); 
    


}

class Note {
    constructor(note, pos) {
       // this.comp = new Tone.Compressor(-5, 3).toDestination();
        this.lowfilter = new Tone.Filter(200, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(40, "highpass").connect(this.lowfilter);
        this.synth = new Tone.Synth().connect(this.highfilter);
        this.synth.oscillator.type = "sawtooth";
        this.synth.envelope.decay = 0.5;
        this.synth.envelope.release = 0.5;
        this.synth.volume.value = -1;
        this.note = note;
        this.pitch = Tone.Frequency(this.note, "midi");
        this.pos = pos;
        this.r = min(100, min(w,h)/8);
        this.sat = 100; 
    }

    isClicked(m){
        return (p5.Vector.dist(m, this.pos) < this.r)
    }


    pluck(len = 0.5) {
        this.synth.volume.value = gdb; 
        this.synth.triggerAttackRelease(this.pitch, len);
    }

    glow(){
        this.sat = 0; 
    }

    display() {
        noStroke();
        fill(300, this.sat, 100)
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
        if(this.sat<100) this.sat+=10; 
    }
}

class Group{
    constructor(notes){
        this.notes = notes; 
        this.probs = this.setProbabilities(); 
        this.activeNoteIndex; 


    }

    displayEdges(){
        this.probs.forEach((n,i)=>{
            n.forEach((m,j)=>{
                let p = this.probs[i][j];
                let w = map(p, 0,1, 1,50);
                strokeWeight(w); 
                i<j 
                    ? stroke(0,0,0, 0.1) 
                    : stroke(0,0,100, 0.1);
                line(this.notes[i].pos.x, this.notes[i].pos.y, this.notes[j].pos.x, this.notes[j].pos.y);
            })
        })

    }

    setProbabilities(){
        return this.notes.map((n)=>{
            return this.notes.map((m)=>{
                if(m==n) return 0;
                return(floor(random(10)));
            });
        }).map((n)=>{ 
            let s = sum(n);
            return n.map((m)=>{
                return m/s;
            })
        })
        
    }

    nextNoteIndex(noteIndex){
        let rand = random(); 
        let p = this.probs[noteIndex];
        return p.findIndex((n, i, list)=> rand<sum(list.slice(0,i+1)));
    }

    clicked(x, y){
        this.activeNoteIndex = this.notes.findIndex((s, i) => s.isClicked(createVector(x,y)));
        this.play();
    }

    play(){
        let s = this.notes[this.activeNoteIndex]; 
        if(s) {
            s.pluck(); 
            s.glow(); 
            this.playNextNote();
            
        }   
    }

    playNextNote(){
        setTimeout(()=>{
            let ni = this.nextNoteIndex(this.activeNoteIndex);
            this.activeNoteIndex = ni; 
            this.play(); 
        }, glen*1000); 
    }



}


function sum(arr){
    return arr.reduce((a,b)=>a+b);
}




