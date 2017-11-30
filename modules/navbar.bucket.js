module.exports.init = function(){

    $(document).ready(function() {
      $('button.navbar-profile-btn').click(function(event){
            if ($('#bucket').length == 0){

                $('div.sysbar.ng-scope .mem').after(`
                    <div class="mem" id="bucket" style="margin-top:10px">
                        <div class="sysbar-indicator">
                            <div id="bucket_width" class="sysbar-indicator-progress">
                                <div id="bucket_opacity" class="warning"></div>
                            </div>
                        </div>
                        <div class="sysbar-title">
                            <span>Bucket:</span><strong id="bucket_value" style='padding-left: 10px;'>...</strong> / 10000
                        </div>
                    </div>`);

                
            }

            if (module.exports.socket){
                module.exports.closeSocket();
                document.getElementById('bucket_value').innerHTML = "...";
            }else{

                module.exports.listenToConsole();
                module.exports.fetchBucket();
                module.exports.animateLoading();
            }
            

      });
    });

}

module.exports.animateLoading = function(){
    if (module.exports.animateLoadingInterval == undefined){
        module.exports.animateLoadingInterval = setInterval(function(){
            var val = document.getElementById('bucket_value');

            if (val.innerHTML.indexOf("...") > -1) 
                val.innerHTML = "&nbsp;&nbsp;&nbsp;";
            else 
                val.innerHTML = val.innerHTML.replace("&nbsp;", ".");

        }, 250);
    }

}

module.exports.update = function(){
}

module.exports.updateBucket = function(value){
    var bucket = parseInt(value);

    if (module.exports.animateLoadingInterval){
        clearInterval(module.exports.animateLoadingInterval);

        module.exports.animateLoadingInterval = undefined;
    }

    document.getElementById('bucket_width').style.width = bucket / 1e4 * 100 + '%';
    document.getElementById('bucket_opacity').style.opacity = 1 - bucket / 1e4;
    document.getElementById('bucket_value').innerHTML = bucket;
}

module.exports.fetchBucket = function(){
    var command = `'SC-Bucket:' + Game.cpu.bucket`;
    module.sendConsoleCommand(command, undefined, module.getCurrentShard());    
}

module.exports.listenToConsole = function(){
    var auth = JSON.parse(localStorage.getItem('auth'));
    var userid = JSON.parse(localStorage.getItem('users.code.activeWorld'))[0]._id;
    var host = "wss://screeps.com/socket/websocket"

    module.exports.socket = new WebSocket(host);

    module.exports.socket.onopen = function(){
        module.exports.socket.send("auth " + auth);
    }

    module.exports.socket.onmessage = function(msg){

        if (msg.data.indexOf("auth ok") > -1){
            console.log("sending subscribe to console");

            var subscribe = "subscribe user:" + userid +"/console";
            module.exports.socket.send(subscribe);
        }
        else if (msg.data.indexOf("SC-Bucket:") > -1){
            var data = JSON.parse(msg.data);
            var logArray = data[1].messages.results;
            logArray.forEach(function(log){
                if (log.indexOf("SC-Bucket:") > -1){
                    var value = log.replace('SC-Bucket:', '');
                    module.exports.updateBucket(value);
                    module.exports.fetchBucket();
                }
            });
        }
        else if (msg.data.indexOf("/console") > -1){
            if (this.recievedConsole === undefined){
                module.exports.fetchBucket();
                this.recievedConsole = true;
            }
        }
    }
}

module.exports.closeSocket = function(){
    if (module.exports.socket){
        console.log("closing socket for bucket")
        module.exports.socket.close();
        module.exports.socket = undefined;
    }
}