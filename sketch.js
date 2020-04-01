let video;
let poseNet;
let pose;
let skeleton;
let brain;
let poseLabel = "N";

let command = 0;
let previous = 0;
let score =0;
let miss = false;
let bDisplayMessage = false;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  
  if (results[0].confidence > 0.7) {
    poseLabel = results[0].label.toUpperCase();
  }
  //console.log(results[0].confidence);
  classifyPose();
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  fill(255, 0, 255);
  noStroke();
  textSize(64);
  textAlign(CENTER, CENTER);
  
  //text(poseLabel, width / 2, height / 2);
  
  if (command ==0){
    tcommand = "JAB";
  }else if(command ==1) {
    tcommand = "BLOCK";
  }else if(command ==2) {
    tcommand = "UPPERCUT";
  }
  text(tcommand, width/2, height/1.1);
  text("Score: "+score,width/1.3,height/10);
  
  //text("frameCount: "+frameCount,width/3,height/1.2);
  
  if(frameCount ==180){
    command = random([0,1,2]);
    if (previous == command){
      command +=1;
    }
    if (command ==3){
      command =0;
    }
    //console.log(command);
    frameCount =0
  }
  if(frameCount ==120){
    if(poseLabel =="J" && command ==0){
      c = color('rgb(0,0,255)');
      fill(c);
      //text("HIT !", width/3, height/3.5);
      score ++;
      bDisplayMessage = true;
    }else if(poseLabel =="H" && command ==1){
      c = color('rgb(0,0,255)');
      fill(c);
      //text("HIT !", width/3, height/3.5);
      score ++;
      
      bDisplayMessage = true;
    }else if(poseLabel =="U" && command ==2){
      c = color('rgb(0,0,255)');
      fill(c);
      //text("HIT !", width/2, height/2);
      console.log("hit");
      score ++;
      
      bDisplayMessage = true;
    }
    else {
      miss = true;
    }
      
  }
  
  if (frameCount>=120)
  {
    c = color('rgb(0,0,255)');
    fill(c);
    if(bDisplayMessage){
      text("HIT !", 150, height / 2);
    } else if (miss){
      fill(255,255,255);
      text("miss", 150, height / 2);
    }
    // If the spent time is above the defined duration
    if (frameCount >170)
    {
      // Stop displaying the message, thus resume the ball moving
      bDisplayMessage = false;
      miss = false;
    }
  }
  
  
  previous = command;
}