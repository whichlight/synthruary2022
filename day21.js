/**
 * synthruary day 21
 * Prompt: Microtones
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const basef = 25;
let group;
let notes = [];
let numNotes = 22;
let noteMin = 50;
let noteMax = 75;
const root = noteMin;
let xside, yside, notelen;


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
        setupSynths();

        let a = select('#instructions');
        a.remove();
        background(0, 0, 0);
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
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    background(0, 0, 0);

    playButton();
    frameRate(20);
    noStroke();

    notelen = noteMax - noteMin;
    xside = w / notelen;
    yside = h / notelen;
}

function draw() {
    if (contextStarted) {
        background(0, 0, 0);

        drawGrid();
        fillGrid();



        if (mouseIsPressed) {

            group.pressed(mouseX, mouseY);

        }


    }
}

function fillGrid() {

    for (let p = 0; p < notelen; p++) {
        for (let q = 0; q < notelen; q++) {
            let i = (p) % numNotes;
            let j = (q) % numNotes;
            let k = min(i, j);
            i = i - k;
            j = j - k;
            let diad = max(i, j);
            let c = -1;
            let s = 100;
            let b = 100;
            if (diad == 0) c = 300;

            if (diad == 7) c = 120;
            if (diad == 15) c = 160;


            if (diad == 9) c = 60;
            if (diad == 13) c = 30;

            if (diad == 1) {
                c = 1;
                b = 40;
                s = 50;
            }

            if (diad == 4) {
                c = 120;
                s = 50;
                b = 40;
            }
            if (diad == 18) {
                c = 180;
                s = 50;
                b = 40;
            }

            if (c == -1) {
                s = 0;
                b = 0;
            }
            fill(c, s, b);
            rect(p * xside, q * yside, xside, yside);

        }
    }
}


function drawGrid() {
    //draw notes
    //x 
    for (let i = 0; i < notelen; i++) {
        stroke(0, 0, 100);
        line(i * xside, 0, i * xside, h);
    }

    //y
    for (let i = 0; i < notelen; i++) {
        stroke(0, 0, 100);
        line(0, i * yside, w, i * yside);
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
    let intervals = [];
    for (let i = 0; i < numNotes; i++) {
        intervals.push(i);
    }
    for (j = 0; j < 20; j++) {
        val = intervals.map((i) => (i + numNotes * j));
        notes = notes.concat(val);
    }
}

class Note {
    constructor(note = root, interval) {
        this.root = note;
        this.interval = interval;
        this.note = note;
        this.toplay = [];
        this.pitch = Tone.Frequency(this.root, "midi");
        this.filter = new Tone.Filter(800, "lowpass");
        this.filter.Q.value = 0;
        this.osc = new Tone.Synth().connect(this.filter);
        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 2;
        this.osc.volume.value = 50;
        this.pos = createVector(w / 2, h / 2);
        this.r = min(100, min(w, h) / 8);
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
        this.osc.triggerAttack(this.pitch, 0.01);
    }

    setQ(q) {
        this.filter.Q.linearRampToValueAtTime(q, 0.5);
    }

    setVol(v) {
        this.osc.volume.linearRampToValueAtTime(v, 0.5);

    }

    setNote(p) {
        let m = getFrequency((quantize(p)));
        this.note = p;
        this.pitch = m;
        this.osc.frequency.linearRampToValueAtTime(m, 0.5);
    }

    release() {
        this.osc.triggerRelease();
    }

    update() {

    }

    display() {

    }
}

function getFrequency(_n) {
    let a = 2 ** (1 / 12);
    let n = _n;
    let f0 = basef;
    let f = f0 * (2 ** (n / numNotes));
    return f;
}

function quantize(p) {
    p = floor(p);
    let q = null;
    let i = 0;
    while (q == null) {
        q = notes.find(s => s == p + i);
        i++;
    }
    if (q == -1) q = 0;
    return q;
}

class Group {
    constructor(synths) {
        this.synths = [];
        this.synths.push(new Note(root, 0));
        this.synths.push(new Note(root, 0));

        this.comp = new Tone.Compressor().toDestination();
        this.comp.threshold.value = -30;
        this.comp.ratio.value = 15;
        this.comp.release.value = 0.1;
        this.comp.knee.value = 10;
        this.reverb = new Tone.Reverb(0.5).connect(this.comp);

        this.synths.forEach((s) => {
            s.filter.connect(this.reverb);


        });

    }

    pressed(x, y) {
        let p = floor(map(mouseX, 0, w, noteMin, noteMax));
        let q = floor(map(mouseY, 0, h, noteMin, noteMax));
        let volx = map(mouseX, 0, w, 50, 30);
        let voly = map(mouseY, 0, h, 50, 30);

        let u = this.synths[0];
        let v = this.synths[1];

        u.setNote(p);
        v.setNote(q);

        fill(0, 0, 100);
        rect((p - noteMin) * xside, (q - noteMin) * yside, xside, yside);


        fill(0, 0, 100, 0.4)
        rect((p - noteMin) * xside, 0, xside, h);
        rect(0, (q - noteMin)*yside, w, yside);


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




