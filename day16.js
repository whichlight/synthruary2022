/**
 * synthruary day 16
 * Prompt: Physics
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 70;
let group;
let notes;

const numParticles = 150;
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
    background(0, 0, 0);
    playButton();
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {
     

        background(0, 0, 0);

        particles.forEach(function (p) {
            p.update();
            p.render();
        })

        particles.forEach(function (p) {
            checkOverlap(p);
            
        });

    }
}

function synthOn() {
    group.clicked(mouseX, mouseY);
}

function synthRelease() {
    createSingleParticle(createVector(mouseX,mouseY)); 

  //  group.release();
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
   

    notes = [];
    let intervals = [0, 2, 4, 6, 7, 9, 11];
    for (j = 4; j < 8; j++) {
        val = intervals.map((i) => (i + 12 * j));
        notes = notes.concat(val);
    }

    group = new Group();
}

class Note {
    constructor(note=root, pos=createVector(w/2,h/2)) {
        this.root = note;
        this.note = note; 
        this.toplay = [];
        this.lowfilter = new Tone.Filter(300, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 0;
        this.osc.envelope.release = 1;
        this.osc.volume.value = -10;
        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = pos;
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


    pluck(p) {
        this.setNote(p)
        this.osc.triggerAttackRelease(this.pitch, 0.5);
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
        this.note = p; 
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

        for(let i = 0; i<20; i++){
            this.synths.push(new Note()); 
        }
        this.index = 0; 
        this.notes = notes; 
    }

    clicked(x, y) {
       // this.play();
    }

    play(p) {
        this.index+=1; 
        this.index%=this.synths.length; 
        let s = this.synths[this.index];
        s.pluck(p); 
    }

    release() {
        this.synths.forEach((s) => { s.release(); });
    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}



function createParticles() {
    for (let i = 0; i < numParticles; i++) {
       let pos = createVector(random(w / 2 - rectSize / 2, w / 2 + rectSize / 2), random(h / 2 - rectSize / 2, h / 2 + rectSize / 2));
       let center = createVector(w / 2, h / 2);
       let diff = p5.Vector.sub(pos, center);
       let vel = diff.copy();
       vel.mult(0.05);
        createSingleParticle(pos, vel);
    }
}

function createSingleParticle(_pos=createVector(w/2,h/2), _vel=createVector(random(-5,5),random(-5,5))){
    let pos = _pos;
    let vel = _vel;
    let acc = createVector(0,0);
    let size = random(10, 50);
    let c = random(80, 130);
    particles.push(new Particle(pos, vel, acc, size, c));
}

class Particle {
    constructor(_pos, _vel, _acc, _size, _c) {
        this.pos = _pos;
        this.vel = _vel;
        this.d = _size;
        this.acc = _acc;
        this.c = _c;
        this.collision = createVector(0,0);
    }

    play(){
        let f = floor(map(this.d, 10,50,notes.length-1,0));
        console.log(notes[f]);
        group.play(notes[f])
    }

    update() {
        this.acc.add(this.collision);
        this.vel.add(this.acc);
        this.acc = createVector(0, 0);
        this.collision = createVector(0,0);
        this.vel.limit(10);
        this.pos.add(this.vel); 
        
    }

    

    render() {
        fill(this.c, 100, 100);
        noStroke();
        circle(this.pos.x, this.pos.y, this.d);
    }
}

function checkOverlap(p) {
    let overlap = false;
    particles.forEach(function (q) {
        if (p != q) {
            let cd = p5.Vector.dist(p.pos, q.pos);
            let rd = (p.d + q.d) / 2;
            if (cd < rd) {
                //collision 

                p.play();
                p.vel.x = -1*p.vel.x; 
                p.vel.y = -1*p.vel.y; 
        
                let force = p5.Vector.sub(q.pos, p.pos);
                let d = force.mag();
                d = constrain(d, 1, 50);
                let G = 100;
                let strength = G / (d * d);
                force.setMag(strength);
                force.mult(-5);
                let col = p5.Vector.sub(q.vel, p.vel);
                p.collision.add(force);
                
            }
        }
    })

    //borders
    if ((p.pos.x + p.d / 2) > w || (p.pos.x - p.d / 2) < 0 ) {
        p.vel.mult(createVector(-2,2));
    } 
    if((p.pos.y - p.d / 2) < 0 || (p.pos.y + p.d / 2) > h){
        p.vel.mult(createVector(2,-2));
    }

}





