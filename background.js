var activeTabPorts = {}
var injectQueue = []

chrome.runtime.getPackageDirectoryEntry(function (dirEntry) {
    dirEntry.getFile("settings.json", undefined, function (fileEntry) {
    fileEntry.file(function (file) {
            var reader = new FileReader()
            reader.addEventListener("load", function (event) {
                var settings = JSON.parse(reader.result);

                if (settings.modules.length){
                    var onUpdateArr = [];
                    var onCompletedArr = [];

                    for (var i = 0, len = settings.modules.length; i < len; i++) {
                        var module = settings.modules[i];

                        if (!module.path){
                            console.error("module at index["+i+"] is missing path.");
                            break;
                        }

                        if (!module.runAt || !Object.keys(module.runAt).length){
                            console.error("module at index["+i+"] is missing runAt.");
                            break;
                        }

                        if (module.runAt.onUpdate){
                            onUpdateArr.push({path: module.path, url: module.runAt.onUpdate});
                        }

                        if (module.runAt.onCompleted){
                            onCompletedArr.push({path: module.path, url: module.runAt.onCompleted});
                        }
                    }

                    chrome.storage.local.set({onUpdateArr: onUpdateArr, onCompletedArr: onCompletedArr}, function() {
                      if(chrome.runtime.lastError) {
                        console.error(
                          "Error setting " + key + " to " + JSON.stringify(data) +
                          ": " + chrome.runtime.lastError.message
                        );
                      }
                    });

                }else{
                    console.error("modules is missing in settings.json");
                }
            });
            reader.readAsText(file);
        });
    }, function (e) {
        console.error(e);
    });
});

chrome.browserAction.onClicked.addListener(function(tab) {
    //chrome.tabs.create({"url": "https://screeps.com/a/#!/map"});
    chrome.runtime.openOptionsPage();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete"){
        if (tab.url.startsWith("https://screeps.com/a/#!/")){
            /*
            var script = `data = {auth: JSON.parse(localStorage.getItem('auth')),
                          userid: JSON.parse(localStorage.getItem('users.code.activeWorld'))[0]._id}; data;`

            chrome.tabs.executeScript(tabId, {code: script}, function(dataArr){
                console.log(dataArr);
            });
            */

            if (!activeTabPorts[tabId]){
                activeTabPorts[tabId] = {}
            }


            chrome.storage.local.get("onUpdateArr", function(data) {
                if (data.onUpdateArr){
                    data.onUpdateArr.forEach(function(info){
                        if (tab.url.startsWith(info.url)){
                            getStorageSync(info.path, function(option){
                                if (option && option.enabled !== false){
                                    executeModule(tabId, info, option.config);
                                }else{
                                    executeModule(tabId, info);
                                }
                            });
                        }
                    });
                }else{
                    console.error("Failed to read array from onUpdateArr in local storage.");
                }
            });
        }
    }
});

chrome.webRequest.onCompleted.addListener(function(details) {
    chrome.storage.local.get("onCompletedArr", function(data) {
        if (data.onCompletedArr){
            data.onCompletedArr.forEach(function(info){
                if (details.url.startsWith(info.url)){
                    getStorageSync(info.path, function(option){
                        if (option && option.enabled !== false){
                            executeModule(details.tabId, info, option.config);
                        }else{
                            executeModule(details.tabId, info);
                        }
                    });
                }
            });
        }else{
            console.error("Failed to read array from onCompletedArr in local storage.");
        }
    });
}, {urls: ["*://screeps.com/*"]});

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
            console.error("Error in xhttp: " + xhttp.responseText);
            callback();
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    } else if (request.action == "injected"){
        injectQueue = injectQueue.filter(item => item !== request.data);
    }
});

function getStorageSync(path, cb){
    var name = path.replace("modules/", "").replace(".js", "");

    chrome.storage.sync.get(name, function(data) {
        if (data && data[name]){
            cb(data[name]);
        }else{
            cb();
        }
    });
}

function executeModule(tabId, info, config, tries = 15){
    if (!activeTabPorts[tabId][info.path]){
        activeTabPorts[tabId][info.path] = {}
    }

    if (activeTabPorts[tabId][info.path].port){
        activeTabPorts[tabId][info.path].port.postMessage({event: 'update', module:info.path});
    }else{

        if (injectQueue.length === 0){
            injectQueue.push(info.path);

            chrome.tabs.executeScript(tabId, {code: `var module = {name: '${info.path}', config: ${JSON.stringify(config)}}`}, function(){
                chrome.tabs.executeScript(tabId, {file: "module.js"}, function(){
                    chrome.tabs.executeScript(tabId, {file: "content.js"}, function(){
                        chrome.tabs.executeScript(tabId, {file: info.path}, function(){
                            var port = chrome.tabs.connect(tabId, {name: info.path});

                            port.onMessage.addListener(function(msg) {
                              console.log('received message from tab ' + tabId + ':');
                              console.log(msg);
                            });

                            port.onDisconnect.addListener(function(event) {
                              console.log("port disconnected");
                              delete activeTabPorts[tabId][info.path];
                            });

                            port.postMessage({event: 'inject', module:info.path});

                            activeTabPorts[tabId][info.path].port = port;
                        });
                    });
                });
            });
        }else{
            if (tries <= 0){
                console.error("Failed to inject: " + info.path);
            }else{
                setTimeout(function(){
                    executeModule(tabId, info, config, tries - 1);
                }, 500);
            }
        }
    }
}