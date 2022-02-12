/**
 * synthruary day 8
 * Prompt: West Coast Synthesis
 * 
 * <3 whichlight 
 * 
 * 
 */



let synths = [];
let contextStarted;
let w, h;
const root = 100;
let ctx;

let posX;
let posY;
let posZ;

let num = 20; 


/*************************
 * synth start boilerplate 
 *************************/




function touchStarted() {
    return false;
}

function touchEnded() {
    if (!contextStarted) {
        let a = select('#instructions');
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioContext();
       
        setupSynths();
        a.remove();
        contextStarted = true;
    }
    return false;
}

function playButton() {
    push();
    translate(width * 0.5, height * 0.5);
    fill(0, 0, 0, 0.8);
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

function sum(arr) {
    return arr.reduce((a, b) => a + b);
}


/*************************
 * p5 main fxns
 *************************/

function setup() {
    w = windowWidth;
    h = windowHeight;
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    background(255, 100, 100);
    playButton();
    frameRate(30);
    noStroke();
    posX = 0;
    posY = 0;
    posZ = 0;
    rectMode(CENTER);

}

function draw() {
    if (contextStarted) {
        background(255, 100, 100);


        let bgval = map(mouseY, height,0, 240,300);
        background(bgval,100,100);

        
        let r = min(w,h)/4;
        noStroke();
        fill(180,100,100);
        ellipse(w/2,h/2,r,r);

        push();
        translate(w/2,h/2);
        translate(0,2*r);
        rect(0,0,1.5*r,3*r,30);
        pop();

        /*
        let side = r/num; 
    
        for(let i = 0; i<r; i+=side){
            strokeWeight(10);
            noFill();
            stroke(80*i/r,100,100);
            ellipse(w/2,h/2,i,i);
        }
        */
      

        if (mouseIsPressed) {
            group.pressed(mouseX, mouseY);
        }


        if (!mouseIsPressed && group.playing) {
            group.stop();
        }

      
    



    }
}


/*************************
 * synthy things objects
 *************************/

class Synth {
    constructor(freq, vol) {
        this.gain = ctx.createGain();
        this.gain.gain.value = 0;
        this.vol = vol; 

        this.panner = new PannerNode(ctx, {
            panningModel: 'HRTF',
            distanceModel: 'exponential',
            positionX: posX,
            positionY: posY, 
            positionZ: posZ, 
            rolloffFactor: 5
        });


        this.filter = ctx.createBiquadFilter();
        this.filter.type = "bandpass";
        this.filter.frequency.setValueAtTime(1000, ctx.currentTime)
        this.filter.Q.value = 1;

        this.osc = ctx.createOscillator();
        this.osc.frequency.value = freq;
        this.osc.type = "sawtooth";

        this.osc.connect(this.filter);
        this.filter.connect(this.panner);
        this.panner.connect(this.gain);
        this.osc.start();
    }

    play() {
        this.gain.gain.linearRampToValueAtTime(this.vol, ctx.currentTime + 0.001);
    }

    release() {
        this.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    }

    setNote(freq) {
        this.osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.001);
    }

    setFilter(freq) {
        this.filter.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.001);
    }

    connect(out) {
        this.gain.connect(out)
    }
}



class Group {
    constructor() {
        this.root = root;
        this.prange = [2, 15];
        this.frange = [3, 50];
        this.playing = false;
        this.synths = [];

        this.gain = ctx.createGain();
        this.gain.gain.value = 1;
        this.synths.push(new Synth(this.root, 1));
        this.synths.push(new Synth(this.root*1.5, 1));
        this.synths.push(new Synth(this.root*2, 1));
        this.synths.push(new Synth(this.root*3, 1));

        // listener
        this.listener = ctx.listener; 
        this.listener.positionX.value = posX;
        this.listener.positionY.value = posY;
        this.listener.positionZ.value = posZ;


        // Create a compressor node
        this.compressor = ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-50, ctx.currentTime);
        this.compressor.knee.setValueAtTime(40, ctx.currentTime);
        this.compressor.ratio.setValueAtTime(20, ctx.currentTime);
        this.compressor.attack.setValueAtTime(0, ctx.currentTime);
        this.compressor.release.setValueAtTime(0.01, ctx.currentTime);
        let compressor = this.compressor;

        this.synths.forEach((s)=>{
            s.connect(this.gain);
        });

        
        this.gain.connect(this.compressor);
        this.compressor.connect(ctx.destination);


    }

    pressed(_x = 0, _y = 0) {
      //  let x = map(_x, 0, w, this.prange[0], this.prange[1]) ** 2;
        //let y = map(_y, h, 0, this.frange[0], this.frange[1]) ** (2);
        
        let m = createVector(_x,_y); 
        let c = createVector(w/2, h/2); 
        let pos = p5.Vector.sub(m,c);

      
        


        let d = min(w/h)/2;
        let xpan = map(pos.x, -w/2, w/2, -1*d,d);
        let zpan = map(pos.y, -h/2, h/2, -1*d*2,d*2);
        let f = map(pos.y, -h/2, h/2, 100,0);
        f = f**2; 



        let angle = PI/this.synths.length; 
        let pan = createVector(xpan, zpan); 
        this.synths.forEach((s,i)=>{
            s.panner.positionX.value = pan.x;
            s.panner.positionZ.value = pan.y;
            s.setFilter(f);

        });

        //this.synth.setNote(x);
        this.play();

        let r = min(w,h)/8;

  /*
        push()
        translate(w/2,h/2);
        strokeWeight(r/4);
        stroke(30,100,100);
        line(0,0, pos.x, pos.y);
        pop()
        */


        push();
        translate(w/2,h/2);
        translate(pos.x, pos.y);
        rotate(atan(pos.y/pos.x));
        fill(60,100,100,100);
        noStroke();
        rect(0,0,r,r);
        pop();

        /*
        let r = min(w,h);
        let side = r/num; 
    
        for(let i = 0; i<r; i+=side){
            push();
            translate(w/2,h/2);
            stroke(80*i/r,100,100, 100);
            noFill();
            ellipse(pos.x,pos.y,i,i);
            pop();
        }
        */


    }

    play() {
        this.synths.forEach((s)=>{
            s.play();
        });
        this.playing = true;
    }

    stop() {
        this.synths.forEach((s)=>{
            s.release();
        });
        this.playing = false;
    }
}



/*************************
 * synthy things setup
 *************************/

function setupSynths() {
    group = new Group();
}




