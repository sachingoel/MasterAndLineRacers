'use Strict';

const amqp = require('amqplib/callback_api');
const config = require('./config.json');

let rNumber = process.env.rnumber ;

let consume = function(){
  amqp.connect(config.rabbit1,(err,conn)=>{
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

    let readChannel = conn.createChannel();
    let writeChannel = conn.createChannel();

    readChannel.assertExchange('from_master','fanout');
    writeChannel.assertExchange('from_racers','fanout');
  

      readChannel.assertQueue('',{exclusive:true},(err,racerQueue)=>{
        readChannel.bindQueue(racerQueue.queue,'from_master','')
        readChannel.consume(racerQueue.queue,(msg)=>{
          console.log("Coordiantes from masters are=> ",JSON.parse(msg.content));
          let coordinates = JSON.parse(msg.content)[rNumber];
          
          let split = 1;
          setInterval(function(){
            coordinates['x'+rNumber]++;
            Object.assign(coordinates,{split:split});
            split++;
            console.log("New coordinates are ====>>",coordinates);
            writeChannel.publish('from_racers','MC',new Buffer( JSON.stringify(coordinates) ));
          },5000);
          
        })
      })
  });
}

consume();


// Function which lets the point to move in +ve x-direction and send its current location to master
function moveAndPublish(coordinates){
  console.log("x1 coodinsate are--------",coordinates['x'+rNumber]);
  coordinates['x'+rNumber]++ ;
  console.log("co inside are------",coordinates);

  // setTimeout(function(x){
  //   // coordinates[rNumber]['x'+rNumber] += coordinates[rNumber]['x'+rNumber] + 1;
  //   console.log("Coordiates are=====>>>",x);
  // },50)
}