module.exports.init = function(){
    module.dispatchEvent({event: 'xhttp', url:'http://www.leagueofautomatednations.com/alliances.js'}, function(response){
        module.exports.alliances = JSON.parse(response.data);

        module.exports.userToAlliance = {}

        for(var alliance in module.exports.alliances){
            var members = module.exports.alliances[alliance].members;
            for(var member in members){
                var memberName = members[member];

                module.exports.userToAlliance[memberName] = alliance;
            }
        }

        module.exports.update();
    });
}

module.exports.update = function(){
    module.getScopeData("page-content", "WorldMap", ['WorldMap.displayOptions.layer', 'WorldMap.roomUsers', 'WorldMap.sectors', 'WorldMap.roomStats'], function(worldMap){

        $('.room-name.ng-binding').unbind("DOMSubtreeModified").bind("DOMSubtreeModified", function(){
            var roomElement = document.getElementsByClassName('room-name ng-binding')[0];
            var roomName = roomElement.innerText.replace("Room", "").trim();
            $("div[id^=display-]").remove();

            if (worldMap.roomStats[roomName] && worldMap.roomStats[roomName].own){
                var username = worldMap.roomUsers[worldMap.roomStats[roomName].own.user].username;
                var allianceName = module.exports.userToAlliance[username];

                if (allianceName){
                    var div = document.createElement("div");
                    div.id = "display-" + roomName;

                    var label = document.createElement("label");
                    label.innerText = "Alliance: ";

                    var span = document.createElement("span");
                    span.innerText = allianceName;
                    span.setAttribute("style", 'color:#bbb');

                    div.appendChild(label);
                    label.appendChild(span);

                    roomElement.parentNode.appendChild(div);
                }
            }
        });

        if (worldMap.displayOptions.layer == "owner0" && worldMap.zoom == 3){
            var visibleRoomElements = $('canvas.room-objects.ng-scope');

            for(var eleName in visibleRoomElements){
                var element = visibleRoomElements[eleName];

                if (element.parentNode){
                    var roomName = element.attributes["app:game-map-room-objects"].value;



                    var id = "alliance-" + roomName;

                    var allianceNodes = $(element.parentNode).children('[id^=alliance-]');
                    var hasRoomNode = false;

                    if (allianceNodes.length > 0){
                        for(var i = 0; i < allianceNodes.length; i++){
                            var roomId = allianceNodes[i].id;

                            if (roomId == id){
                                hasRoomNode = true;
                            }else{
                                // need to remove because the map reuse old elements
                                $("#" + roomId).remove();
                            }
                        }
                    }

                    if (hasRoomNode == false){

                        if (worldMap.roomStats[roomName] && worldMap.roomStats[roomName].own){

                            var username = worldMap.roomUsers[worldMap.roomStats[roomName].own.user].username;
                            var allianceName = module.exports.userToAlliance[username];

                            if (module.exports.userToAlliance[username] && module.exports.alliances[allianceName]){
                                
                                var c = module.exports.hexToRgb(module.exports.alliances[allianceName].color);
                                c.a = 0.2;

                                var rgba = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")";

                                var newEle = document.createElement("div");
                                newEle.id = id;
                                newEle.className = 'room-prohibited';

                                if (module.config && module.config.background === "Image"){
                                    var url = "http://www.leagueofautomatednations.com/obj/" + module.exports.alliances[allianceName].logo;

                                    newEle.setAttribute("style", `background-image: url("${url}");
                                        background-size: 150px 150px;
                                        opacity : 0.2;`);

                                }else{
                                    var c = module.exports.hexToRgb(module.exports.alliances[allianceName].color);
                                    c.a = 0.2;
                                    newEle.setAttribute("style", `background: rgba(${c.r},${c.g},${c.b},${c.a});`);
                                }

                                element.parentNode.appendChild(newEle);
                                
                            }
                        }
                    }
                    
                }
            }
        }
        else if (worldMap.zoom == 2){

            var sectors = worldMap.sectors;

            for(var sectorId in worldMap.sectors){
                var sector = worldMap.sectors[sectorId];

                if (!sector.rooms){
                    continue;
                }

                var canvaElement = $(`#${sector.id}`);

                if (!canvaElement){
                    continue;
                }

                canvaElement.siblings(`div:not([id^=alliance-${sector.firstRoomName}])`).remove();

                var correctRooms = canvaElement.siblings(`div[id^=alliance-${sector.firstRoomName}]`);

                if (correctRooms.length == 0){
                    var x = 0;
                    var y = 0;
                    var rooms = sector.rooms.split(',');

                    for(var i = 0; i < rooms.length; i++){
                        
                        var roomName = rooms[i];

                        if (i % 4 == 0 && i != 0){
                            y = 1;
                            x += 1;
                        }else{
                            y += 1;
                        }

                        if (!worldMap.roomStats[roomName] || !worldMap.roomStats[roomName].own){
                            continue;
                        }

                        var username = worldMap.roomUsers[worldMap.roomStats[roomName].own.user].username;
                        var allianceName = module.exports.userToAlliance[username];

                        if (module.exports.userToAlliance[username] && module.exports.alliances[allianceName]){
                            var id = "alliance-" + sector.firstRoomName + "-" + roomName;

                            if (!document.getElementById(id)){
                                
                                var left = (x + 1) * 50 - 50;
                                var top = (y - 1) * 50;
                                var newEle = document.createElement("div");
                                var css = `z-index: 1;
                                    height: 50px;
                                    width: 50px;
                                    position: absolute;
                                    left: ${left}px;
                                    top: ${top}px;`;

                                if (module.config && module.config.background === "Image"){
                                    var url = "http://www.leagueofautomatednations.com/obj/" + module.exports.alliances[allianceName].logo;

                                    css += `background-image: url("${url}");
                                        background-size: 50px 50px;
                                        opacity : 0.2;`;
                                }else{
                                    var c = module.exports.hexToRgb(module.exports.alliances[allianceName].color);
                                    c.a = 0.3;

                                    css += `background: rgba(${c.r},${c.g},${c.b},${c.a});`;
                                }

                                newEle.id = id;
                                newEle.className = 'room-prohibited';
                                newEle.setAttribute("style", css);
                                canvaElement.after(newEle);
                            }
                        }
                    }
                }
            }
        } else if (worldMap.zoom == 1){

            var sectorMapping = {};

            for(var sectorName in worldMap.sectors){
                var sector = worldMap.sectors[sectorName];

                sectorMapping[sector.firstRoomName] = sector;
            }

            var sectorElements = $(".map-sector.map-sector--zoom1.ng-scope");

            for(var sectorId in sectorElements){
                var sectorEle = sectorElements[sectorId];

                if (!sectorEle.style || !sectorEle.style.backgroundImage){
                    continue;
                }

                var firstRoomName = sectorEle.style.backgroundImage.match(/zoom1\/(.*)\.png/).pop();

                var $sectorEle = $(sectorEle);
                var sector = sectorMapping[firstRoomName];
                if (sector){
                    $sectorEle.find(`div:not([id^=alliance-1-${firstRoomName}])`).remove();

                    var correctRooms = $sectorEle.find(`div[id^=alliance-1-${firstRoomName}]`);

                    if (correctRooms.length == 0 && sector.rooms){
                        var x = 0;
                        var y = 0;
                        var rooms = sector.rooms.split(',');

                        for(var i = 0; i < rooms.length; i++){
                            
                            var roomName = rooms[i];

                            if (i % 10 == 0 && i != 0){
                                y = 1;
                                x += 1;
                            }else{
                                y += 1;
                            }

                            if (!worldMap.roomStats[roomName] || !worldMap.roomStats[roomName].own){
                                continue;
                            }

                            var username = worldMap.roomUsers[worldMap.roomStats[roomName].own.user].username;
                            var allianceName = module.exports.userToAlliance[username];

                            if (module.exports.userToAlliance[username] && module.exports.alliances[allianceName]){
                                var id = "alliance-1-" + sector.firstRoomName + "-" + roomName;

                                if (!document.getElementById(id)){
                                    var left = (x + 1) * 20 - 20;
                                    var top = (y - 1) * 20;
                                    var newEle = document.createElement("div");
                                    var css = `z-index: 1;
                                        height: 20px;
                                        width: 20px;
                                        position: absolute;
                                        left: ${left}px;
                                        top: ${top}px;`;

                                    if (module.config && module.config.background === "Image"){
                                        var url = "http://www.leagueofautomatednations.com/obj/" + module.exports.alliances[allianceName].logo;

                                        css += `background-image: url("${url}");
                                            background-size: 20px 20px;
                                            opacity : 0.2;`;
                                    }else{
                                        var c = module.exports.hexToRgb(module.exports.alliances[allianceName].color);
                                        c.a = 0.3;

                                        css += `background: rgba(${c.r},${c.g},${c.b},${c.a});`;
                                    }

                                    newEle.id = id;
                                    newEle.className = 'room-prohibited';
                                    newEle.setAttribute("style", css);
                                    $sectorEle.append(newEle);
                                }
                            }
                        }
                    }

                }
            }
        }
        else{
            $("div[id^=alliance-]").remove();
        }

    });
}

module.exports.hexToRgb = function (hex) {
    if (!hex){
        return {
            r: 255,
            g: 255,
            b: 255,
        }
    }

    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}