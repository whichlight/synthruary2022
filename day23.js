/**
 * synthruary day 19
 * Prompt: Birdsong
 * 
 * <3 whichlight 
 * 
 */




let contextStarted;
let w, h;
const root = 200;
let group;
let side;


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
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(300, 100, 100);

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
    background(280, 100, 100);
    playButton();
    frameRate(30);
    noStroke();
    rectMode(CENTER);
    side = min(100, min(w, h) / 8);
}

function draw() {
    if (contextStarted) {
        group.loop();
    }
}

function synthOn() {
    group.selected = group.fms.findIndex((s) => s.isClicked(createVector(mouseX, mouseY)));
    if (group.selected > -1) {

    let s = group.fms[group.selected];
    s.clickTime = millis(); 
    }
}

function synthRelease() {

    if (group.selected > -1) {
        let s = group.fms[group.selected];
        if (millis() - s.clickTime < 200 && s.isClicked(createVector(mouseX, mouseY))) {
            s.toggle(); 
        }
    }
    else{
        group.synth.toggle();
    }

}

/*************************
 * synthy things 
 *************************/

function setupSynths() {
    group = new Group();
}

class Note {
    constructor(_root, type) {
        this.root = _root;
        this.note = this.root;
        this.comp = new Tone.Compressor();
        this.comp.threshold.value = -20;
        this.comp.ratio.value = 15;
        this.comp.release.value = 0.1;
        this.comp.knee.value = 10;
        this.effect = new Tone.Reverb(0.5).connect(this.comp);
        this.lowfilter = new Tone.Filter(2000, "lowpass").connect(this.comp);
        this.highfilter = new Tone.Filter(0, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = type;
        this.osc.envelope.attack = 0.1;
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 0.1;
        this.vol = 100;
        this.osc.volume.value = this.vol;
        this.pitch = Tone.Frequency(this.root);
        this.playing = true; 
    }

    toggle() {
        this.playing = !this.playing;
        this.playing ? this.play() : this.release(); 
    }

    play() {
        this.osc.triggerAttack(this.pitch,0.1);
    }
    release() {
        this.osc.triggerRelease();
    }
}


class FMNote {
    constructor(pos, vol) {
        this.osc = new Tone.Synth();
        this.osc.oscillator.type = "sine";
        this.pos = pos;
        this.r = side;
        this.osc.frequency.value = 0;
        this.playing = false;
        this.vol = vol;
        this.osc.volume.value = this.vol;
        this.clickTime = millis();
        this.analyser = new Tone.Analyser('waveform');
        this.osc.connect(this.analyser);
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
        this.osc.triggerAttack(this.osc.frequency.value, 0.5);
    }


    release() {
        this.osc.triggerRelease();
    }

    toggle() {
        this.playing = !this.playing;
        this.playing ? this.play() : this.release(); 
        this.clickTime = millis();
    }


    update() {

        let y = map(this.pos.y, h, 0, 0.1, 3) ** 2;
        this.osc.frequency.linearRampToValueAtTime(y, 0.5);

        let x = map(this.pos.x, 0, w, -20, 100) ;
        this.osc.volume.value = x;
        if(this.playing) console.log(x,y);
        
    }



    display() {
        if (this.playing) {
            let c = 180;
            let arr = this.analyser.getValue();
            let y = arr[0];
            let b = map(y, -1, 1, 100, 0);
            fill(c, b, 100)
        } else {
            fill(0, 0, 50);
        }

        ellipse(this.pos.x, this.pos.y, this.r, this.r);

        let t = this.osc.oscillator.type; 
        if(t == "pulse"){
            noFill();
            strokeWeight(5);
            stroke(0,0,0);
            rect(this.pos.x, this.pos.y, this.r/2, this.r/2);
        }

        if(t == "sine"){
            noFill();
            strokeWeight(5);
            stroke(0,0,0);
            ellipse(this.pos.x, this.pos.y, this.r/2, this.r/2);
        }


        if(t == "sawtooth"){
            noFill();
            strokeWeight(5);
            stroke(0,0,0);
            push();
            translate(this.pos.x, this.pos.y); 
            rotate(-1*PI/2);
            polygon(0,0, this.r/3, 3);
            pop();
        }

    }

}

class Group {
    constructor() {
        this.synth = new Note(root, "triangle");
        this.fms = [];
        this.selected = -1;

        let num = 5;
        let fmamp = 0;
        this.synth.play(); 

        let types = ["sawtooth", "pulse", "sine"]; 
        let typeIndex = 0; 

        for (let i = 0; i < num; i++) {
            for(let j = 0; j < 3; j++){
                let fm = new FMNote(createVector( (w - ((3-1)* (side)))/2 + j*side, (h - ((num - 1) * (side))) / 2 + i * side), fmamp);
                fm.osc.connect(this.synth.osc.frequency);
                fm.osc.volume.value = fmamp;
                fm.osc.oscillator.type = types[j];
                this.fms.push(fm);
            }
           
        }

        /*
        this.fms[0].osc.oscillator.type = "sawtooth";
        this.fms[1].osc.oscillator.type = "sawtooth";
        this.fms[2].osc.oscillator.type = "pulse";
        this.fms[3].osc.oscillator.type = "pulse";
        */

        this.synth.comp.toDestination();
    }

    clicked(x, y) {

    }

    play() {
        this.synth.play();


    }

    release() {
        this.synth.release();

    }

    loop() {

        let bg; 
        this.synth.playing ? bg = 100 : bg = 50; 
        fill(280, 100,bg);
        rect(w/2, h/2, w, h);

        this.fms.forEach((fm) => {
            fm.update()
            if(!fm.playing){
                fm.display()
            }
        });


        this.fms.forEach((fm) => {
            if(fm.playing){
                fm.display()
            }
        });

        if (mouseIsPressed && this.selected > -1) {
            let s = this.fms[this.selected];
            s.pos.y = mouseY;
            s.pos.x = mouseX;
            s.update();
            s.display();
        }

       
        

      

    }
}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




