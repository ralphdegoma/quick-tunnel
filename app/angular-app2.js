
(function () {


	const electron = require('electron')
	const app = electron.app
	// Module to create native browser window.
	const BrowserWindow = electron.BrowserWindow

	const path = require('path')
	const url = require('url')
	const fs = require("fs");
	const request = require("request");
	const toBlob = require('stream-to-blob')

	const express = require('express')
	const appEx = express()

	//const {dialog} = require('electron')
	const dialog = require('electron').remote.dialog
	var angularApp = angular.module('fileapp', ['app.directives','ngStorage']);
	angularApp.controller('FileController', FileController);





	function FileController($scope,$http,$localStorage) {
		$scope.files = [];
		$scope.data = [];
		$scope.peerCon;
		$scope.peerInst;
		$scope.peerKey;
		$scope.peerMessage;
		//$localStorage.default_dir


		appEx.post('/test', function (req, res) {
		  res.send('Hello World!')
		})

		appEx.listen(3000, function () {
		  console.log('Example app listening on port 3000!')
		})

		url = "/home/dev201611pc/Pictures/sample1.txt";
		//console.log(fs.createReadStream(url));


		$scope.nextFunction =  function (){

		    dialog.showOpenDialog({
		        properties: ['openDirectory']
		    },function(path){
		        if(path){
		            // Start to watch the selected path
		            $scope.readFiles(path[0]);
		            $localStorage.default_dir = path[0];
		        }else {
		            console.log("No path selected");
		        }
		    });


		}



		$scope.readFiles =  function (orig_dir){
		    fs.readdir(orig_dir, (err, dir) => {
			    console.log(orig_dir);
			    for(let filePath of dir){
				  	fs.readFile($localStorage.default_dir+"/"+filePath,(err, data) => {
					  	$scope.files.push(filePath);
						$scope.$apply();
						console.log($localStorage.default_dir+"/"+filePath)
						var test = fs.createReadStream($localStorage.default_dir+"/"+filePath);
						//$scope.upload(orig_dir+"/"+filePath);
					});
			    }
		    });
		    console.log($scope.files);
		}


		if($localStorage.default_dir != undefined){
			$scope.readFiles($localStorage.default_dir);
		}


		$scope.upload = function(url){

			/*WORKING*/
			url = "/home/dev201611pc/Pictures/sample1.txt";
			formData = {
				data: fs.createReadStream(url),
			}

			console.log(formData)

			$scope.peerInst.sendToAll("chat", {message: formData});
			/*request.post({url:'http://localhost/copy/clientIntake/test', formData: formData}, function optionalCallback(err, httpResponse, body) {
			  if (err) {
			    return console.error('upload failed:', err);
			  }
			  console.log(body);
			});*/
			
	        return;
	        /*WORKING*/
			

			
	}
		$scope.StartWatcher =  function (path){
		      var chokidar = require("chokidar");

		      var watcher = chokidar.watch(path, {
		          ignored: /[\/\\]\./,
		          persistent: true
		      });

		      function onWatcherReady(){
		          console.info('From here can you check for real changes, the initial scan has been completed.');
		      }
		            
		      // Declare the listeners of the watcher
		      watcher
		      .on('add', function(path) {
		            console.log('File', path, 'has been added');
		      })
		      .on('addDir', function(path) {
		            console.log('Directory', path, 'has been added');
		      })
		      .on('change', function(path) {
		           console.log('File', path, 'has been changed');
		      })
		      .on('unlink', function(path) {
		           console.log('File', path, 'has been removed');
		      })
		      .on('unlinkDir', function(path) {
		           console.log('Directory', path, 'has been removed');
		      })
		      .on('error', function(error) {
		           console.log('Error happened', error);
		      })
		      .on('ready', onWatcherReady)
		      .on('raw', function(event, path, details) {
		           // This event should be triggered everytime something happens.
		           console.log('Raw event info:', event, path, details);
		      });
		}

		$scope.peerFunction = function(){

			$scope.peerInst = new SimpleWebRTC({
			    // we don't do video
			    localVideoEl: '',
			    remoteVideosEl: '',
			    // dont ask for camera access
			    autoRequestMedia: false,
			    // dont negotiate media
			    receiveMedia: {
			        offerToReceiveAudio: 0,
			        offerToReceiveVideo: 0
			    }
			});

			$scope.peerInst.joinRoom('your awesome room name');

			$scope.peerInst.connection.on('message', function(data){
                if(data.type === 'chat'){
                	
                }
            });


			$scope.peerInst.on('createdPeer', function (peer) {
			    console.log('createdPeer', peer);
			    $scope.peerConnect = peer; 
			    $scope.peerConnect.on('fileTransfer', function (metadata, receiver) {
				    console.log('incoming filetransfer', metadata.name, metadata);

				    receiver.on('progress', function (bytesReceived) {
				        console.log('receive progress', bytesReceived, 'out of', metadata.size);
				    });

				    // get notified when file is done
				    receiver.on('receivedFile', function (file, metadata) {
				        console.log('received file', metadata.name, metadata.size);
				        console.log(file.type)
				       	$scope.saveUploaded(file);
				        // close the channel
				        receiver.channel.close();
				    });
				});
			});

			
		}

		$scope.peerConnect = function(key){
		}

		$scope.peerSend = function(message){
			var file = document.getElementById("peerFile").files[0];
			console.log($scope.peerConnect)
			$scope.peerConnect.sendFile(file);

		}

		$scope.saveUploaded = function(dataObj){

			var saveData = (function () {
			    var a = document.createElement("a");
			    document.body.appendChild(a);
			    a.style = "display: none";
			    return function (data, fileName) {
			        var json = JSON.stringify(data),
			            blob = new Blob([data], {type: "image/jpg"}),
			            url = window.URL.createObjectURL(blob);
			        a.href = url;
			        a.download = fileName;
			        a.click();
			        window.URL.revokeObjectURL(url);
			    };
			}());

			var data = dataObj,
			    fileName =dataObj.name;

			saveData(data, fileName);

		}

		$scope.peerFunction();
		
	}
})();

