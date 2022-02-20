/**
 * synthruary day 19
 * Prompt: Rhythms
 * 
 * <3 whichlight 
 * 
 * 
 */


let contextStarted;
let w, h;
const root = 10;
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
    background(240,100,100);
    playButton();
    frameRate(30);
    noStroke();
    side = min(100, min(w, h) / 8); 
}

function draw() {
    if (contextStarted) {

        background(240,100,100);
        if(mouseIsPressed){
           //controls();


 
        }


        group.loop();
    }
}


function controls() {
    let x = map(mouseX, 0, w, 0.1, 3) ** 2;
    let y = map(mouseY, 0, h, 0.1, 3) ** 2;
    group.fm.osc.frequency.value = x;
    group.fm2.osc.frequency.value = y;
}

function synthOn() {
    group.selected = group.fms.findIndex((s) => s.isClicked(createVector(mouseX, mouseY)));
    //group.play();
}

function synthRelease() {
   // group.release();
   
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
        this.comp = new Tone.Compressor().toDestination();
        this.effect = new Tone.Reverb(0.1).connect(this.comp); 
        this.lowfilter = new Tone.Filter(2000, "lowpass").connect(this.effect);
        this.highfilter = new Tone.Filter(0, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = type;
        this.osc.envelope.attack = 0.01;
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 0;
        this.osc.volume.value = 20;
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
    constructor(type, pos, vol) {
        this.osc = new Tone.Synth();
        this.osc.oscillator.type = type;
        this.pos = pos; 
        this.r = side;
        this.osc.frequency.value = 0;
        this.playing = false; 
        this.vol = vol;
        this.clickTime = millis();

    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
        this.osc.triggerAttack(this.pitch, 0.5);
    }


    release() {
        this.osc.triggerRelease();
    }

    update() {
  

        if(this.pos.y>h-side){
            this.osc.volume.value = 0;
            this.osc.frequency.value = 0;


            this.playing = false; 
        }else{
            this.osc.volume.value = this.vol; 
            this.playing = true; 
            let y = map(this.pos.y, h, 0, 0.1, 2) ** 2;
            this.osc.frequency.value = y;
        }

        /** 
         * this may be good for birdsong 
        let x = map(this.pos.x, 0, w, 5, 100) ;
        this.osc.volume.value = x;
        **/
    }

    highlight(){
        fill(0,0,100);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);

    }

    display() {
        if(this.playing){
            let cycle = sin(frameCount*this.osc.frequency.value/5);
            let b = 100*(1+cycle);
            let c = 300; 

            fill(c,b,100)
        } else{
            fill(0,0,50);
        }
        
        ellipse(this.pos.x, this.pos.y, this.r, this.r);

    }
    
}

class Group {
    constructor() {
        this.synth = new Note(root, "triangle");
        this.fms = [];
        this.selected = -1; 

        let num = 7;
        let fmamp = 50; 

        for(let i = 0; i<num; i++){
            let fm = new FMNote("sawtooth", createVector((w - ((num-1)*(side)))/2+i*side, h-side), fmamp);
            fm.osc.connect(this.synth.osc.frequency);
            fm.osc.volume.value = fmamp;
            this.fms.push(fm); 
        }

        this.active = false; 
        this.play();

    }

    clicked(x, y) {

    }

    play() {
 
        this.fms.forEach((fm)=> {fm.play()});
        this.synth.play();

    }

    release() {
        this.fms.forEach((fm)=> {fm.release()});
        this.synth.release();

    }

    loop() {

        strokeWeight(5);
        stroke(60,100,100);
        line(0, h-1.5*side, w, h-1.5*side);

        this.fms.forEach((fm)=> {
            fm.display()
        });

        if (mouseIsPressed && this.selected > -1) {
            let s = this.fms[this.selected];
            s.clickTime = millis(); 
            s.highlight();
            s.pos.y = mouseY;
            s.update();
        }

     

      

    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




