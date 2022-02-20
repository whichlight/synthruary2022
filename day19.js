/**
 * synthruary day 19
 * Prompt: Rhythms
 * 
 * <3 whichlight 
 * 
 * ref: https://www.sitepoint.com/using-fourier-transforms-web-audio-api/
 */




let contextStarted;
let w, h;
const root = 50;
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
    background(240, 100, 100);
    playButton();
    frameRate(30);
    noStroke();
    side = min(100, min(w, h) / 8);
}

function draw() {
    if (contextStarted) {
        background(240, 100, 100);
        group.loop();
    }
}

function synthOn() {
    group.selected = group.fms.findIndex((s) => s.isClicked(createVector(mouseX, mouseY)));
}

function synthRelease() {

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
        this.lowfilter = new Tone.Filter(2000, "lowpass").connect(this.effect);
        this.highfilter = new Tone.Filter(0, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = type;
        this.osc.envelope.attack = 0.01;
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 0;
        this.vol = 100; 
        this.osc.volume.value = this.vol;
        this.pitch = Tone.Frequency(this.root);

    }

    play() {
        this.osc.triggerAttack(this.pitch, 0.5);
    }
    release() {
        this.osc.triggerRelease();
    }
}


class FMNote {
    constructor(pos, vol) {
        this.osc = new Tone.ToneOscillatorNode();
        this.gain = new Tone.Gain(); 
        this.pos = pos;
        this.r = side;
        this.osc.frequency.value = 0;
        this.playing = false;
        this.vol = vol;
        this.gain.gain.value = this.vol; 
        this.clickTime = millis();
        this.analyser = new Tone.Analyser('waveform');
        this.osc.connect(this.gain);
        this.gain.connect(this.analyser); 
        this.setWave();
        this.osc.start(); 

    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
      //  this.osc.triggerAttack(this.pitch, 0.5);
      this.gain.gain.linearRampToValueAtTime(this.vol, 0.5);
    }


    release() {
        this.gain.gain.linearRampToValueAtTime(0, 0.5);


       // this.osc.triggerRelease();
    }

    reverseSawtooth(x) {
        if (x < 0) return 0;
        x = x * 1 % 1 + 0.01;
        if (x < 1) {
            return  1 + ((Math.log((1-x)**3)) / 20); }
        return Math.pow(-x, -2);
    }

    setWave() {
        let count = 128;
        let waveVals = new Array(count);
        for (let i = 0; i < count; i++) {
            waveVals[i] = this.reverseSawtooth(i / count);
        }

        let ft = new DFT(waveVals.length);
         ft.forward(waveVals);
        let lfotable = Tone.context.createPeriodicWave(ft.real, ft.imag);
        this.osc.setPeriodicWave(lfotable);

    }

    update() {


        if (this.pos.y > h - side) {
            this.gain.gain.linearRampToValueAtTime(0, 0.5);
            this.playing = false;
        } else {
            this.gain.gain.linearRampToValueAtTime(this.vol, 0.5);

            this.playing = true;
            let y = map(this.pos.y, h, 0, 0.1, 2) ** 2;
            this.osc.frequency.linearRampToValueAtTime(y, 0.5);

        }

        /** 
         * this may be good for birdsong 
        let x = map(this.pos.x, 0, w, 5, 100) ;
        this.osc.volume.value = x;
        **/
    }

    highlight() {
        fill(0, 0, 100);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);

    }

    display() {
        if (this.playing) {
            //  let cycle = sin(frameCount*this.osc.frequency.value/5);
            //  let b = 100*(1+cycle);
            let c = 300;
            let arr = this.analyser.getValue();
            let y = arr[0];
            let b = map(y, -10, 10, 100, 0);

            fill(c, b, 100)
        } else {
            fill(0, 0, 50);
        }

        line(this.pos.x, h-(side*1.5), this.pos.x, this.pos.y);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);

    }

}

class Group {
    constructor() {
        this.synth = new Note(root, "triangle");
        this.fms = [];
        this.selected = -1;


        let num = 5;
        let fmamp = 100;

        for (let i = 0; i < num; i++) {
            let fm = new FMNote(createVector((w - ((num - 1) * (side))) / 2 + i * side, h - side), fmamp);
            fm.gain.connect(this.synth.osc.frequency);
            fm.gain.gain.value = fmamp;
            this.fms.push(fm);
        }

        this.analyser = new Tone.Analyser('waveform');
        this.synth.comp.connect(this.analyser);
        this.analyser.toDestination();

        this.active = false;

    }

    clicked(x, y) {

    }

    play() {

        this.fms.forEach((fm) => { fm.play() });
        this.synth.play();

    }

    release() {
        this.fms.forEach((fm) => { fm.release() });
        this.synth.release();

    }

    loop() {


        let arr = this.analyser.getValue();
        let minVal = 1000;
        let maxVal = 0;

        stroke(0, 0, 0);
        noFill();
        beginShape();
        let len = w / arr.length;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] > maxVal) maxVal = arr[i];
            if (arr[i] < minVal) minVal = arr[i];
            let x = i * len;
            let y = map(arr[i], -1, 1, 0, h);
            vertex(x, y);
        }
        endShape();

        strokeWeight(5);
        stroke(60, 100, 100);
        line(0, h - 1.5 * side, w, h - 1.5 * side);

        this.fms.forEach((fm) => {
            fm.display()
        });

        if (mouseIsPressed && this.selected > -1) {
            let s = this.fms[this.selected];
            s.clickTime = millis();
            s.highlight();
            s.pos.y = mouseY;
            s.update();
        }

        let allInactive = true; 
        this.fms.forEach((fm)=>{
            if(fm.playing){
                allInactive = false;
            }
        });

        if(allInactive){
            this.synth.osc.volume.linearRampToValueAtTime(-50, 0.5);
        }else{
            this.synth.osc.frequency.linearRampToValueAtTime(root, 0.5);
            this.synth.osc.volume.linearRampToValueAtTime(this.synth.vol, 0.5);

         
          if(!this.active){
              this.active = true; 
              this.play();
              console.log('play');
          }

        }

    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




