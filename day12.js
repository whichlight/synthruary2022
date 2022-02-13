/**
 * synthruary day 12
 * Prompt: Atonal 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let gdb = -1;
let group;
let bounds = 50; 

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
        background(240, 100, 50, 100);
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
    background(240, 100, 50, 100);
    playButton();
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {
        group.synths.forEach((s) => { s.updatePosition();});
        display(); 
    }
}

function display(){
    if(!group.playing){
        background(240, 100, 50, 100);
    }
    group.displayNetwork();
    group.synths.forEach((s) => { s.display();});
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

 function startPoints(x, y, radius) {
    let angle = TWO_PI / 7;
 
    let points = []
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        points.push([sx, sy]);
    }
    return points; 
}


function setupSynths() {
    let root = 50;
    let vol = [-5, -5, -5, -7, -7, -5, -7];
    let type = ['sawtooth', 'sawtooth', 'triangle', 'pwm', 'square', 'sine', 'pwm'];
    let p = [root, root-12, root+5, root+7, root+12, root+15, root+24];
    let col = [0, 60, 180, 30, 280, 300, 120];
    let intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let synths = [];
    notes = intervals.map((i) => root + i);

    let points = startPoints(w/2,h/2,0.2*min(w,h));


    vol.forEach((s,i)=>{
        synths.push(new Note(p[i], createVector(points[i][0], points[i][1]), -1*abs(vol[i]*2), col[i], type[i]));
    });
    group = new Group(synths);
}

class Note {
    constructor(root, pos, vol, col, type) {
        this.root = root;
        this.notes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        this.toplay = [];
        this.lowfilter = new Tone.Filter(800, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.synth = new Tone.Synth().connect(this.highfilter);
        this.synth.oscillator.type = type;
        this.synth.envelope.decay = 1;
        this.synth.envelope.sustain = 1;
        this.synth.envelope.release = 2;
        this.synth.volume.value = vol;
        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = pos;
        this.r = min(100, min(w, h) / 8);
        this.sat = 100;
        this.d = 5;
        this.playing = false;
        this.col = col; 
        this.active = false; 
        this.vol = vol; 
        
    }

    shuffleNotes() {
        let arr = this.notes.slice();
        let currentIndex = arr.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [arr[currentIndex], arr[randomIndex]] = [
                arr[randomIndex], arr[currentIndex]];
        }
        this.toplay = arr;
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r/2)
    }

    setNote() {
        if (this.toplay.length == 0) this.shuffleNotes();
        let p = this.toplay.shift();
        this.updateDir(p);
        p += this.root;
        this.pitch = Tone.Frequency(p, "midi");
    }

    play() {
        if(this.active){
        this.playing = true;
        this.setNote();
        this.synth.triggerAttack(this.pitch, 0.01);
        }
    }

    updateDir(p) {
        this.angle = p * 2 * PI / this.notes.length;

    }

    release() {
        this.synth.triggerRelease();
        this.playing = false;
    }

    glow() {
        this.sat = 0;
    }

    updatePosition(){
        if (this.playing) {

        let x = this.d * cos(this.angle);
        let y = this.d * sin(this.angle);
        this.pos.x += x;
        this.pos.y += y;
        this.pos.x += x;
        this.pos.y += y;

        //bounds
        if(this.pos.x - bounds < 0 ) this.pos.x = w - bounds; 
        if(this.pos.x + bounds > w ) this.pos.x = bounds; 
        if(this.pos.y - bounds < 0 ) this.pos.y = h - bounds; 
        if(this.pos.y + bounds > h ) this.pos.y = bounds; 
    }
    }

    display() {
        

        noStroke();
        this.sat = this.active ? 100 : 0
        fill(this.col, this.sat, 100)
        ellipse(this.pos.x, this.pos.y, this.r, this.r);

        this.toplay.forEach((n)=>{
            let r = map(n,0,11,1, this.r);
            noFill();
            strokeWeight(1);
            stroke(0,0,0);
            ellipse(this.pos.x, this.pos.y, r,r);
        });
    }
}

class Group {
    constructor(synths) {
        this.synths = synths;
        this.playing = false; 

    }

    setVolume(){
        let num = 0; 
        this.synths.forEach((s) => { 
            if(s.active){
                num++; 
            } 
        });

        this.synths.forEach((s) => { 
            s.synth.volume.value = s.vol-1*num;
        });
    }


    clicked(x, y) {
       
        let s = this.synths.find((s, i) => s.isClicked(createVector(mouseX,mouseY)));
        if (typeof s !== 'undefined'){
            s.active=!s.active; 
        }

        this.setVolume();
        this.play();

    }

    play() {
        this.synths.forEach((s) => { s.play(); });
        this.playing = true;
    }

    release() {
        this.synths.forEach((s) => { s.release(); });
        this.playing = false; 
    }

    displayNetwork(){
    
        this.synths.forEach((s) => { 
            if(s.active){
                this.synths.forEach((n) => { 
                    if(n.active){
                        strokeWeight(2);
                        stroke(0,0,100);
                        line(s.pos.x, s.pos.y, n.pos.x, n.pos.y);
                    }
                })
            }
        })
      
    }

}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




