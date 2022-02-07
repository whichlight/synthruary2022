/**
 * synthruary day 7
 * Prompt: Raindrops 
 * 
 * <3 whichlight 
 * 
 * 
 */


let synths = [];
let contextStarted;
let w, h;
const root = 100;
const delay = 2; 
let drops = []; 
const numDrops = 50;
let g_num = 1; 



/*************************
 * synth start boilerplate 
 *************************/
function touchStarted() {
  
    return false;
}

function touchEnded() {
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
    fill(180, 0, 100,0.5);
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

function sum(arr){
    return arr.reduce((a,b)=>a+b);
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
    background(240,100,100);
    playButton();
    frameRate(30);
    noStroke();
    rectMode(CENTER);
}

function draw() {
    if (contextStarted) {
        background(240,100,100,0.1);
        group.loop(); 

        drops.forEach((d,i)=>{
            d.run(); 
            if (d.done() && !d.splashed) {
                d.splashed = true; 
                group.drop(d.velocity.y);
                d.splash();
              }
              if (d.life==0) {
                drops.splice(i, 1);
              }
        });


    }

    if(mouseIsPressed && contextStarted){
        group.pressed(mouseX, mouseY);
    }   
}


function synthPressed(){
   // group.pressed(mouseX, mouseY);
}

function synthReleased(){

}


/*************************
 * synthy things objects
 *************************/

class Note {
    constructor(freq, vol=0, len=0.5) {
        this.f = Tone.Frequency(400); 
        this.lowfilter = new Tone.Filter(this.f.toFrequency()+100, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(this.f.toFrequency()-100, "highpass").connect(this.lowfilter);
        this.synth = new Tone.NoiseSynth().connect(this.highfilter);
        this.lowfilter.Q.value=30;
        this.highfilter.Q.value=30;
        this.synth.envelope.attack = 0.001;
        this.synth.envelope.decay = 0.2;
        this.synth.envelope.sustain = 0;
        this.synth.envelope.release = 0.4;
        this.synth.volume.value = vol;
        this.len = len; 
    }

    play(){
        this.synth.triggerAttackRelease(this.len); 
    }

    setNote(freq){
        this.f = Tone.Frequency(freq);
        this.lowfilter.frequency.value = this.f.toFrequency()+100; 
        this.highfilter.frequency.value = this.f.toFrequency()-100; 

    }
}

class Group{
    constructor(num=10){
        this.root = root; 
        this.num = num;
        this.synths = []; 
        this.frange = [50,500];
        this.synthIndex = 0; 
        this.delay=0;
        
        //create synths 
        for(let i = 0; i<this.num; i++){
            this.synths.push(new Note(this.root,-1.5*(this.num),0.1));
        }

    }

    pressed(_x=0,_y=0){
        let wid = abs(w/2-_x); 
        let y = _y
        let r = map(wid, 0, w/2, 0, 1);
        g_num = floor(map(r, 0, 1, 1, 5));

        drops.push(new Particle(createVector(mouseX,mouseY)));

        for(let i =0; i<(g_num-1); i++){
            let x = random(w/2 - wid, w/2+wid);
            let yval = random(y,h);
            drops.push(new Particle(createVector(x,yval)));
        }
     
    }

    drop(val){
        let f = this.root + map(val,5,40,this.frange[0],this.frange[1]);
        this.play(f);
    }

    play(f){
       //grab the next synth and cue it up to play 
        let s = this.synths[this.synthIndex];
        s.setNote(f);
        s.synth.volume.value = -2*(this.num+g_num);
        s.play(); 
        this.synthIndex++;
        this.synthIndex%=this.synths.length;    
    }

    loop(){
        if(this.delay>0){
           this.delay-=1; 
        }
    }

}


// A simple Particle class
class Particle {
    constructor(pos){
        this.acceleration = createVector(0, 0.3);
        this.velocity = createVector(0, random(5, 10));
        this.position = pos.copy();
        this.life = 100; 
        this.splashed = false; 
    }
  
  run = function() {
    this.update();
    this.display();
  }
  
 update = function(){
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);

    if(this.splashed){
        this.life-=5; 
    }

    if(this.position.y >h && this.splashed){
        this.position.y = h;
    }

  }
  
  display () {
    fill(180,this.life,100);
    rect(this.position.x, this.position.y, 24, 25);
  }
  
   done(){
    return this.position.y > h;
  }
    splash(){
        this.acceleration = createVector(0, 0.05);
        this.velocity = createVector(random(-1,1), random(-2, 0));
        
    }

    
}



/*************************
 * synthy things setup
 *************************/

function setupSynths() {    
    group = new Group(10); 
}




