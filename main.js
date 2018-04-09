var io = require("socket.io")({
	transports : ["websocket"]
});

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";

var http = require("http");

http.createServer(function(req, res){
	res.end("TEST succesfful");
}).listen(server_port);

io.attach(server_port);

console.log("succesfful");
console.log( "Listening on " + server_ip_address + ", port " + server_port );

var clients = 0;
var roomsCount = 1;

io.on("connection", function(socket){

	clients++;
	console.log("clients ---" + clients);

	socket.on("setMyName", function(data){

		var exData = createPost();
		exData.content.string1 = data["myName"];
		console.log(data["myName"] + "----" + data["id"]);
		socket.broadcast.to("room-" + data["id"]).emit("setMe", exData);

	});

	socket.on("SetMyDice", function(data){		

		var exData = createPost();
		exData.content.string1 = data.dice1;
		exData.content.string2 = data.dice2;
		socket.broadcast.to("room-" + data["id"]).emit("setDice", exData);

	});

	socket.on("nothingRequest", function(data){

		console.log("#  -----  " + Math.floor(Math.random() * 1000));
	
		socket.broadcast.to("room-" + data["id"]).emit("nothingAnsw");

	});

	if( io.nsps["/"].adapter.rooms["room-" + roomsCount] &&  io.nsps["/"].adapter.rooms["room-" + roomsCount].length > 0){

		socket.join("room-" + roomsCount);

		var exData = createPost();
		var ran1 = Math.floor((Math.random() * 6) + 1);
		var ran2 = Math.floor((Math.random() * 6) + 1);

		while(ran1 == ran2){

			ran2 = Math.floor((Math.random() * 6) + 1);

		}
		exData.content.numberArray1 = [ran1 , ran2];

		exData.content.number1 = roomsCount;

		console.log("# = # = # = # = #" + exData.content.numberArray1);

		io.sockets.in("room-" + roomsCount).emit("startSetup", exData);

		roomsCount++;

	}else{

		socket.emit("iAmFirst");
		socket.join("room-" + roomsCount);
		
	}

	socket.on("SetMyForw", function(data){

		var curr =  parseInt(data["currItem"]);
		var exData = createPost();
		exData.content.number1 = curr;
		socket.broadcast.to("room-" + data["id"]).emit("SetForw", exData);

	});

	socket.on("SetMyMove", function(data){

		var exData = createPost();
		var pp1 = parseInt(data.move1);
		var pp2 = parseInt(data.move2);
		var dice1 = parseInt(data.dice1);
		var dice2 = parseInt(data.dice2);
		var db_bool = parseInt(data.db_bool);
		var db_dice = parseInt(data.db_dice);

		exData.content.numberArray1 = [pp1, pp2];
		exData.content.numberArray2 = [dice1, dice2];
		exData.content.number1 = db_bool;
		exData.content.number2 = db_dice;

		socket.broadcast.to("room-" + data["id"]).emit("moveIt", exData);

	});

	socket.on("disconnect", function(){

		clients--;
		console.log("clients ###" + clients);

		//socket.broadcast.to("room-" + data["id"]).emit("leavedUser", exData);

	});

});

function createPost(){

	return {

		content : {

			string1 : "none",
			string2 : "none",
			number1 : 0,
			number2 : 0,
			numberArray1 : [0, 0],
			numberArray2 : [0, 0]

		}

	};

}