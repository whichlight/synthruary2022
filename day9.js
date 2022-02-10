/**
 * synthruary day 9
 * Prompt: Percussions 
 * 
 * <3 whichlight 
 * 
 * 
 */


let contextStarted = false;
let w, h;
const root = 70;

/*************************
 * synth start boilerplate 
 *************************/
function touchStarted() {
    return false;
}

function touchEnded() {
    noteClicked();
    if (!contextStarted) {
        Tone.start();
        let a = select('#instructions');
        a.remove();
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
    background(0, 100, 100, 100);
    playButton();
    noStroke();
}

function draw() {
    if (contextStarted) {
        background(0, 100, 100, 100);

        group.displayTick();

        for (s of group.synths) {
            s.display(group.tick, group.ticklen);
        }
        group.update();
    }
}

function noteClicked() {
    if(contextStarted){
        group.clicked(mouseX, mouseY);
    }
}



/*************************
 * synthy things 
 *************************/

 let num = 36;
let intervals = Array.from({length: num}, (_, i) => i + 1)

function setupSynths() {
    let synths = [];

    let side = min(200, min(w, h) / 10);

    let index = 0; 
    let xmax = 6; 
    let ymax = 6;
    let s = min(w,h);
    for(let i = 0 ; i<xmax; i++){
        for(let j =0; j<ymax; j++){
            
        let x = map(i, 0, xmax, 2*side, s - side);
        let y = map(j, 0, ymax, 2*side, s - side);
        let pos = createVector(x, y);
        synths.push(new Note(index, pos, side));
        index++; 


        }
    }

    group = new Group(synths);
}

//volume, filtering, and len for successive notes 
// add timing update


class Note {
    constructor(val, pos, side) {
        this.val = val;

        this.osc = new Tone.NoiseSynth()
        this.osc.envelope.attack = 0.001;
        let v = map(val, 1, intervals[intervals.length - 1], 0, -10);
        this.osc.volume.value = -1 * abs(v);

        let d = map(val, 1, intervals[intervals.length - 1], 1, 0.1);
        d = d ** 2;
        this.osc.envelope.decay = d;
        this.osc.envelope.sustain = 0;
        this.osc.envelope.release = 0.4;

        this.filter = new Tone.Filter(200, "bandpass");
        let f = map(val, 1, intervals[intervals.length - 1], 200, 1000);
        this.filter.frequency.value = f;
        this.filter.Q.value = 20;

        this.pos = pos;
        this.r = side;
        this.sat = 100;
        this.active = false;

        // Create a compressor node


        this.compressor = new Tone.Compressor(-50, 12);
        this.compressor.release.value = 0.01;

        this.osc.connect(this.filter);
        this.filter.connect(this.compressor);
        this.compressor.toDestination();
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < (this.r/2))
    }


    pluck(len = 0.5) {

        this.osc.triggerAttack();
    }

    glow() {
        this.sat = 0;
    }

    display(tick, full) {
        noStroke();
        let b = 0;
        let n = floor(full / (this.val+1));
        let p = tick % n;
        let v = p/n; 
        let angle = v*PI*2; 
        if (this.active) { 
            b = 100 
            fill(240, this.sat, b)
            arc(this.pos.x, this.pos.y, this.r, this.r, -1*PI/2, angle-PI/2);
        }
        if(!this.active){
            fill(240, 0, 0)
            ellipse(this.pos.x, this.pos.y, this.r, this.r);
        }
   
        if (this.sat < 100) this.sat += 5;
    }
}

//make a fader knob for tempo 

class Group {
    constructor(synths) {
        this.synths = synths;
        this.tickMax = 256; 
        this.ticklen = this.tickMax;

        this.tick = 0;
    }

    clicked(x, y) {
        let index = this.synths.findIndex((s, i) => s.isClicked(createVector(x, y)));
        if(typeof this.synths[index] !== "undefined"){
            this.switch(index);
        } else{
            this.ticklen = floor(map(mouseX, 0, w, 0, this.tickMax));
            this.tick=0;
        }
    }

    switch(index) {
        let s = this.synths[index];
        this.synths[index].active = !s.active;
    }

    play(index) {
        let s = this.synths[index];
        if (s) {
            s.pluck();
            s.glow();
        }
    }

    update() {
        this.synths.forEach((s, i) => {
            let n = floor(this.ticklen / (i + 1));
            if (this.tick % n == 0 && s.active) {
                this.play(i);
            }
        });

        this.tick++;
        this.tick %= this.ticklen;
    }

    displayTick(){
        let s = (this.ticklen/this.tickMax)*w; 
        fill(60,100,100);
        rect(0,0,s,h);

        let a = (this.tick/this.tickMax)*w; 
        fill(300,100,100);
        rect(0,0,a,h);


    }

}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




