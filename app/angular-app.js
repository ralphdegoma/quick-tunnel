
(function () {
	const electron = require('electron')
	const app = electron.app
	const BrowserWindow = electron.BrowserWindow
	const path = require('path')
	const url = require('url')
	const fs = require("fs");
	const request = require("request");
	const toBlob = require('stream-to-blob')

	const express = require('express')
	const appEx = express()
	const mime = require('mime-types')
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

		appEx.post('/test', function (req, res) {
		  res.send('Hello World!')
		})

		appEx.listen(3000, function () {
		  console.log('Example app listening on port 3000!')
		})

		$scope.peerFunction = function(){
			$scope.peerInst = new SimpleWebRTC({
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
                	console.log(data.payload.blob)
                	$scope.saveUploaded(data.payload.blob);
                }
            });

			$scope.peerInst.on('createdPeer', function (peer) {
			    console.log('createdPeer', peer);
			    $scope.peerConnect = peer; 
			    $scope.peerConnect.on('fileTransfer', function (metadata, receiver) {
				    console.log('incoming filetransfer', metadata.name, metadata);
				    console.log(receiver)
				    receiver.on('progress', function (bytesReceived) {
				        //console.log('receive progress', bytesReceived, 'out of', metadata.size);
				    });

				    receiver.on('receivedFile', function (file, metadata) {
				        console.log('received file', metadata.name, metadata.size);
				        console.log(file)
				        console.log(metadata)
				       	$scope.saveUploaded(file,metadata);
				        // close the channel
				        receiver.channel.close();
				    });
				});
			});
		}

		$scope.nextFunction =  function (){
		    dialog.showOpenDialog({
		        properties: ['openDirectory']
		    },function(path){
		        if(path){
		            $scope.readFiles(path[0]);
		            $localStorage.default_dir = path[0];
		        }else {
		            console.log("No path selected");
		        }
		    });
		}
		$scope.readFiles =  function (orig_dir){
		    fs.readdir(orig_dir, (err, dir) => {
			    for(let filePath of dir){
				  	fs.readFile($localStorage.default_dir+"/"+filePath,(err, data) => {
					  	$scope.files.push(filePath);
						$scope.$apply();
						var test = fs.createReadStream($localStorage.default_dir+"/"+filePath);
						//$scope.upload(orig_dir+"/"+filePath);
					});
			    }
		    });
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
	        return;
	        /*WORKING*/
		}
		$scope.peerSend = function(message){
			var url = "/home/dev201611pc/Videos/real estate video.mp4";
			var mim_type = mime.lookup(url);
			console.log(mim_type)



			toBlob(fs.createReadStream(url),mim_type, function (err, blob) {
			  	if (err) return console.error(err.message)
				$scope.peerConnect.sendFile(blob);
			})
		}
		$scope.saveUploaded = function(dataObj,metadata){
			var saveData = (function () {
			    var a = document.createElement("a");
			    document.body.appendChild(a);
			    a.style = "display: none";
			    return function (data, fileName) {
			        var json = JSON.stringify(data),
			            blob = new Blob([data], {type: ""}),
			            url = window.URL.createObjectURL(blob);

			        a.href = url;
			        a.download = fileName;
			        console.log(blob)
			        a.click();
			        window.URL.revokeObjectURL(url);
			    };
			}());
			var data = dataObj,
			    fileName =metadata.name;

			saveData(data, fileName);
		}







		$scope.peerFunction();
	}
})();

