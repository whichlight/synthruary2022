/**
 * synthruary day 2
 * Prompt: arpegiattor 
 * 
 * <3 whichlight 
 * 
 * ref: https://github.com/Tonejs/Tone.js/wiki/Arpeggiator
 * 
 */

let synth;
let contextStarted;
let w, h;
let pattern;
let feedbackDelay; 
let g_rate = 1; 
let g_index=0; 
let g_x=0; 
let g_y=1; 
let size = 100; 


function touchStarted() {
    if (!contextStarted) {
        Tone.start();
        setupSynths();
        let a = select('#instructions');
        a.remove();
        contextStarted = true;
    }

    updateSynth();
    return false;
}

function setup() {
    w = windowWidth;
    h = windowHeight;
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    background(60, 30, 100,100);
    drawTriangle();
}


function draw() {
    let y = g_y; 
    let x = g_x;


}

function setupSynths() {
    feedbackDelay = new Tone.PingPongDelay(0.5, 0.5).toDestination();
    feedbackDelay.wet.value=0;
    
    synth = new Tone.MonoSynth().connect(feedbackDelay);

    synth.set({
        "oscillator" : {
            "type": "pulse"
        },
        "filterEnvelope":
        {
            "attack": 0.01, 
            "decay": 0.5,
            "sustain": 0.2,
            "release": 0
        }

    });

    let root = 40;
    let intervals = [0, 3, 5, 9];

    //add an octave
    for (i of intervals.slice()) { intervals.push(12 + i); }

    //create notes and turn to values for arp  
    let notes = intervals.map((i) => root + i);
    let values = notes.map((n) => Tone.Frequency(n, "midi"));


    setInterval(function(){
        background(60, 30, 100,0.4);

        let note = values[g_index];
        let time = Tone.now(); 
        synth.triggerAttackRelease(note, 2, time);
       
        let x = floor(100*g_x/10);
        let size= max(5,g_y*h/50);
        let r = min(w,h)*g_index/values.length;

        strokeWeight(size);
        for(let i = 0; i<values.length; i++){
            stroke(300,100,100);
            noFill();
            ellipse(w/2-(i*g_x*100),h/2,r,r);
            ellipse(w/2+(i*g_x*100),h/2,r,r);
            
        }
      

        g_index++;
        g_index%=values.length;
    }, 100)

    Tone.Transport.start();

}



function mouseDragged(){
    if(contextStarted){
        updateSynth(); 
    }
}

function updateSynth(){
        let x = mouseX;
        let y = mouseY;
        let len = map(abs(y-h/2), 0, h/2, 0.1, 1);
        let wet = map(abs(w/2-x),0,w/2,0,0.5);
        feedbackDelay.wet.value = wet;
        g_x = feedbackDelay.wet.value; 
        g_y = map(abs(h/2-y), h/2, 0, 1, 0); 
        synth.set({
            "envelope":
            {
                "decay": len,
                "sustain": len,
                "release": len
            }
    
        });
    
}

function drawTriangle(){
    push();
    translate(width * 0.5, height * 0.5);
    fill(180,100,100);
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

