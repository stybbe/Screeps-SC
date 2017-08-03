module._init = function(){
    document.addEventListener(this.name, this._listener.bind(this));

    this.exports.init.bind(this.exports)();
}

module._listener = function (e){
    var data = JSON.parse(e.detail);

    switch(data.event) {
        case 'update':
            module.exports.update();
            break;
        case 'dispose':
            module._dispose();
            break;
        case 'xhttp':
            break;
        default:
            break;
    }

    if (data._cb){
        if (module._cbEvents[data._cb]){
            var cb = module._cbEvents[data._cb].cb;

            if (cb){
                cb(data);
            }

            delete module._cbEvents[data._cb];
        }else{
            console.error("Failed to fetch callback event: " + data._cb);
        }
    }
}

module._dispose = function(){
    document.removeEventListener(this.name, this._listener);
}

module._guid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

module._cbEvents = {}

module.dispatchEvent = function(data, cb){
    data.module = this.name;

    if (cb){
        var guid = module._guid();
        
        module._cbEvents[guid] = {
            time: new Date().getTime(),
            id: guid,
            cb: cb
        }

        data._cb = guid;
    }

    var evt = new CustomEvent("_" + this.name, {
        detail: JSON.stringify(data),
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(evt);
}

module.getDeepValue = function(obj, path){
    for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
        if (obj === undefined || obj[path[i]] === undefined){
            return undefined;
        }

        obj = obj[path[i]];
    };
    return obj;
}

module.getScopeData = function(scopeName, objectPath, mustExistPathArr, cb){
    var self = this;
    this.wait.bind(this)(this.isScopeReady.bind(this, scopeName, objectPath, mustExistPathArr), 50, function(error){
        if (error){
            console.error(`condition failed for scope: ${scopeName}, path: ${objectPath}, mustExistArr: ${mustExistPathArr}`)
        }else{
            var scope = angular.element(document.getElementsByClassName(`${scopeName} ng-scope`)).scope();
            cb(self.getDeepValue(scope, objectPath));
        }
    });
}

module.setScopeData = function(scope, objectPath, value, cb){
    var script = document.createElement('script');
    script.textContent = `angular.element(document.getElementsByClassName('${scope} ng-scope')).scope().${objectPath}=${value};`;

    (document.body || document.head || document.documentElement).appendChild(script);
    script.remove();

    if(cb){
       cb(); 
    }
}

module.wait = function(condition, tries, cb){
    var self = this;
    if (condition()){
        cb.bind(self)();
    }else{
        if (tries > 0){
            setTimeout(function() { self.wait.bind(self)(condition, tries - 1, cb); }, 100);
        }else{
            cb.bind(self)("failed condition");
        }
    }
}

module.isScopeReady = function(scopeName, objectPath, mustExistPathArr){
    var self = this;
    var scope = angular.element(document.getElementsByClassName(`${scopeName} ng-scope`)).scope();
    var object = self.getDeepValue(scope, objectPath);
    var rootValid = (scope && object && Object.keys(object).length);

    if (mustExistPathArr.length){

        if (rootValid){
            let ready = true;
            mustExistPathArr.forEach(function(path){
                var obj = self.getDeepValue(scope, path);
                if (obj === undefined){
                    return ready = false;
                } else if (obj instanceof Array && !obj.length){
                    return ready = false;
                } else if (typeof obj === 'object' && !Object.keys(obj).length){
                    return ready = false;
                }
            });

            return ready;
        }
    }

    return rootValid;
}

module.ajaxCall = function(data, cb){

    // Set tokens if it's a request to @screeps
    if (data.url && data.url.startsWith("https://screeps.com/")){
        var auth = JSON.parse(localStorage.getItem('auth'));
        
        data.headers = {
            'X-Token' : auth,
            'X-Username' : auth
        }
    }

    var request = $.ajax(data);

    request.done(function(msg) {
        if (cb){ 
            cb(msg); 
        }
    });

    request.fail(function(jqXHR, msg) {
        if (cb){ 
            cb(undefined, jqXHR.status);
        }
    });
}

module.ajaxGet = function(url, cb){
    module.ajaxCall({
        url: url,
        method: 'GET'
    }, cb);
}

module.getCurrentShard = function(){
    var url = window.location.href;

    if (url.indexOf("shard") > -1){
        var pathArray = window.location.href.split('/');

        for (var i = 0; i < pathArray.length; i++) {
            if (pathArray[i].startsWith("shard")){
                return pathArray[i].split('?')[0];
            }
        }
    }

    return ""; 
}

module.sendConsoleCommand = function(command, cb, shard){

    if (!shard){
        shard = "shard0";
    }

    module.ajaxCall({
        url: "https://screeps.com/api/user/console",
        method: "POST",
        data: {
               expression: command,
               shard: shard
           }
    }, cb);
}

module.exports = {
    init: function(){
        // To be overrided
        console.warn("module.exports.init is not overrided.");
    },
    update:function(){
        // To be overrided
        console.warn("module.exports.update is not overrided.");
    },

}