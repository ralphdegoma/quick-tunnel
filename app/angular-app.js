
(function () {


	const electron = require('electron')
	const app = electron.app
	// Module to create native browser window.
	const BrowserWindow = electron.BrowserWindow

	const path = require('path')
	const url = require('url')
	const fs = require("fs");
	const request = require("request");
	//const {dialog} = require('electron')
	const dialog = require('electron').remote.dialog
	var angularApp = angular.module('fileapp', ['app.directives']);
	angularApp.controller('FileController', FileController);





	function FileController($scope,$http) {
		$scope.files = [];
		$scope.data = [];
		$scope.nextFunction =  function (){

		    dialog.showOpenDialog({
		        properties: ['openDirectory']
		    },function(path){
		        if(path){
		            // Start to watch the selected path
		            $scope.readFiles(path[0]);
		        }else {
		            console.log("No path selected");
		        }
		    });


		}



		$scope.readFiles =  function (orig_dir){
		    fs.readdir(orig_dir, (err, dir) => {
			    console.log(orig_dir);
			    for(let filePath of dir){
				  	fs.readFile(orig_dir+"/"+filePath,(err, data) => {
					  	$scope.files.push(orig_dir+"/"+filePath);
						$scope.$apply();

						var test = fs.createReadStream(orig_dir+"/"+filePath);
						console.log(test)
						$scope.upload(orig_dir+"/"+filePath);
					});
			    }
		    });
		    console.log($scope.files);
		}

		$scope.upload = function(url){

			/*$http({
	            method: 'POST',
	            url: "http://localhost/copy/clientIntake/test",
	            data:  data,
	            headers: {
	                'Content-Type': 'application/x-www-form-urlencoded'
	            },
	        }).then(function successCallback(response) {
	            console.log(response)
	        }, function errorCallback(response) {
	            // console.log('an error occured on saving the the url in database');
	        });*/


	        var formData = {
			  // Pass a simple key-value pair
			  my_field: 'my_value',
			  // Pass data via Buffers
		
			  attachments: [
			    
			    fs.createReadStream(url)
			  ],
			
			};
			    
			request.post({url:'http://localhost/copy/clientIntake/test', formData: formData}, function optionalCallback(err, httpResponse, body) {
			  if (err) {
			    return console.error('upload failed:', err);
			  }
			  console.log(body);
			});
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


	}
})();

