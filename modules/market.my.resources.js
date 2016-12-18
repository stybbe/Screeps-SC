module.exports.init = function(){
    module.exports.base = ['energy','power','H','O','U','L','K','Z','X'];
    module.exports.tier1 = ['OH','ZK','UL','G','UH','UO','KH','KO','LH','LO','ZH','ZO','GH','GO'];
    module.exports.tier2 = ['UH2O','UHO2','KH2O','KHO2','LH2O','LHO2','ZH2O','ZHO2','GH2O','GHO2'];
    module.exports.tier3 = ['XUH2O','XUHO2','XKH2O','XKHO2','XLH2O','XLHO2','XZH2O','XZHO2','XGH2O','XGHO2'];

    var userid = JSON.parse(localStorage.getItem('users.code.activeWorld'))[0]._id;

    module.ajaxGet("https://screeps.com/api/user/rooms?id=" + userid, function(data, error){
        if (data && data.rooms){
            module.exports.rooms = data.rooms;
        }else{
            module.exports.rooms = [];
            console.error(data || error);
        }

        $('body').on('click', `.market-controls > button`, function () {
            module.exports.fetchResources();
        });

        module.exports.update();
    });    
}

module.exports.update = function(){
    module.getScopeData("market", "$parent", [], function(){

        if (!document.getElementById('sc-my-resources')){
            var svg = module.exports.getLoadingSVG();

            var bodyElement = 
            $(`<div id="sc-my-resources" style="padding:30px 0 10px 30px;"><div style="font-size: 15px;">My resources:</div>
                <select id="sc-dropdown" style="border-color: transparent;background: #444;color: #ccc;">
                  <option value="None">None</option>
                  <option value="Storage & Terminal" selected>Storage & Terminal</option>
                  <option value="Storage">Storage</option>
                  <option value="Terminal">Terminal</option>
                </select>
                ${svg}
                <div id="container4" style="clear: left;float: left;width: 100%;overflow: hidden;">
                <div id="container3" style="clear: left;float: left;width: 100%;position: relative;right: 25%;padding-bottom:15px;">
                    <div id="container2 style="clear: left;float: left;width: 100%;position: relative;right: 25%;"">
                        <div id="container1" style="float: left;width: 100%;position: relative;right: 52%;">
                            <div id="col1" style="float: left;width: 23.75%;position: relative;left: 77%;overflow: hidden;">
                            <div style="color: #999;">Base: </div>
                            </div>
                            <div id="col2" style="float: left;width: 23.75%;position: relative;left: 77.5%;overflow: hidden;">
                            <div style="color: #999;">Tier 1: </div>
                            </div>
                            <div id="col3" style="float: left;width: 23.75%;position: relative;left: 78%;overflow: hidden;">
                            <div style="color: #999;">Tier 2: </div>
                            </div>
                            <div id="col4" style="float: left;width: 23.75%;position: relative;left: 78.5%;overflow: hidden;">
                            <div style="color: #999;">Tier 3: </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>`);
            
            var savedDrop = localStorage.getItem('scMarketDropdown');
            if (savedDrop){
                var dropdownElement = bodyElement.find('#sc-dropdown');
                dropdownElement.val(savedDrop);

                if (savedDrop == "None"){
                    bodyElement.find('#container4').hide();
                }
            }
            
            for(let i = 0; i < module.exports.base.length; i++){
                bodyElement.find('#col1').append(module.exports.getTabElement(module.exports.base[i]));
            }

            for(let i = 0; i < module.exports.tier1.length; i++){
                bodyElement.find('#col2').append(module.exports.getTabElement(module.exports.tier1[i]));
            }

            for(let i = 0; i < module.exports.tier2.length; i++){
                bodyElement.find('#col3').append(module.exports.getTabElement(module.exports.tier2[i]));
            }

            for(let i = 0; i < module.exports.tier3.length; i++){
                bodyElement.find('#col4').append(module.exports.getTabElement(module.exports.tier3[i]));
            }

            $('.market.ng-scope > div:nth-child(1)').after(bodyElement);

            module.exports.listenToConsole();

            $(window).on('hashchange', function(e){
                var inMarketPage = window.location.href.startsWith('https://screeps.com/a/#!/market/');

                if (!inMarketPage){
                    $(window).off('hashchange');
                    module.exports.closeSocket();
                }
                
            });

            $('body').on('change', '#sc-dropdown', function () {
                if (this.value == "None"){
                    $('#container4').hide();
                }else{
                    $('#container4').show();
                    module.exports.fetchResources();
                }
                localStorage.setItem('scMarketDropdown', this.value);
            });
        }

        if (!window.SCresources){

            if (window.location.href === 'https://screeps.com/a/#!/market/all'){
                var verifyFunc = function(){
                    var allOrdersScope = angular.element(document.getElementsByClassName('market-all-orders ng-scope')).scope();

                    if (allOrdersScope && allOrdersScope.AllOrders && allOrdersScope.AllOrders.resources && allOrdersScope.AllOrders.resources && Object.keys(allOrdersScope.AllOrders.resources).length > 0){
                        return true;
                    }

                    return false;
                }
                var delayFunc = function(){
                    var allOrdersScope = angular.element(document.getElementsByClassName('market-all-orders ng-scope')).scope();
                    if (!window.SCresources){
                        window.resources = allOrdersScope.AllOrders.resources;
                    }
                    
                    
                }

                module.wait(verifyFunc, 50, delayFunc);
            }
        }


    });
}

module.exports.getTabElement = function(resource){
    var amount = 0;
    // Todo inject css...
    var tabElementText = `<a id="sc-${resource}" class="market-resource" href="https://screeps.com/a/#!/market/all/${resource}" style="background: #333;padding: 8px 10px;margin-top: 3px;display: flex;justify-content: space-between;font-size: 14px;cursor: pointer;text-decoration: none;color: #eee;" onmouseover="this.style.backgroundColor='#444'" onmouseout="this.style.backgroundColor='#333'">
        <div class="resource-name">
        <img src="https://s3.amazonaws.com/static.screeps.com/upload/mineral-icons/${resource}.png" style="margin-right: 3px;">
        </div>
        <div id="sc-val-${resource}" style="margin-bottom:-6px">
            <svg class="uil-ellipsis" height="20px" preserveaspectratio="xMidYMid" viewbox="0 0 100 100" width="20px" xmlns="http://www.w3.org/2000/svg">
              <use xlink:href="#sc-svg-loading">
            </svg>
        </div>
        </a>`

    var obj = $(tabElementText);

    $('body').on('click', `#sc-${resource}`, function () {
        setTimeout(function() {
            var scope = angular.element(document.getElementsByClassName('market-all-orders-resource ng-scope')).scope();
            if (scope && scope.ResourceOrders){
                $('.resource-header.ng-binding > img').attr("src", `https://s3.amazonaws.com/static.screeps.com/upload/mineral-icons/${resource}.png`)
                if (window.resources){
                    scope.ResourceOrders.resourceName = window.resources[resource];
                }else{
                    scope.ResourceOrders.resourceName = resource;
                }
                
                scope.ResourceOrders.reload();
            }
        }, 50);
    });

    return $(tabElementText);
}

module.exports.setRoomDropdown = function(rooms){
    var roomInputField = $('.orders-table__target-room.ng-scope > md-input-container > input');
    console.log("trying to set rooms");

    if (roomInputField.length > 0){
        if (!roomInputField.attr('list')){
            roomInputField.attr('list', 'sc-roomList');
            roomInputField.attr('autocomplete', 'off');
            var roomString = "";

            for(let i in rooms){
                var roomName = rooms[i];

                roomString += `<option label='${roomName}' value='${roomName}'>`
            }

            $('#sc-roomList').remove();
            roomInputField.after($(`<datalist id='sc-roomList'>${roomString}</datalist>`))
        }
    }
}

module.exports.updateResourceAmount = function(){
    if (window.SCMarket){
        var flag = localStorage.getItem('scMarketDropdown');
        var sum = {}
        console.log(sum);

        $('div[id^="sc-val-"]').html("0");

        for(let roomName in window.SCMarket){
            let room = window.SCMarket[roomName];

            if (flag == "Storage & Terminal" || flag == "Storage"){
                for (let mineral in room.storage){
                    if (!sum[mineral]){
                        sum[mineral] = 0;
                    }

                    if (room.storage[mineral]){
                        sum[mineral] += room.storage[mineral]
                    }
                }
            }

            if (flag == "Storage & Terminal" || flag == "Terminal"){
                for (let mineral in room.terminal){
                    if (!sum[mineral]){
                        sum[mineral] = 0;
                    }

                    if (room.terminal[mineral]){
                        sum[mineral] += room.terminal[mineral]
                    }
                }
            }
        }

        for(let mineral in sum){
            if (sum[mineral] > 0){
                var l10nEN = new Intl.NumberFormat("en-US");
                var amount = l10nEN.format(sum[mineral]);
                $(`#sc-val-${mineral}`).text(amount);
            }
        }

        module.exports.setRoomDropdown(Object.keys(window.SCMarket));
    }
}

module.exports.fetchResources = function(){
    var command = 'console.log("<script>window.SCMarket="+(function(){var a={};for(var b in Game.rooms){var c=Game.rooms[b];c&&c.controller&&c.controller.my&&c.controller.level>=4&&(a[b]={},a[b].storage=c.storage?c.storage.store:{},a[b].terminal=c.terminal?c.terminal.store:{})}return JSON.stringify(a)})()+"</script>");console.log("Module fetched storages & terminals.");'
    
    $('div[id^="sc-val-"]').html(`<svg class="uil-ellipsis" height="20px" preserveaspectratio="xMidYMid" viewbox="0 0 100 100" width="20px" xmlns="http://www.w3.org/2000/svg">
          <use xlink:href="#sc-svg-loading">
        </svg>`);

    module.sendConsoleCommand(command);
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
        else if (msg.data.indexOf("SCMarket") > -1){
            var data = JSON.parse(msg.data);
            var logArray = data[1].messages.log;
            logArray.forEach(function(log){
                if (log.indexOf("SCMarket") > -1){
                    var evalData = log.replace('<script>', '').replace('</script>', '');
                    eval(evalData);
                    module.exports.updateResourceAmount();
                }
            });
        }
        else if (msg.data.indexOf("/console") > -1){
            if (this.recievedConsole === undefined){
                var savedDrop = localStorage.getItem('scMarketDropdown');
                if (savedDrop !== "None"){
                    module.exports.fetchResources();
                }
                
                this.recievedConsole = true;
            }
        }

        //console.log(msg);
    }
}

module.exports.closeSocket = function(){
    if (module.exports.socket){
        console.log("closing socket for market")
        module.exports.socket.close();
    }
}

module.exports.getLoadingSVG = function(){
    return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
        <symbol id="sc-svg-loading" viewbox="0 0 100 100" width="20px" height="20px" preserveaspectratio="xMidYMid" class="uil-ellipsis">
            <circle cx="84" cy="50" fill="#fff" r="2.10574" transform="rotate(0 50 50)">
                <animate attributename="r" begin="0s;anir14.end" dur="0.1875s" fill="freeze" from="0" id="anir11" to="8"></animate>
                <animate attributename="r" begin="anir11.end" dur="0.9375s" fill="freeze" from="8" id="anir12" to="8"></animate>
                <animate attributename="r" begin="anir12.end" dur="0.1875s" fill="freeze" from="8" id="anir13" to="0"></animate>
                <animate attributename="r" begin="anir13.end" dur="0.1875s" fill="freeze" from="0" id="anir14" to="0"></animate>
                <animate attributename="cx" begin="0s;anix18.end" dur="0.1875s" fill="freeze" from="16" id="anix11" to="16"></animate>
                <animate attributename="cx" begin="anix11.end" dur="0.1875s" fill="freeze" from="16" id="anix12" to="16"></animate>
                <animate attributename="cx" begin="anix12.end" dur="0.1875s" fill="freeze" from="16" id="anix13" to="50"></animate>
                <animate attributename="cx" begin="anix13.end" dur="0.1875s" fill="freeze" from="50" id="anix14" to="50"></animate>
                <animate attributename="cx" begin="anix14.end" dur="0.1875s" fill="freeze" from="50" id="anix8" to="84"></animate>
                <animate attributename="cx" begin="anix8.end" dur="0.1875s" fill="freeze" from="84" id="anix16" to="84"></animate>
                <animate attributename="cx" begin="anix16.end" dur="0.1875s" fill="freeze" from="84" id="anix17" to="84"></animate>
                <animate attributename="cx" begin="anix17.end" dur="0.1875s" fill="freeze" from="84" id="anix18" to="16"></animate>
            </circle>
            <circle cx="16" cy="50" fill="#cccccc" r="5.89426" transform="rotate(0 50 50)">
                <animate attributename="r" begin="0s;anir25.end" dur="0.75s" fill="freeze" from="8" id="anir21" to="8"></animate>
                <animate attributename="r" begin="anir21.end" dur="0.1875s" fill="freeze" from="8" id="anir22" to="0"></animate>
                <animate attributename="r" begin="anir22.end" dur="0.1875s" fill="freeze" from="0" id="anir23" to="0"></animate>
                <animate attributename="r" begin="anir23.end" dur="0.1875s" fill="freeze" from="0" id="anir24" to="8"></animate>
                <animate attributename="r" begin="anir24.end" dur="0.1875s" fill="freeze" from="8" id="anir25" to="8"></animate>
                <animate attributename="cx" begin="0s;anix28.end" dur="0.1875s" fill="freeze" from="16" id="anix21" to="50"></animate>
                <animate attributename="cx" begin="anix21.end" dur="0.1875s" fill="freeze" from="50" id="anix22" to="50"></animate>
                <animate attributename="cx" begin="anix22.end" dur="0.1875s" fill="freeze" from="50" id="anix23" to="84"></animate>
                <animate attributename="cx" begin="anix23.end" dur="0.1875s" fill="freeze" from="84" id="anix24" to="84"></animate>
                <animate attributename="cx" begin="anix24.end" dur="0.1875s" fill="freeze" from="84" id="anix25" to="84"></animate>
                <animate attributename="cx" begin="anix25.end" dur="0.1875s" fill="freeze" from="84" id="anix26" to="16"></animate>
                <animate attributename="cx" begin="anix26.end" dur="0.1875s" fill="freeze" from="16" id="anix27" to="16"></animate>
                <animate attributename="cx" begin="anix27.end" dur="0.1875s" fill="freeze" from="16" id="anix28" to="16"></animate>
            </circle>
            <circle cx="41.0506" cy="50" fill="#fff" r="8" transform="rotate(0 50 50)">
                <animate attributename="r" begin="0s;anir35.end" dur="0.375s" fill="freeze" from="8" id="anir31" to="8"></animate>
                <animate attributename="r" begin="anir31.end" dur="0.1875s" fill="freeze" from="8" id="anir32" to="0"></animate>
                <animate attributename="r" begin="anir32.end" dur="0.1875s" fill="freeze" from="0" id="anir33" to="0"></animate>
                <animate attributename="r" begin="anir33.end" dur="0.1875s" fill="freeze" from="0" id="anir34" to="8"></animate>
                <animate attributename="r" begin="anir34.end" dur="0.5625s" fill="freeze" from="8" id="anir35" to="8"></animate>
                <animate attributename="cx" begin="0s;anix38.end" dur="0.1875s" fill="freeze" from="50" id="anix31" to="84"></animate>
                <animate attributename="cx" begin="anix31.end" dur="0.1875s" fill="freeze" from="84" id="anix32" to="84"></animate>
                <animate attributename="cx" begin="anix32.end" dur="0.1875s" fill="freeze" from="84" id="anix33" to="84"></animate>
                <animate attributename="cx" begin="anix33.end" dur="0.1875s" fill="freeze" from="84" id="anix34" to="16"></animate>
                <animate attributename="cx" begin="anix34.end" dur="0.1875s" fill="freeze" from="16" id="anix35" to="16"></animate>
                <animate attributename="cx" begin="anix35.end" dur="0.1875s" fill="freeze" from="16" id="anix36" to="16"></animate>
                <animate attributename="cx" begin="anix36.end" dur="0.1875s" fill="freeze" from="16" id="anix37" to="50"></animate>
                <animate attributename="cx" begin="anix37.end" dur="0.1875s" fill="freeze" from="50" id="anix38" to="50"></animate>
            </circle>
            <circle cx="75.0506" cy="50" fill="#cccccc" r="8" transform="rotate(0 50 50)">
                <animate attributename="r" begin="0s;anir44.end" dur="0.1875s" fill="freeze" from="8" id="anir41" to="0"></animate>
                <animate attributename="r" begin="anir41.end" dur="0.1875s" fill="freeze" from="0" id="anir42" to="0"></animate>
                <animate attributename="r" begin="anir42.end" dur="0.1875s" fill="freeze" from="0" id="anir43" to="8"></animate>
                <animate attributename="r" begin="anir43.end" dur="0.9375s" fill="freeze" from="8" id="anir44" to="8"></animate>
                <animate attributename="cx" begin="0s;anix48.end" dur="0.1875s" fill="freeze" from="84" id="anix41" to="84"></animate>
                <animate attributename="cx" begin="anix41.end" dur="0.1875s" fill="freeze" from="84" id="anix42" to="16"></animate>
                <animate attributename="cx" begin="anix42.end" dur="0.1875s" fill="freeze" from="16" id="anix43" to="16"></animate>
                <animate attributename="cx" begin="anix43.end" dur="0.1875s" fill="freeze" from="16" id="anix44" to="16"></animate>
                <animate attributename="cx" begin="anix44.end" dur="0.1875s" fill="freeze" from="16" id="anix45" to="50"></animate>
                <animate attributename="cx" begin="anix45.end" dur="0.1875s" fill="freeze" from="50" id="anix46" to="50"></animate>
                <animate attributename="cx" begin="anix46.end" dur="0.1875s" fill="freeze" from="50" id="anix47" to="84"></animate>
                <animate attributename="cx" begin="anix47.end" dur="0.1875s" fill="freeze" from="84" id="anix48" to="84"></animate>
            </circle>
        </symbol>
    </svg>`;
}