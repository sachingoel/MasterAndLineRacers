'use Strict';

const amqp = require('amqplib/callback_api');
const redis = require('redis');
const config = require('./config.json');
const lodash = require('lodash');

let racers = process.env.racers;

let start = function(){
  amqp.connect(config.rabbit1,function(err,conn){

    if (err != null) {
      console.log("ERROR: An error occured while connecting to rabbitmq: ",err);
    }

    conn.on("error", function (err) {
      if (err.message !== "Connection closing") {
        console.log("ERROR: Rabbit connection error:", err.message);
        process.exit(1);
      }
    });

    conn.on("close", function () {
      console.log("------CLosing Rabbitmq connection------");
      process.exit(1);
    });

    var writeChannel = conn.createChannel();
    var readChannel  = conn.createChannel();

    writeChannel.assertExchange('from_master','fanout');
    readChannel.assertExchange('from_racers','fanout');

    publish(writeChannel);
    consume(readChannel);
    
  });
}

start();


function getCoordinatesSet(npoints){
  let coordinateObject = {}
  for(let point=1 ; point<=npoints ; point++){
    let xpoint = 'x' + point.toString();
    let ypoint = 'y' + point.toString();
    Object.assign(coordinateObject,{[point]:{[xpoint]:getRandomInt(100),[ypoint]:getRandomInt(100)}}) // Implementing javascript  Array-like object
  }
  return JSON.stringify(coordinateObject);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function publish(writeChannel){
  let dd = getCoordinatesSet(racers);
  console.log("Coordinates published to racers => ",dd);
  writeChannel.publish('from_master','RC',new Buffer(dd));
  return
}

function consume(readChannel){
  let split=1;
  let racerSet = [];
  let backLogArray=[];
  
  
  readChannel.assertQueue('master',{exclusive:true},(err,masterQueue)=>{
    readChannel.bindQueue(masterQueue.queue,'from_racers','');
    readChannel.consume(masterQueue.queue,(msg)=>{
      // console.log("-----------",JSON.parse(msg.content));
      let racerMsg = JSON.parse(msg.content);
      console.log("value of split i s==========",split);
      

    
        if(racerMsg.split==split){
          racerSet.push(racerMsg);

          let backlogPoints = lodash.filter(backLogArray,["split",split]);
          if(backlogPoints.length >0){
            lodash.concat(racerSet,backlogPoints);
          }

        
          console.log("#######################",racerSet);
          console.log("@@@@@@@@@@@@@@@@@@@@@@@",racerSet.length);



          if(racerSet.length == racers ){
            split++;
            let processSet = racerSet.slice();
            racerSet.length = 0;
            calculateDistance(processSet);
          }

        }else{
          backLogArray.push(racerMsg);
        }
      


    })
  })
}



function calculateDistance(data){
 let pointsArray = processCoordinatesArray(data);
 console.log("point array is---------",pointsArray);
//  console.log("x distance is======>>>>>",distance(pointsArray.xArray));
 let maxDistance = distance(pointsArray.xArray) + distance(pointsArray.yArray);
  console.log("***************************************************************");
  console.log("***************************************************************");
  console.log("Max Distance between points is ======>",maxDistance);

}

function processCoordinatesArray(processSet){
  let xArray = [];
  let yArray = [];

  lodash.forEach(processSet,(point)=>{
    lodash.mapKeys(point,(value,key)=>{
      if(key.indexOf("x") !== -1){
        xArray.push(value)
      }else if(key.indexOf("y") !== -1){
        yArray.push(value);
      }
    })
  })
  console.log("xArray is====>",xArray);
  console.log("yArray is =====>",yArray);
  return {'xArray': lodash.sortBy(xArray) , 'yArray': lodash.sortBy(yArray)}
}


function distance(arr){
  res = 0
  sum = 0
  for(let i in arr){
      res += (arr[i] * i - sum)
      sum += arr[i]
  }
  return res
}