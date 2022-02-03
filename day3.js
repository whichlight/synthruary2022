/**
 * synthruary day 3
 * Prompt: musique concrète 
 * 
 * <3 whichlight 
 * 
 * 
 */

let synth;
let contextStarted;
let w, h;
let clips = []; 
let visIndex = 0; 



function touchStarted() {
    if (!contextStarted) {
        Tone.start();
        let a = select('#instructions');
        a.remove();
        contextStarted = true;
        background(240, 100, 100);

    }
    updateSynth();
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



function setup() {
    w = windowWidth;
    h = windowHeight;
    colorMode(HSB, 360, 100, 100);
    createCanvas(w, h);
    setupSynths();
    background(240, 100, 100, 100);
    playButton();
   

}


function draw() {
    if(!mouseIsPressed && contextStarted){
        for(clip of clips){
            clip.player.mute = true;
            clip.player.seek(0);
        }
        background(240, 100, 100,0.01);

    }

    let x = mouseX; 
    let y = mouseY; 

    if(contextStarted && mouseIsPressed){
        updateVis(x,y);
    }


}

function setupSynths() {
    clips.push(new Clip("./audio/vroom1.mp3", -1, -1));
    clips.push(new Clip("./audio/dilik.mp3", -1, 1));
    clips.push(new Clip("./audio/bowwwww.mp3", 1, 0));

    for(clip of clips){
        clip.start();    
    }

}

class Clip{
    constructor(source, vol, pan){
        this.panner= new Tone.Panner(pan).toDestination();  
        this.delay = new Tone.FeedbackDelay(0.5, 0.5).connect(this.panner);
        this.delay.wet.value=1;
        this.pitchShift = new Tone.PitchShift(0).connect(this.delay);
        this.player = new Tone.Player(source).connect(this.pitchShift);
        this.player.volume.value = vol;

    }

    start(){
        this.player.autostart = true;
        this.player.loop = true; 
    }
}



function mouseDragged() {
    if (contextStarted) {
        updateSynth();
    }
}

function updateSynth() {

    let x = mouseX; 
    let y = mouseY; 
    let p = map(x,0,w, -10,10); 
    let f = map(y, h, 0, 0, 0.8); 

    for(clip of clips){
        clip.pitchShift.pitch = p;    
        clip.delay.feedback.value = f; 
        
        if(mouseIsPressed){
            clip.player.mute = false;
        }

    }

  

}


function updateVis(x,y){
    let num = floor(map(y,0,h,10,1));


    if(mouseIsPressed){
        visIndex+=(num/2); 
    }

    for(let i=num; i>0; i--){
        let wid = map(x,w,0,w/2000,w/10);
        noStroke();
        fill(300*i/num,100,100,0.5); // 100+180*i/num
        let r = wid+(w/10*i)+visIndex; 
        ellipse(mouseX,mouseY,r,r);
    }

    visIndex%=100;

}

