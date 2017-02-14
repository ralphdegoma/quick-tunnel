angular.module('app.directives', []).directive('fileloader', fileloader);

function fileloader() {
    return {
    	scope:{
            apploaderData: '=data' 
        },
        template: '<li ng-repeat="x in apploaderData">{{ x.Name }} </li>', // DOESNT WORK
        link : function($scope,$element,$attr) {
        	console.log($element)
        }

    }
}
