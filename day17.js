/**
 * synthruary day 17
 * Prompt: Three pitches
 * 
 * <3 whichlight 
 * 
 * 
 */

let contextStarted;
let w, h;
const root = 60;
let group;
let baseTime = 500;
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
    fill(280, 100, 100);
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
    side =  min(100, min(w, h) / 8);
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    setupSynths();
    background(240, 50, 100);
    playButton();
    frameRate(20);
    noStroke();
}

function draw() {
    if (contextStarted) {
        background(240, 50, 100);

        group.loop();

    }
}

function synthOn() {

}

function synthRelease() {

    group.synths.forEach((s) => {
        if (s.isClicked(createVector(mouseX, mouseY))) {
            s.active = !s.active;

            if(s.active){


                let index = group.getIndex(s);
                s.setNote(s.root + group.notes[index]);
                s.play(); 
            }
        }
    })

    group.faders.forEach((f,i) => {
        if (f.isClicked(createVector(mouseX, mouseY))) {
            group.setFaderVal(i,mouseY);

            group.synths.forEach((s) => {
                let index = group.getIndex(s);
                s.setNote(s.root + group.notes[index]);
                s.osc.frequency.value = s.pitch;

            });
        }
    })
}


/*************************
 * synthy things 
 *************************/

function setupSynths() {

    group = new Group();
}

class Note {
    constructor(rate, pos, col, note, vol) {
        this.root = note;
        this.note = note;
        this.toplay = [];
        this.lowfilter = new Tone.Filter(1000, "lowpass").toDestination();
        this.highfilter = new Tone.Filter(50, "highpass").connect(this.lowfilter);
        this.osc = new Tone.Synth().connect(this.highfilter);
        this.osc.oscillator.type = "triangle";
        this.osc.envelope.decay = 1;
        this.osc.envelope.sustain = 1;
        this.osc.envelope.release = 2;
        this.vol = vol;
        this.osc.volume.value = this.vol;
        this.pitch = Tone.Frequency(this.root, "midi");
        this.pos = pos;
        this.r = side;
        this.col = col; 
        this.start = millis();
        this.rate = rate;
        this.noteIndex = 0;
        this.notes = [0, 3, 7];
        this.active = true;
    }

    isClicked(m) {
        return (p5.Vector.dist(m, this.pos) < this.r / 2)
    }

    play() {
        this.osc.triggerAttack(this.pitch, 0.01);
    }

    setNote(p) {
        let m = Tone.Frequency(p, "midi");
        this.note = p;
        this.pitch = m;
    }

    release() {
        this.osc.triggerRelease();
    }

    display() {
        noStroke();
        this.active
            ?   fill(this.col, 100, 100) 
            :   fill(this.col, 100, 20);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }
}

class Group {
    constructor(synths) {
        this.synths = [];
        this.faders = [];
        this.root = root; 
        this.notes = [7,5,0];

        for (let i = 0; i < 6; i++) {
            let pos = createVector(w/2 - 3*side + side/2 + i * side, side);
            let c = 60+55*i;
            let note = 100 - 12*i; 
            let vol = -10*(6-i*0.1); 
            this.synths.push(new Note(3**i, pos, c,note, vol));
        }

        this.synths[0].active = false; 
        this.synths[5].active = false; 

        this.faders.push(new NoteFader(createVector(w/2 - 3*side, side*2), this.notes[0]));
        this.faders.push(new NoteFader(createVector(w/2 - side, side*2),this.notes[1]));
        this.faders.push(new NoteFader(createVector(w/2 + side, side*2),this.notes[2]));


    }

    getIndex(s){
        let measureLen = 3**5; 
        let beats = measureLen*3; 
        let loopTime = frameCount % beats; 
        let index = floor((loopTime / s.rate)%3); 
        return index; 
    }

    setVolume() {
        let num = 0;
        this.synths.forEach((s) => {
            if (s.active) {
                num++;
            }
        });

        this.synths.forEach((s) => {
            s.osc.volume.value = s.vol - 1 * num;
        });
    }



    setFaderVal(index, y){
        let f = this.faders[index];
        let minval = 0; 
        let maxval = side*5; 
        let val = f.pos.y + side*5 - y; 
        let note = floor(map(val, minval, maxval, 0, 12));
        f.setNote(note);
        this.notes[index]=note; 
        return note; 
    }

    displayFaderBars(){

        for(let j = 5; j >=0 ; j--){ 
            let s = this.synths[j];
                let measureLen = this.synths[this.synths.length-1].rate; 
                let beats = measureLen*3; 
                let beatlen = side*2*3/beats; 
                let numBars = beats/s.rate;  
                let barLen = beatlen * s.rate; 
                if (s.active){
                    for(let i=0; i<numBars; i++){
                        noStroke();
                        fill(s.col, 100,100);

                        let loopTime = frameCount % beats; 
                        let barnum = floor(loopTime / s.rate); 
                        let barnote = loopTime % s.rate; 

                        if(barnum == i){
                            fill(s.col, 0,100);

                        }
                        rect(w/2 - 3*side + i*barLen, side*2 + (12-this.notes[i%3]-1)*(side*5/12)+j*(side*5/12)/6, barLen,(side*5/12)/6);
                    }
                }
            }
    }

    loop() {
        this.setVolume();
        let t = floor(millis()); 
        this.synths.forEach((s) => { 
            if (frameCount % s.rate == 0 && s.active){

              // play next note 
              s.noteIndex += 1;
              s.noteIndex %= this.notes.length;

              let measureLen = 3**5; 
              let beats = measureLen*3; 
              let loopTime = frameCount % beats; 
              let index = floor((loopTime / s.rate)%3); 

              s.setNote(s.root + this.notes[index]);
              s.play();
            }

           
            s.display();

            if(!s.active){
                s.release();
            }
        });

        this.faders.forEach((f)=>{
            f.display();
        });
        this.displayFaderBars();
    }
}

class NoteFader{
    constructor(pos, note){
        this.pos = pos; 
        this.note = note; 
    }

    setNote(note){
        this.note = note; 
    }
    
    isClicked(m){
        let boolx = (m.x > this.pos.x && m.x < this.pos.x + side*2); 
        let booly = (m.y > this.pos.y && m.y < this.pos.y + side*5);
        return (boolx && booly);  
    }

    display(){
        strokeWeight(5);
        stroke(300,100,100);
        fill(280,100,20); 
        rect(this.pos.x, this.pos.y, side*2, side*5)

        noStroke();
        fill(300,50,100);
//        stroke(0,0,100);
        rect(this.pos.x, this.pos.y+(12-this.note-1)*(side*5/12), side*2, (side*5)/12);

    }
}


function sum(arr) {
    return arr.reduce((a, b) => a + b);
}




