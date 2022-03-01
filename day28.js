/**
 * synthruary day 28
 * Prompt: Natural/Organic
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 80;
let group;
let types = ['square', 'sawtooth'];
let gr = 0; 
let gf = 2000;


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
        background(120, 100, 50, 100);
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
    background(120, 100, 50, 100);
    playButton();
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {
        if(mouseIsPressed){
            group.loop();
            gr = map(mouseX, 0, w, 0, 7);
            gr = constrain(gr, 0, 7);

            gf = map(mouseY, 0, h, 8000, 0);
            gf = constrain(gf, 0,8000);

            let bc = map(mouseY, 0,h, 0, 100); 
            let bb = map(mouseY, 0,h, 50, 0); 
            background(240, bc, bb+50,0.1);

            let num = gr * 100; 
            for(let i =0; i<num; i++){
                let x=  random(w); 
                let y = random(h); 
                let c = 60+random(120); 
                let r = min(w,h)/30;
                let s = 80*(1-mouseY/h); 
                fill(c,100,20+s);
                ellipse(x,y,r,r);
            }
    
        }else{
            background(120, 100, 50,0.1);
        }
        

    }
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

function setupSynths() {
   
    group = new Group();
}

class Note {
    constructor(note=root, pos=createVector(w/2,h/2)) {
        this.root = random(90,100);
        this.note = this.root; 
        this.toplay = [];
        this.lowfilter = new Tone.Filter(2000, "lowpass");
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.panner = new Tone.Panner(random(-0.5, 0.5)).connect(this.highfilter);
        this.osc = new Tone.Synth().connect(this.panner);
        this.osc.oscillator.type = "sawtooth";
        this.osc.envelope.attack = random(1);
        this.osc.envelope.decay = 0;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = random(2);
        this.osc.volume.value = -30;
        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = pos;
        this.r = min(100, min(w, h) / 8);
        this.start = millis(); 
        this.rate = random(10,40); 
        this.t = floor(random(this.rate)); 

        this.gainlfo = new Tone.Synth(); 
        this.gainlfo.oscillator.type = "sine";
    //    this.gainlfo.connect(this.osc.volume);
        this.gainlfo.volume.value = 5; 
        this.gainlfo.triggerAttack(random(0.1,1),0.1, random(2));




        //lfos
        this.lfos = []
        
        let vol = random(60,70);
        for(let i = 0; i<3; i++){
            let l = new Tone.Synth();
            l.oscillator.type = types[floor(random(types.length))];
            l.connect(this.osc.frequency);
            l.volume.value = vol; 
            l.triggerAttack(random(2,4),0.1, random(3));
            this.lfos.push(l);
        }
      
       

     
       
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r/2)
    }

    play() {
        this.osc.triggerAttack(this.pitch, 0.01);
    }

    chirp(){
        this.osc.triggerAttackRelease(this.pitch, random(0.5,1));

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

        for(let i = 0; i < 10 ; i++){
            let n = new Note(); 
            n.lowfilter.toDestination();
            this.synths.push(n); 

        }
   

    }

    clicked(x, y) {
        this.play();
    }

    play() {
       // this.synths.forEach((s) => { s.play();});

    }

    loop(){
        this.synths.forEach((s) => { 
            if(s.t > s.rate){
                s.chirp();
                s.t = 0; 
                s.lfos.forEach((l)=>{
                    l.frequency.value = random(gr, 2+gr)
                });
                s.lowfilter.frequency.value = gf; 
            }
            s.t++; 
        });


    }

    release() {
        this.synths.forEach((s) => { s.release(); });
    }


}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




