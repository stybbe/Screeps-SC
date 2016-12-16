function inject(obj){
    if (document.getElementById(obj.name)){
        console.log("injected twice");

        dispatchEvent(obj.name, {event: 'update'});
    }else{
        var script = document.createElement('script');
        script.id = obj.name;
        script.textContent =`(function(){var module = ${toString(obj)}; module._init();})();`;

        (document.body || document.head || document.documentElement).appendChild(script);
    }
    
}

function toString(obj){
    var objStr = '';

    for (var member in obj) {
        objStr += (objStr ? ',\n': '') + member + ':';

        if (obj[member] instanceof Array){
            objStr += JSON.stringify(obj[member]);
        }
        else if (typeof obj[member] === 'string'){
            objStr += '"' + obj[member] + '"';
        }
        else if (typeof obj[member] === 'object'){
            objStr += toString(obj[member]);
        }else{
            objStr += obj[member] + '';
        }
    }   

    return `{\n${objStr}\n}`
}

function eventsSentFromScript(e){
    var data = JSON.parse(e.detail);

    switch(data.event) {
        case 'xhttp':
            chrome.runtime.sendMessage({
                method: 'GET',
                action: 'xhttp',
                url: data.url
            }, function(responseText) {
                data.data = responseText;

                dispatchEvent(data.module, data);
            });
            break;
        case 'dispose':
            module._dispose();
            break;
        default:
            console.log(data);
    }
}

function eventsSentFromBackground(msg){

    switch(msg.event) {
        case 'inject':
            document.addEventListener("_" + msg.module, eventsSentFromScript);
            inject(module);
            chrome.runtime.sendMessage({action:'injected', data:msg.module});
            break;
        case 'update':
            dispatchEvent(msg.module, JSON.stringify(msg));
            break;
        case 'dispose':
            dispatchEvent(msg.module, '{"event":"dispose"}');
            document.removeEventListener("_" + msg.module, eventsSentFromScript);
            break;
        default:
            console.error("Unrecognized message event occured in module.js: " + msg.event);
    }
}

function dispatchEvent(name, data){
    if (typeof data === 'object'){
        data = JSON.stringify(data);
    }

    var evt = new CustomEvent(name, {
        detail: data,
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(evt);
}

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.removeListener(eventsSentFromBackground)
    port.onMessage.addListener(eventsSentFromBackground);
});