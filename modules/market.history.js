module.exports.init = function(){
    var userid = JSON.parse(localStorage.getItem('users.code.activeWorld'))[0]._id;

    module.ajaxGet("https://screeps.com/api/user/rooms?id=" + userid, function(data, error){
        if (data && data.shards){
            module.exports.shards = data.shards;
        }else{
            module.exports.shards = {};
            console.error(data || error);
        }

        module.exports.update();
    });    
}

module.exports.update = function(){
    module.getScopeData("market-history", "History", ['History.data.money.list'], function(history){
        var list = history.data.money.list;

        var elements = document.getElementsByClassName('market-history-description');

        for(var i = 0; i < list.length; i++){
            var historyObj = list[i];
            if (historyObj.type == "market.fee"){

            } 
            else if (historyObj.type == "market.buy" || historyObj.type == "market.sell"){
                var shard = list[i].shard || "shard0";
                var market = list[i].market
                var type = market.resourceType;
                var roomName = market.roomName;
                var targetRoomName = market.targetRoomName;
                var transactionCost = module.exports.calcTransactionCost(market.amount, roomName, targetRoomName);
                var targetRoomIsMine = false;

                var resourceIcon = `<a href="#!/market/all/${shard}/${type}">
                                        <img src="https://s3.amazonaws.com/static.screeps.com/upload/mineral-icons/${type}.png" style="margin-right:0">
                                    </a>`;

                var resourceEnergy = `<a href="#!/market/all/${shard}/energy">
                                        <img src="https://s3.amazonaws.com/static.screeps.com/upload/mineral-icons/energy.png">
                                      </a>`;

                if (module.exports.shards[shard] && module.exports.shards[shard].includes(targetRoomName)){
                    let temp = roomName;
                    roomName = targetRoomName;
                    targetRoomName = temp;
                    targetRoomIsMine = true;
                }

                var roomLink = `<a href="#!/room/${shard}/${roomName}">${roomName}</a>`;
                var targetRoomLink = `<a href="#!/room/${shard}/${targetRoomName}">${targetRoomName}</a>`;
                var infoCircle = '<div class="fa fa-question-circle" title=\'' + JSON.stringify(list[i].market) + '\'></div>'
                var transactionCostHtml = `(<span style="color:#ff8f8f;margin-right:-12px">-${transactionCost} ${resourceEnergy}</span>)`

                if (historyObj.type == "market.buy"){
                    if (targetRoomIsMine){
                        elements[i].innerHTML = `${roomLink} bought ${market.amount}${resourceIcon} (${market.price}) from ${targetRoomLink} ${transactionCostHtml} ${infoCircle}`;
                    }else{
                        elements[i].innerHTML = `${roomLink} bought ${market.amount}${resourceIcon} (${market.price}) from ${targetRoomLink} ${infoCircle}`;
                    }   
                    
                }else{
                    if (targetRoomIsMine){
                        elements[i].innerHTML = `${roomLink} sold ${market.amount}${resourceIcon} (${market.price}) to ${targetRoomLink} ${transactionCostHtml} ${infoCircle}`;
                    }else{
                        elements[i].innerHTML = `${roomLink} sold ${market.amount}${resourceIcon} (${market.price}) to ${targetRoomLink} ${infoCircle}`;
                    }
                }
            }
            
        }

    });
}

/* taken from @screeps market */
module.exports.calcTransactionCost = function (amount, roomName1, roomName2) {

    var distance = module.exports.calcRoomsDistance(roomName1, roomName2, true);

    console.log("amount: " + amount + " roomName1: " + roomName1 + " roomName2: " + roomName2 + " distance: " + distance);
    return Math.max(0, Math.ceil(amount * (Math.log((distance + 9) * 0.1) + 0.1)));
}

/* taken from @screeps utils */
module.exports.calcRoomsDistance = function (room1, room2, continuous) {
    var _exports$roomNameToXY = module.exports.roomNameToXY(room1);

    var _exports$roomNameToXY2 = module.exports._slicedToArray(_exports$roomNameToXY, 2);

    var x1 = _exports$roomNameToXY2[0];
    var y1 = _exports$roomNameToXY2[1];

    var _exports$roomNameToXY3 = module.exports.roomNameToXY(room2);

    var _exports$roomNameToXY4 = module.exports._slicedToArray(_exports$roomNameToXY3, 2);

    var x2 = _exports$roomNameToXY4[0];
    var y2 = _exports$roomNameToXY4[1];

    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    if (continuous) {
        var width = constants.WORLD_WIDTH;
        var height = constants.WORLD_HEIGHT;

        dx = Math.min(width - dx, dx);
        dy = Math.min(height - dy, dy);
    }
    return Math.max(dx, dy);
}

/* taken from @screeps utils */
module.exports.roomNameToXY = function (name) {

    name = name.toUpperCase();

    var match = name.match(/^(\w)(\d+)(\w)(\d+)$/);
    if (!match) {
        return [undefined, undefined];
    }

    var _match = module.exports._slicedToArray(match, 5);

    var hor = _match[1];
    var x = _match[2];
    var ver = _match[3];
    var y = _match[4];

    if (hor == 'W') {
        x = -x - 1;
    } else {
        x = +x;
    }
    if (ver == 'N') {
        y = -y - 1;
    } else {
        y = +y;
    }
    return [x, y];
};

/* taken from @screeps utils */
module.exports._slicedToArray = (function() {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }
    return function(arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
})();