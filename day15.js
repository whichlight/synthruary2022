/**
 * synthruary day 15
 * Prompt: Sample and hold 
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 60;
let group;
let notes;
let synthstarted = false; 
let lfo = 0.1; 

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
        background(120, 100, 100);
        setupSynths();
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(120, 100, 50);
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
    background(120, 100, 100);
    playButton();
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {
        background(120, 100, 100);
        group.loop();
    }
}

function synthOn() {
   

    group.play();

    group.selected = group.synths.findIndex((s) => s.isClicked(createVector(mouseX, mouseY)));
}

function synthRelease() {
   // group.release();

    group.synths.forEach((s) => {
        if (millis() - s.clickTime < 200 && s.isClicked(createVector(mouseX, mouseY))) {
            s.toggle();
        }
    })
}

/*************************
 * synthy things 
 *************************/

function setupSynths() {

    group = new Group();
    notes = [];
    let intervals = [0, 3, 5, 7, 10];
    for (j = 0; j < 30; j++) {
        val = intervals.map((i) => (i + 12 * j));
        notes = notes.concat(val);
    }


}

function quantize(p) {
    let q = null;
    let i = 0;
    while (q == null) {
        q = notes.find(s => s == p + i);
        i++;
    }
    if (q==-1) q = 0; 
    return q;
}

class Note {
    constructor(root, pos = createVector(w / 2, h / 2), range=30, type = "pwm") {
        this.root = root;
        this.note = root;
        this.lowfilter = new Tone.Filter(800, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = type;
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 2;
        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = pos;
        this.r = min(100, min(w, h) / 8);
        this.start = millis();
        this.rate = 500;
        this.range = 10;
        this.rangeMax = range;
        this.b = 0;
        this.vol = -20;
        this.osc.volume.value = this.vol;
        this.clickTime = millis();
        this.playing = true;
    }


    toggle() {
        this.playing = !this.playing;
        let v = -100;
        if (this.osc.volume.value == -100) v = this.vol;
        this.osc.volume.value = v;
        this.clickTime = millis();

    }

    getLevel() {
        return this.osc.getLevelAtTime();
    }

    active() {
        return (this.getLevel() > 0.05);
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
        this.clickTime = millis();
        this.start = millis();
        this.osc.triggerAttack(this.pitch, 0.01);
        this.b = 100;
    }
    

    setMidiNote(m) {
        let p = Tone.Frequency(m, "midi");
        this.note = m;
        this.pitch = p;
        this.osc.frequency.value = this.pitch.toFrequency();
    }

    release() {
        this.osc.triggerRelease();
    }

    triggerSH(rate) {
        return ((millis() - this.start > rate) && this.active())
    }



    getNoteSH() {
     //   let val = this.root + this.range*sin(frameCount*lfo);
      //   val = this.root + this.range*((random()-2)/2);
       // let p = floor(val);

        let p = floor(random(this.root - this.range, this.root + this.range));
        return p;

    }

    loop() {
        if (this.triggerSH(this.rate)) {
            this.b = 100;
            let p = this.getNoteSH();
            this.setMidiNote(quantize(p));
            this.start = millis();
        }

        //update params 
        if (this.active()) {
            let x = this.pos.x;
            let y = this.pos.y;
            this.rate = map(y, 0, h, 5, 1000);
            this.range = map(x, 0, w, 0, this.rangeMax);

        }

        if (this.b > 0 && this.playing) this.b -= 10;

    }

    highlight() {
        fill(60, 100, this.b);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }

    display() {
        let s = 100;
        if (!this.playing) {
            this.b = 50;
            s = 0;
        }
        fill(300, s, this.b);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }
}


function startPoints(x, y, radius) {
    let r  = min(100, min(w, h) / 8);
    let points = []; 

    for(let i = 0; i<6; i++){
        points.push([(i+1)*r, h - (i+1)*r])

    }
    return points; 
}

class Group {
    constructor(synths) {
        this.synths = [];
    

        let p = startPoints(w/2,h/2,0.2*min(w,h));

        this.synths.push(new Note(root, createVector(p[2][0],p[2][1])));
        this.synths.push(new Note(root, createVector(p[0][0], p[0][1])));
        this.synths.push(new Note(root, createVector(p[1][0], p[1][1])));

        let one = new Note(root, createVector(p[3][0],p[3][1])); 
        one.toggle();
        this.synths.push(one);


        let two = new Note(root, createVector(p[4][0],p[4][1])); 
        two.toggle();
        this.synths.push(two);

        let three = new Note(root, createVector(p[5][0],p[5][1])); 
        three.toggle();
        this.synths.push(three);

    }

    play() {
        this.synths.forEach((s) => { s.play(); });
    }

    release() {
        this.synths.forEach((s) => { s.release(); });
    }

    loop() {

        //drag
        if (mouseIsPressed && group.selected > -1) {
            let s = group.synths[group.selected];
            s.highlight();
            s.pos.x = mouseX;
            s.pos.y = mouseY;
        }

        if (mouseIsPressed && group.selected == -1) {
            let val = map(mouseY,0,h, 1.5, 0.001);
            lfo = val; 
        }

        /*
        let y = map(lfo, 0.001, 1.5, h, 0);
        fill(200,100,100);
        rect(0,y,w,h);
        */


        this.synths.forEach((s) => {
            s.loop();
            s.display();

        });
    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}
