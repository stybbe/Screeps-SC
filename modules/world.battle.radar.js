module.exports.init = function(){
    module.dispatchEvent({event: 'xhttp', url:'http://www.leagueofautomatednations.com/map/shard0/rooms.js'}, function(response0){
        module.dispatchEvent({event: 'xhttp', url:'http://www.leagueofautomatednations.com/map/shard1/rooms.js'}, function(response1){

            module.exports.shards = {}
            module.exports.shards["shard0"] = { rooms: JSON.parse(response0.data) };
            module.exports.shards["shard1"] = { rooms: JSON.parse(response1.data) };

            module.dispatchEvent({event: 'xhttp', url:'http://www.leagueofautomatednations.com/alliances.js'}, function(response){
                module.alliances = JSON.parse(response.data);

                module.userToAlliance = {}

                for(var alliance in module.alliances){
                    var members = module.alliances[alliance].members;
                    for(var member in members){
                        var memberName = members[member];

                        module.userToAlliance[memberName] = alliance;
                    }
                }

                module.getScopeData("md-sidenav-left", "Top", [], function(Top){
                    var radarSvg = module.exports.getRadarSvg();
                    var sideBar = $(`<a class="md-button md-ink-ripple">
                                        <span style="margin: 0 10px 0 3px;opacity: 0.4;top:2px;position:relative;">
                                            ${radarSvg}
                                        </span>
                                        <span style="bottom: 5px;position: relative;">
                                            Battle Radar
                                        </span>
                                    </a>`)

                    sideBar.click(function(){
                        Top.toggleMainNav();
                        module.exports.openModal();
                    });

                    var leftBar = $(".md-sidenav-left a").eq(3).after(sideBar);
                });
            });

        });

    });
}

module.exports.update = function(){
    // not needed as we dont switch url in battle radar popup.
}

module.exports.openModal = function(){
    var svgNuke = module.exports.getNukeSvg();
    var svgPvp = module.exports.getPvpSvg();

    $(`<div id="sc-modal-battle" class="fade modal in" modal-window="" index="0" style="display: block; z-index: 1049;" tabindex="-1">
        <div class="modal-dialog" style="width:900px">
            <div class="modal-content" modal-window-content="">
                <section class="dlg-flag">
                    <div class="modal-body">

                        <div class="panel battle-radar" style="background-color:inherit">
                            <button class="md-button md-ink-ripple" type="button" style="position: absolute;right: 20px;">
                                <div class="fa fa-refresh ng-scope"></div>
                                <span>Refresh</span>
                            <div class="md-ripple-container"></div></button>

                            ${svgNuke}

                            ${svgPvp}

                            <div class="panel-heading">
                               <ul class="nav nav-tabs">
                                <li class="active"><a href="javascript:void(0)" >Active Nukes</a></li>
                                <li><a href="javascript:void(0)">Current PvP</a></li>
                              </ul>     
                            </div>
                            <div class="panel-body" style="overflow:scroll; height:500px;">
                              <div class="tab-content">
                                <div class="tab-pane active">

                                    <div>
                                        <table class="orders-table__table">
                                            <tbody id="sc-tbody-battle-radar">
                                                <tr>
                                                    <th>Nuke</th>
                                                    <th class="orders-table__col--left">Defender</th>
                                                    <th class="orders-table__col--left">Alliance</th>
                                                    <th class="orders-table__col--left">Defending room</th>
                                                    <th>Attacker</th>
                                                    <th>Alliance</th>
                                                    <th>Launch room</th>
                                                    <th>Landing in</th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                                <div class="tab-pane">

                                    <div>
                                        <table class="orders-table__table">
                                            <tbody id="sc-tbody-battle-radar-pvp">
                                                <tr>
                                                    <th>PvP</th>
                                                    <th class="orders-table__col--left">Defender</th>
                                                    <th class="orders-table__col--left">Alliance</th>
                                                    <th class="orders-table__col--left">Defending room</th>
                                                    <th>Attacker</th>
                                                    <th>Alliance</th>
                                                    <th>Shard</th>
                                                    <th>Time</th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                              </div>
                            </div>
                        </div>

                    </div>
                    <div class="modal-footer">
                        <button id="sc-modal-battle-cancel" class="md-button md-ink-ripple" type="button"><span>Cancel</span></button>
                        <button id="sc-modal-battle-ok" class="md-raised md-primary md-button md-ink-ripple" type="submit"><span>OK</span></button>
                    </div>
                </section>
            </div>
        </div>
    </div>`).appendTo('body');

    $('<div id="sc-modal-background" class="modal-backdrop fade in" style="z-index: 1040;"></div>').appendTo('body');

    $('#sc-modal-battle-cancel').click(function() { 
        module.exports.closeModal();
    });

    $('#sc-modal-dismiss').click(function() { 
        module.exports.closeModal();
    });

    module.ajaxGet("https://screeps.com/api/game/time?shard=" + module.getCurrentShard(), function(data){
        module.exports.displayNukeTab(data.time, module.getCurrentShard());
        module.exports.displayPvPTab(data.time, module.getCurrentShard());
    });

    $('#sc-modal-battle-ok').click(function() { 
        module.exports.closeModal();
    });

    $("<style>")
    .prop("type", "text/css")
    .html(`
    .battle-radar{
        margin-bottom: 0;
    }
    .battle-radar div .nav {
        border-bottom: 0;
    }
    .battle-radar div .nav > li > a{
        border-radius: 0;
        padding: 5px 15px;
        background-color:inherit;
        font-weight: bold;
        color: #aaa !important;
        border: 1px solid transparent;
        text-decoration: none;
    }
    .battle-radar div .nav > li.active > a {
        background-color:#999;
        color: #222 !important;
    }
    .battle-radar div .nav > li:not(.active) > a:hover, .nav > li > a:focus {
        text-decoration: none;
        background-color: #555;
        border: 1px solid transparent;
    }
    .battle-radar div .nav > li.active > a, .nav-tabs > li.active > a:hover, .nav-tabs > li.active > a:focus{
        border: 1px solid transparent;
    }
    .battle-radar .panel-heading{
        padding: 0;
    }
    .battle-radar .panel-body{
        background-color:#2b2b2b
    }
    img.sc-battle-round{
        width: 16px;
        height: 16px;
        margin-right: 5px;
        border-radius: 100%;
        box-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);
    }
    a{
        cursor: pointer;
    }
    `)
    .appendTo("head");

    $('.panel .nav-tabs').on('click', 'a', function(e){
      var tab  = $(this).parent(),
          tabIndex = tab.index(),
          tabPanel = $(this).closest('.panel'),
          tabPane = tabPanel.find('.tab-pane').eq(tabIndex);

      if (tab.hasClass("active") == false){
          var prevActive = tabPanel.find('.active');
          prevActive.removeClass('active');
          tab.addClass('active');
          tabPane.addClass('active');
      }


      
    });
}

module.exports.getAllianceHtml = function(playerName){
    var alliance = module.userToAlliance[playerName];
    var allianceHtml = "";

    if (alliance){
        var logo = module.alliances[alliance].logo;
        if (logo){
            var logoURL = "http://www.leagueofautomatednations.com/obj/" + module.alliances[alliance].logo;
            allianceHtml = `<a href='http://www.leagueofautomatednations.com/a/${alliance}'>
                    <img class="sc-battle-round" src='${logoURL}' height='16' width='16'>${alliance}</a>`;
         }else{
            allianceHtml = `<a href='http://www.leagueofautomatednations.com/a/${alliance}'>${alliance}</a>`;
         }
    }

    return allianceHtml;
}

module.exports.displayNukeTab = function(gameTime, shard){
    module.ajaxGet("https://screeps.com/api/experimental/nukes", function(data){
        if (data.error){
            $('#sc-tbody-battle-radar').append(`<div style='position: absolute;right: 50%;font-size: 16px;padding-top: 10px;''>${data.error}</div>`);
        }
        else if (!shard){
            $('#sc-tbody-battle-radar-pvp').append(`<div style='position: absolute;right: 50%;font-size: 16px;padding-top: 10px;''>Failed to read shard.</div>`);
        }
        else if (data.nukes[shard].length === 0){
            $('#sc-tbody-battle-radar').append("<div style='position: absolute;right: 50%;font-size: 16px;padding-top: 10px;''> The world is at peace.</div>");
        }else{
            data.nukes[shard].forEach(function(nukeInfo){

                var defenderName = "Unknown";
                var attackerName = "Unknown";

                var defenderRoom = module.exports.shards[shard].rooms[nukeInfo.room];
                var attackerRoom = module.exports.shards[shard].rooms[nukeInfo.launchRoomName];

                if (defenderRoom && defenderRoom.owner){
                    defenderName = defenderRoom.owner;
                }

                if (attackerRoom && attackerRoom.owner){
                    attackerName = attackerRoom.owner;
                }

                module.exports.getBadge(defenderName, 16, 16, function(badgeDefender){
                    module.exports.getBadge(attackerName, 16, 16, function(badgeAttacker){


                        var defenderAllianceHtml = module.exports.getAllianceHtml(defenderName);
                        var attackerAllianceHtml = module.exports.getAllianceHtml(attackerName);
                        var timeLeft = nukeInfo.landTime - gameTime;

                        var row = $(`<tr>
                                <td>
                                    <svg class="nuke-target" height="32px" viewBox="0 0 900 900" width="32px" preserveaspectratio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
                                        <use xlink:href="#sc-svg-nuke">
                                    </svg>
                                </td>
                                <td class="orders-table__col--left">
                                    <a href='https://screeps.com/a/#!/profile/${defenderName}'>${defenderName}</a>
                                </td>
                                <td class="orders-table__col--left">
                                    ${defenderAllianceHtml}
                                </td>
                                <td class="orders-table__col--left">
                                    <a href='https://screeps.com/a/#!/room/${shard}/${nukeInfo.room}'>${nukeInfo.room}</a>
                                </td>
                                <td>
                                    <a href='https://screeps.com/a/#!/profile/${attackerName}'>${attackerName}</a>
                                </td>
                                <td>
                                    ${attackerAllianceHtml} 
                                </td>
                                <td>
                                    <a href='https://screeps.com/a/#!/room/${shard}/${nukeInfo.launchRoomName}'>${nukeInfo.launchRoomName}</a>
                                </td>
                                <td>
                                    ${timeLeft} ticks
                                </td>
                            </tr>`);

                        row.find("td:eq(1) a:eq(0)").prepend(badgeDefender);
                        row.find("td:eq(4) a:eq(0)").prepend(badgeAttacker);
                        row.find("a").click(function() {
                            module.exports.closeModal();
                        });

                        $('#sc-tbody-battle-radar').append(row);
                    });
                });

            });
        }
    });
}

module.exports.displayPvPTab = function(gameTime, shard){
    module.ajaxGet("https://screeps.com/api/experimental/pvp?interval=100", function(data){
        if (data.error === 0){
            $('#sc-tbody-battle-radar-pvp').append(`<div style='position: absolute;right: 50%;font-size: 16px;padding-top: 10px;''>${data.error}</div>`);
        }
        else if (!shard){
            $('#sc-tbody-battle-radar-pvp').append(`<div style='position: absolute;right: 50%;font-size: 16px;padding-top: 10px;''>Failed to read shard.</div>`);
        }
        else if (data.pvp[shard].rooms.length === 0){
            $('#sc-tbody-battle-radar-pvp').append("<div style='position: absolute;right: 50%;font-size: 16px;padding-top: 10px;''> The world is at peace.</div>");
        }else{
            data.pvp[shard].rooms.forEach(function(roomInfo){
                var defenderName = "Unknown";
                var attackerName = "Unknown";

                var defenderRoom = module.exports.shards[shard].rooms[roomInfo._id];

                if (defenderRoom && defenderRoom.owner){
                    defenderName = defenderRoom.owner;
                }

                // TODO implement attacker without using history.

                module.exports.getBadge(defenderName, 16, 16, function(badgeDefender){
                    var defenderAllianceHtml = module.exports.getAllianceHtml(defenderName);
                    var timeAgo = gameTime - roomInfo.lastPvpTime;

                    var row = $(`<tr>
                            <td>
                                <svg class="nuke-pvp" height="16px" viewBox="0 0 900 900" width="16px" preserveaspectratio="xMidYMid" xmlns="http://www.w3.org/2000/svg">
                                    <use xlink:href="#sc-svg-pvp">
                                </svg>
                            </td>
                            <td class="orders-table__col--left">
                                <a href='https://screeps.com/a/#!/profile/${defenderName}'>${defenderName}</a>
                            </td>
                            <td class="orders-table__col--left">
                                ${defenderAllianceHtml}
                            </td>
                            <td class="orders-table__col--left">
                                <a href='https://screeps.com/a/#!/room/${shard}/${roomInfo._id}'>${roomInfo._id}</a>
                            </td>
                            <td>

                            </td>
                            <td>

                            </td>
                            <td>
                                ${shard}
                            </td>
                            <td>
                                ${timeAgo} ticks ago.
                            </td>
                        </tr>`);

                    row.find("td:eq(1) a:eq(0)").prepend(badgeDefender);
                    row.find("a").click(function() {
                        module.exports.closeModal();
                    });

                    $('#sc-tbody-battle-radar-pvp').append(row);
                });
            });

        }
    });
}

module.exports.getLatestHistory = function(room, startTime, cb, limit = 100){
    // TODO find a better way to get defender and attacker.

    // https://screeps.com/room-history/E62N22/15911540.json
    // ticks[tick_id].type == 'controller'
    // ticks[tick_id].type == 'creep'
    // ticks[tick_id].user == '<GUID>'

    if (limit <= 0){
        console.warn("failed to get history for room: " + room);
        cb(undefined);
    }else{
        module.ajaxGet(`https://screeps.com/room-history/${room}/${startTime}.json`, function(data, status){
            if (data){
                console.log("success: " + room + " after " + (100 - limit) + " tries");
                cb(data);
            }else{
                module.exports.getLatestHistory(room, startTime - 1, cb, limit - 1);
            }
            
        });
    }
}

module.exports.closeModal = function(){
    $('#sc-modal-battle').remove(); 
    $('#sc-modal-background').remove(); 
}

module.exports.getPvpSvg = function(){
    return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
                <symbol id="sc-svg-pvp" viewBox="25 25 50 50" width="24px" height="24px" fill="#999">
                    <path d="M51.31,
                             39.603l8.037,
                             8.676l13.648-12.646l0.43-9.773l-9.777,
                             0.428L51.31,
                             39.603z M40.817,
                             50.927l-5.195,
                             5.607l-3.998-4  l-2.477,
                             2.477l5.562,
                             5.566l-8.064,
                             8.066l3.992,
                             3.994l8.066-8.066l5.568,
                             5.561l2.475-2.48l-3.998-3.992l5.902-5.469L40.817,
                             50.927z   M70.925,
                             55.015l-2.486-2.475l-3.994,
                             4.002L36.417,
                             26.286l-9.775-0.422l0.432,
                             9.773l30.246,
                             28.025l-3.998,
                             4l2.473,
                             2.475l5.568-5.564  l8.064,
                             8.07l3.998-4.002l-8.064-8.062L70.925,
                             55.015z">
                    </path>
                </symbol>
            </svg>`
}

module.exports.getRadarSvg = function(){
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48" version="1.1" x="0px" y="0px" width="24px" height="24px">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-768.000000, -1248.000000)" fill="#FFF">
            <g transform="translate(96.000000, 1055.000000)">
                <g transform="translate(672.000000, 193.000000)">
                    <path d="M27.8684894,22.9627133 C28.2248599,24.2971804 27.8795864,25.7800434 26.8326691,26.8269608 C25.2705719,28.3890579 22.737912,28.3890579 21.1758148,26.8269608 C19.6137177,
                    25.2648636 19.6137177,22.7322037 21.1758148,21.1701065 C22.2227322,20.1231892 23.7055951,19.7779157 25.0400623,20.1342861 L28.068667,17.1056815 C25.0008559,15.2938131 20.9832547,
                    15.7058124 18.3473877,18.3416794 C15.2231934,21.4658737 15.2231934,26.5311936 18.3473877,29.6553879 C21.471582,32.7795822 26.5369019,32.7795822 29.6610962,29.6553879 C30.8801589,
                    28.4363252 31.6524465,26.8941592 31.9098531,25.2282637 C32.0785245,24.1366485 33.1001886,23.3884548 34.1918038,23.5571262 C35.283419,23.7257976 36.0316128,24.7474617 35.8629414,
                    25.8390769 C35.4768247,28.3379642 34.3146498,30.6586885 32.4895233,32.483815 C27.8032318,37.1701065 20.2052521,37.1701065 15.5189606,32.483815 C10.8326691,27.7975235 10.8326691,
                    20.1995438 15.5189606,15.5132523 C19.7234122,11.3088006 26.27158,10.8765031 30.9579888,14.2163597 L33.8162059,11.3581426 C27.5393468,6.473147 18.4599841,
                    6.91537453 12.6905335,12.6848251 C6.44214478,18.9332138 6.44214478,29.0638535 12.6905335,35.3122421 C18.9389221,41.5606308 29.0695618,41.5606308 35.3179504,
                    35.3122421 C36.3518663,34.2783263 37.2276871,33.1258466 37.9336533,31.8799895 C38.4782086,30.9189831 39.6987075,30.5813828 40.6597139,
                    31.125938 C41.6207203,31.6704933 41.9583207,32.8909922 41.4137654,33.8519986 C40.5305576,35.4106437 39.4357119,36.8513349 38.1463776,
                    38.1406693 C30.3358917,45.9511551 17.6725922,45.9511551 9.86210633,38.1406693 C2.05162049,30.3301834 2.05162049,17.6668838 9.86210633,
                    9.85639801 C17.1952959,2.5232084 28.8063139,2.0750796 36.6623369,8.51201159 L36.7384184,8.43593009 C37.5160128,7.6583357 38.7740972,
                    7.65569054 39.5605911,8.44218445 C40.3416397,9.22323304 40.3457102,10.4854925 39.5668455,11.2643572 L27.8684894,22.9627133 L27.8684894,
                    22.9627133 Z M43.1203005,26.1435196 C44.2918734,24.9719467 44.2918734,23.0724518 43.1203005,21.9008789 C41.9487276,20.729306 40.0492327,20.729306 38.8776598,21.9008789 C37.7060869,
                    23.0724518 37.7060869,24.9719467 38.8776598,26.1435196 C40.0492327,27.3150925 41.9487276,27.3150925 43.1203005,26.1435196 Z">
                    </path>
                </g>
            </g>
        </g>
    </g>
    </svg>`;
}

module.exports.getNukeSvg = function(){
    return `
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="sc-svg-nuke" height="32px" viewBox="0 0 900 900" width="32px">
    <g transform="translate(450,450)" opacity="1">
    <g transform="scale(1.25521 1.25521)">
    <ellipse cx="0" cy="0" fill-opacity="0.2" fill="#f44" rx="80" ry="80">
    <animate app-attr="calcMode#GenericObject.displayOptions.animations ? 'linear' : 'discrete'" attributeName="fill-opacity" attributeType="XML" dur="2s" repeatCount="indefinite" values="0.2;0.7;0.2" calcMode="linear"></animate>
    </ellipse>
    <ellipse cx="0" cy="0" fill-opacity="0.7" fill="#f44" rx="20" ry="20"></ellipse>
    <path d="M 0 -100 V -50 M 0 100 V 50 M 100 0 H 50 M -100 0 H -50 Z" stroke-opacity="0.7" stroke-width="20" stroke="#f44"></path>
    <animateTransform app-attr="calcMode#GenericObject.displayOptions.animations ? 'linear' : 'discrete'" attributeName="transform" attributeType="XML" dur="2s" repeatCount="indefinite" type="scale" values="1.3 1.3;0.8 0.8;1.3 1.3" calcMode="linear"></animateTransform>
    </g>
    <ellipse cx="0" cy="0" fill="#f44" stroke-width="20" stroke="#f44" rx="349.389" ry="349.389">
    <animate attributeName="stroke-opacity" attributeType="XML" repeatCount="indefinite" values="0;0.6" dur="7.31376s"></animate>
    <animate attributeName="fill-opacity" attributeType="XML" repeatCount="indefinite" values="0;0.3" dur="7.31376s"></animate>
    <animate attributeName="rx" attributeType="XML" repeatCount="indefinite" values="450;0" dur="7.31376s"></animate>
    <animate attributeName="ry" attributeType="XML" repeatCount="indefinite" values="450;0" dur="7.31376s"></animate>
    </ellipse>
    </g>
    </symbol>
</svg>`
}

module.exports.badges = {}

module.exports.getBadge = function(playerName, width, height, cb){
    if (module.exports.badges[playerName]){

        module.exports.getBadgeImage(module.exports.badges[playerName], width, height, function(image){
            cb(image);
        });
    }else{
        module.ajaxGet(`https://screeps.com/api/user/find?username=${playerName}`, function(result, err){
            if (err || !result){
                console.error(err);
                cb(null, err);
            }else{
                module.exports.badges[playerName] = result.user.badge;

                module.exports.getBadgeImage(result.user.badge, width, height, function(image){
                    cb(image);
                });
            }            
        });
    }
}

module.exports.getBadgeImage = function(badge, width, height, cb) {
    var svg = module.exports.getBadgeSvg(badge, width, height);

    var domURL = window.URL || window.webkitURL || window;
    // Todo reuse canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var image = new Image();
    var blob = new Blob([svg],{
                    type: "image/svg+xml"
                });

    // Todo find proper way to revoke recurring images using onload
    domURL.revokeObjectURL(url);
    var url = domURL.createObjectURL(blob);

    image.onload = function() {
        ctx.drawImage(this, 0, 0);
        cb(this);
    }

    image.src = url;
}

/* taken from @screeps build */
module.exports.getBadgeSvg = function(badge, width, height){
    var m = []
      , n = 0;
    m.push({
        index: n++,
        rgb: "#" + module.exports.dataToRgb(0, 0, .8)
    });
    for (var o = 0; 19 > o; o++){
        m.push({
            index: n++,
            rgb: "#" + module.exports.dataToRgb(360 * o / 19, .6, .8)
        });
    }
    m.push({
        index: n++,
        rgb: "#" + module.exports.dataToRgb(0, 0, .5)
    });
    for (var o = 0; 19 > o; o++){
        m.push({
            index: n++,
            rgb: "#" + module.exports.dataToRgb(360 * o / 19, .7, .5)
        });
    }
    m.push({
        index: n++,
        rgb: "#" + module.exports.dataToRgb(0, 0, .3)
    });
    for (var o = 0; 19 > o; o++){
        m.push({
            index: n++,
            rgb: "#" + module.exports.dataToRgb(360 * o / 19, .4, .3)
        });
    }
    m.push({
        index: n++,
        rgb: "#" + module.exports.dataToRgb(0, 0, .1)
    });
    for (var o = 0; 19 > o; o++){
        m.push({
            index: n++,
            rgb: "#" + module.exports.dataToRgb(360 * o / 19, .5, .1)
        });
    }

    var canvas = document.createElement("canvas");
    var color1 = _.isString(badge.color1) ? badge.color1 : m[badge.color1].rgb;
    var color2 = _.isString(badge.color2) ? badge.color2 : m[badge.color2].rgb;
    var color3 = _.isString(badge.color3) ? badge.color3 : m[badge.color3].rgb;

    var paths = module.exports.getBadgePaths();

    width = Math.round(width);
    height = Math.round(height);

    if (badge.param > 100){
        badge.param = 100
    }else if (badge.param < -100){
        badge.param = -100
    }

    canvas.width = width
    canvas.height = height

    if (_.isNumber(badge.type)){
        paths[badge.type].calc(badge.param);
    }

    var rotate = 0;
    if (badge.flip){
        if ("rotate180" == paths[badge.type].flip){
            rotate = 180
        }else if ("rotate90" == paths[badge.type].flip){
            rotate = 90
        }else if ("rotate45" == paths[badge.type].flip){
            rotate = 45
        }
    }

    var svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" shape-rendering="geometricPrecision">
                        <defs>
                            <clipPath id="clip">
                                <circle cx="50" cy="50" r="52" />
                                <!--<rect x="0" y="0" width="100" height="100"/>-->
                            </clipPath>
                        </defs>
                    <g transform="rotate(${rotate} 50 50)">
                    <rect x="0" y="0" width="100" height="100" fill="${color1}" clip-path="url(#clip)"/>`;
    
    var path1;
    var path2;

    if (_.isNumber(badge.type)){
        path1 = paths[badge.type].path1;
        path2 = paths[badge.type].path2;
    }else{
        path1 = badge.type.path1;
        path2 = badge.type.path2;
    }

    if (path1){
        svgHtml += '<path d="' + path1 + '" fill="' + color2 + '" clip-path="url(#clip)"/>'
    }
    
    if (path2){
        svgHtml += '<path d="' + path2 + '" fill="' + color3 + '" clip-path="url(#clip)"/>'
    }

    svgHtml += "</g></svg>";

    return svgHtml;
    
}

/* taken from @screeps build */
module.exports.dataToRgb = function b(a, b, c) {
    function d(a) {
        var b = Number(a).toString(16);
        return b.length < 2 && (b = "0" + b),
        b
    }
    var e, f, g, h = (1 - Math.abs(2 * c - 1)) * b, i = a / 60, j = h * (1 - Math.abs(i % 2 - 1));
    void 0 === a || isNaN(a) || null === a ? e = f = g = 0 : i >= 0 && 1 > i ? (e = h,
    f = j,
    g = 0) : i >= 1 && 2 > i ? (e = j,
    f = h,
    g = 0) : i >= 2 && 3 > i ? (e = 0,
    f = h,
    g = j) : i >= 3 && 4 > i ? (e = 0,
    f = j,
    g = h) : i >= 4 && 5 > i ? (e = j,
    f = 0,
    g = h) : i >= 5 && 6 > i && (e = h,
    f = 0,
    g = j);
    var k, l, m, n = c - h / 2;
    return k = 255 * (e + n),
    l = 255 * (f + n),
    m = 255 * (g + n),
    k = Math.round(k),
    l = Math.round(l),
    m = Math.round(m),
    d(k) + d(l) + d(m)
}

/* taken from @screeps build */
module.exports.getBadgePaths = function(){
return {
        1: {
            calc: function(a) {
                var b = 0
                  , c = 0;
                a > 0 && (b = 30 * a / 100),
                0 > a && (c = 30 * -a / 100),
                this.path1 = "M 50 " + (100 - b) + " L " + c + " 50 H " + (100 - c) + " Z",
                this.path2 = "M " + c + " 50 H " + (100 - c) + " L 50 " + b + " Z"
            }
        },
        2: {
            calc: function(a) {
                var b = 0
                  , c = 0;
                a > 0 && (b = 30 * a / 100),
                0 > a && (c = 30 * -a / 100),
                this.path1 = "M " + b + " " + c + " L 50 50 L " + (100 - b) + " " + c + " V -1 H -1 Z",
                this.path2 = "M " + b + " " + (100 - c) + " L 50 50 L " + (100 - b) + " " + (100 - c) + " V 101 H -1 Z"
            }
        },
        3: {
            calc: function(a) {
                var b = Math.PI / 4 + Math.PI / 4 * (a + 100) / 200
                  , c = -Math.PI / 2
                  , d = Math.PI / 2 + Math.PI / 3
                  , e = Math.PI / 2 - Math.PI / 3;
                this.path1 = "M 50 50 L " + (50 + 100 * Math.cos(c - b / 2)) + " " + (50 + 100 * Math.sin(c - b / 2)) + " L " + (50 + 100 * Math.cos(c + b / 2)) + " " + (50 + 100 * Math.sin(c + b / 2)) + " Z",
                this.path2 = "M 50 50 L " + (50 + 100 * Math.cos(d - b / 2)) + " " + (50 + 100 * Math.sin(d - b / 2)) + " L " + (50 + 100 * Math.cos(d + b / 2)) + " " + (50 + 100 * Math.sin(d + b / 2)) + " Z\n                          M 50 50 L " + (50 + 100 * Math.cos(e - b / 2)) + " " + (50 + 100 * Math.sin(e - b / 2)) + " L " + (50 + 100 * Math.cos(e + b / 2)) + " " + (50 + 100 * Math.sin(e + b / 2))
            },
            flip: "rotate180"
        },
        4: {
            calc: function(a) {
                a += 100;
                var b = 50 - 30 * a / 200
                  , c = 50 + 30 * a / 200;
                this.path1 = "M 0 " + c + " H 100 V 100 H 0 Z",
                this.path2 = a > 0 ? "M 0 " + b + " H 100 V " + c + " H 0 Z" : ""
            },
            flip: "rotate90"
        },
        5: {
            calc: function(a) {
                a += 100;
                var b = 50 - 10 * a / 200 - 10
                  , c = 50 + 10 * a / 200 + 10;
                this.path1 = "M " + b + " 0 H " + c + " V 100 H " + b + " Z",
                this.path2 = "M 0 " + b + " H 100 V " + c + " H 0 Z"
            },
            flip: "rotate45"
        },
        6: {
            calc: function(a) {
                var b = 5 + 8 * (a + 100) / 200
                  , c = 50
                  , d = 20
                  , e = 80;
                this.path1 = "M " + (c - b) + " 0 H " + (c + b) + " V 100 H " + (c - b),
                this.path2 = "M " + (d - b) + " 0 H " + (d + b) + " V 100 H " + (d - b) + " Z\n                          M " + (e - b) + " 0 H " + (e + b) + " V 100 H " + (e - b) + " Z"
            },
            flip: "rotate90"
        },
        7: {
            calc: function(a) {
                var b = 20 + 10 * a / 100;
                this.path1 = "M 0 50 Q 25 30 50 50 T 100 50 V 100 H 0 Z",
                this.path2 = "M 0 " + (50 - b) + " Q 25 " + (30 - b) + " 50 " + (50 - b) + " T 100 " + (50 - b) + "\n                            V " + (50 + b) + " Q 75 " + (70 + b) + " 50 " + (50 + b) + " T 0 " + (50 + b) + " Z"
            },
            flip: "rotate90"
        },
        8: {
            calc: function(a) {
                var b = 20 * a / 100;
                this.path1 = "M 0 50 H 100 V 100 H 0 Z",
                this.path2 = "M 0 50 Q 50 " + b + " 100 50 Q 50 " + (100 - b) + " 0 50 Z"
            },
            flip: "rotate90"
        },
        9: {
            calc: function(a) {
                var b = 0
                  , c = 50
                  , d = 70;
                a > 0 && (b += a / 100 * 20),
                0 > a && (c += a / 100 * 30),
                this.path1 = "M 50 " + b + " L 100 " + (b + d) + " V 101 H 0 V " + (b + d) + " Z",
                this.path2 = "M 50 " + (b + c) + " L 100 " + (b + c + d) + " V 101 H 0 V " + (b + c + d) + " Z"
            },
            flip: "rotate180"
        },
        10: {
            calc: function(a) {
                var b = 30
                  , c = 7;
                a > 0 && (b += 50 * a / 100),
                0 > a && (c -= 20 * a / 100),
                this.path1 = "M " + (50 + c + b) + " " + (50 - b) + " A " + b + " " + b + " 0 0 0 " + (50 + c + b) + " " + (50 + b) + " H 101 V " + (50 - b) + " Z",
                this.path2 = "M " + (50 - c - b) + " " + (50 - b) + " A " + b + " " + b + " 0 0 1 " + (50 - c - b) + " " + (50 + b) + " H -1 V " + (50 - b) + " Z"
            },
            flip: "rotate90"
        },
        11: {
            calc: function(a) {
                var b = 30
                  , c = 30
                  , d = 50 - 50 * Math.cos(Math.PI / 4)
                  , e = 50 - 50 * Math.sin(Math.PI / 4);
                a > 0 && (b += 25 * a / 100,
                c += 25 * a / 100),
                0 > a && (c -= 50 * a / 100),
                this.path1 = "M " + d + " " + e + " Q " + b + " 50 " + d + " " + (100 - e) + " H 0 V " + e + " Z\n                          M " + (100 - d) + " " + e + " Q " + (100 - b) + " 50 " + (100 - d) + " " + (100 - e) + " H 100 V " + e + " Z",
                this.path2 = "M " + d + " " + e + " Q 50 " + c + " " + (100 - d) + " " + e + " V 0 H " + d + " Z\n                          M " + d + " " + (100 - e) + " Q 50 " + (100 - c) + " " + (100 - d) + " " + (100 - e) + " V 100 H " + d + " Z"
            },
            flip: "rotate90"
        },
        12: {
            calc: function(a) {
                var b = 30
                  , c = 35;
                a > 0 && (b += 30 * a / 100),
                0 > a && (c += 15 * a / 100),
                this.path1 = "M 0 " + b + " H 100 V 100 H 0 Z",
                this.path2 = "M 0 " + b + " H " + c + " V 100 H 0 Z\n                          M 100 " + b + " H " + (100 - c) + " V 100 H 100 Z"
            },
            flip: "rotate180"
        },
        13: {
            calc: function(a) {
                var b = 30
                  , c = 0;
                a > 0 && (b += 50 * a / 100),
                0 > a && (c -= 20 * a / 100),
                this.path1 = "M 0 0 H 50 V 100 H 0 Z",
                this.path2 = "M " + (50 - b) + " " + (50 - c - b) + " A " + b + " " + b + " 0 0 0 " + (50 + b) + " " + (50 - b - c) + " V 0 H " + (50 - b) + " Z"
            },
            flip: "rotate180"
        },
        14: {
            calc: function(a) {
                var b = Math.PI / 4
                  , c = 0;
                b += a * Math.PI / 4 / 100,
                this.path1 = "M 50 0 Q 50 " + (50 + c) + " " + (50 + 50 * Math.cos(b)) + " " + (50 + 50 * Math.sin(b)) + " H 100 V 0 H 50 Z",
                this.path2 = "M 50 0 Q 50 " + (50 + c) + " " + (50 - 50 * Math.cos(b)) + " " + (50 + 50 * Math.sin(b)) + " H 0 V 0 H 50 Z"
            },
            flip: "rotate180"
        },
        15: {
            calc: function(a) {
                var b = 13 + 6 * a / 100
                  , c = 80
                  , d = 45
                  , e = 10;
                this.path1 = "M " + (50 - c - b) + " " + (100 + e) + " A " + (c + b) + " " + (c + b) + " 0 0 1 " + (50 + c + b) + " " + (100 + e) + "\n                                   H " + (50 + c - b) + " A " + (c - b) + " " + (c - b) + " 0 1 0 " + (50 - c + b) + " " + (100 + e),
                this.path2 = "M " + (50 - d - b) + " " + (100 + e) + " A " + (d + b) + " " + (d + b) + " 0 0 1 " + (50 + d + b) + " " + (100 + e) + "\n                                   H " + (50 + d - b) + " A " + (d - b) + " " + (d - b) + " 0 1 0 " + (50 - d + b) + " " + (100 + e)
            },
            flip: "rotate180"
        },
        16: {
            calc: function(a) {
                var b = 30 * Math.PI / 180
                  , c = 25;
                a > 0 && (b += 30 * Math.PI / 180 * a / 100),
                0 > a && (c += 25 * a / 100),
                this.path1 = "";
                for (var d = 0; 3 > d; d++) {
                    var e = d * Math.PI * 2 / 3 + b / 2 - Math.PI / 2
                      , f = d * Math.PI * 2 / 3 - b / 2 - Math.PI / 2;
                    this.path1 += "M " + (50 + 100 * Math.cos(e)) + " " + (50 + 100 * Math.sin(e)) + "\n                               L " + (50 + 100 * Math.cos(f)) + " " + (50 + 100 * Math.sin(f)) + "\n                               L " + (50 + c * Math.cos(f)) + " " + (50 + c * Math.sin(f)) + "\n                               A " + c + " " + c + " 0 0 1 " + (50 + c * Math.cos(e)) + " " + (50 + c * Math.sin(e)) + " Z"
                }
                this.path2 = "";
                for (var d = 0; 3 > d; d++) {
                    var e = d * Math.PI * 2 / 3 + b / 2 + Math.PI / 2
                      , f = d * Math.PI * 2 / 3 - b / 2 + Math.PI / 2;
                    this.path2 += "M " + (50 + 100 * Math.cos(e)) + " " + (50 + 100 * Math.sin(e)) + "\n                               L " + (50 + 100 * Math.cos(f)) + " " + (50 + 100 * Math.sin(f)) + "\n                               L " + (50 + c * Math.cos(f)) + " " + (50 + c * Math.sin(f)) + "\n                               A " + c + " " + c + " 0 0 1 " + (50 + c * Math.cos(e)) + " " + (50 + c * Math.sin(e)) + " Z"
                }
            }
        },
        17: {
            calc: function(a) {
                var b = 35
                  , c = 45;
                a > 0 && (b += 20 * a / 100),
                0 > a && (c -= 30 * a / 100),
                this.path1 = "M 50 45 L " + (50 - b) + " " + (c + 45) + " H " + (50 + b) + " Z",
                this.path2 = "M 50 0 L " + (50 - b) + " " + c + " H " + (50 + b) + " Z"
            }
        },
        18: {
            calc: function(a) {
                var b = 90 * Math.PI / 180
                  , c = 10;
                a > 0 && (b -= 60 / 180 * Math.PI * a / 100),
                0 > a && (c -= 15 * a / 100),
                this.path1 = "",
                this.path2 = "";
                for (var d = 0; 3 > d; d++) {
                    var e = 2 * Math.PI / 3 * d + b / 2 - Math.PI / 2
                      , f = 2 * Math.PI / 3 * d - b / 2 - Math.PI / 2
                      , g = "M " + (50 + 100 * Math.cos(e)) + " " + (50 + 100 * Math.sin(e)) + "\n                            L " + (50 + 100 * Math.cos(f)) + " " + (50 + 100 * Math.sin(f)) + "\n                            L " + (50 + c * Math.cos((e + f) / 2)) + " " + (50 + c * Math.sin((e + f) / 2)) + " Z";
                    d ? this.path2 += g : this.path1 += g
                }
            },
            flip: "rotate180"
        },
        19: {
            calc: function(a) {
                var b = 20
                  , c = 60;
                c += 20 * a / 100,
                b += 20 * a / 100,
                this.path1 = "M 50 -10 L " + (50 - c) + " 100 H " + (50 + c) + " Z",
                this.path2 = "",
                b > 0 && (this.path2 = "M 50 0 L " + (50 - b) + " 100 H " + (50 + b) + " Z")
            },
            flip: "rotate180"
        },
        20: {
            calc: function(a) {
                var b = 10
                  , c = 20;
                a > 0 && (b += 20 * a / 100),
                0 > a && (c += 40 * a / 100),
                this.path1 = "M 0 " + (50 - c) + " H " + (50 - b) + " V 100 H 0 Z",
                this.path2 = "M " + (50 + b) + " 0 V " + (50 + c) + " H 100 V 0 Z"
            },
            flip: "rotate90"
        },
        21: {
            calc: function(a) {
                var b = 40
                  , c = 50;
                a > 0 && (b -= 20 * a / 100),
                0 > a && (c += 20 * a / 100),
                this.path1 = "M 50 " + c + " Q " + (50 + b) + " 0 50 0 T 50 " + c + " Z\n                          M 50 " + (100 - c) + " Q " + (50 + b) + " 100 50 100 T 50 " + (100 - c) + " Z",
                this.path2 = "M " + c + " 50 Q 0 " + (50 + b) + " 0 50 T " + c + " 50 Z\n                          M " + (100 - c) + " 50 Q 100 " + (50 + b) + " 100 50 T " + (100 - c) + " 50 Z"
            },
            flip: "rotate45"
        },
        22: {
            calc: function(a) {
                var b = 20;
                b += 10 * a / 100,
                this.path1 = "M " + (50 - b) + " " + (50 - b) + " H " + (50 + b) + " V " + (50 + b) + " H " + (50 - b) + " Z",
                this.path2 = "";
                for (var c = -4; 4 > c; c++)
                    for (var d = -4; 4 > d; d++) {
                        var e = (c + d) % 2;
                        this.path2 += "M " + (50 - b - 2 * b * c) + " " + (50 - b - 2 * b * (d + e)) + " h " + 2 * -b + " v " + 2 * b + " h " + 2 * b + " Z"
                    }
            },
            flip: "rotate45"
        },
        23: {
            calc: function(a) {
                var b = 17
                  , c = 25;
                a > 0 && (b += 35 * a / 100),
                0 > a && (c -= 23 * a / 100),
                this.path1 = "";
                for (var d = -4; 4 >= d; d++)
                    this.path1 += "M " + (50 - b * d * 2) + " " + (50 - c) + " l " + -b + " " + -c + " l " + -b + " " + c + " l " + b + " " + c + " Z";
                this.path2 = "";
                for (var d = -4; 4 >= d; d++)
                    this.path2 += "M " + (50 - b * d * 2) + " " + (50 + c) + " l " + -b + " " + -c + " l " + -b + " " + c + " l " + b + " " + c + " Z"
            },
            flip: "rotate90"
        },
        24: {
            calc: function(a) {
                var b = 50
                  , c = 45;
                a > 0 && (b += 60 * a / 100),
                0 > a && (c += 30 * a / 100),
                this.path1 = "M 0 " + c + " L 50 70 L 100 " + c + " V 100 H 0 Z",
                this.path2 = "M 50 0 L " + (50 + b) + " 100 H 100 V " + c + " L 50 70 L 0 " + c + " V 100 H " + (50 - b) + " Z"
            },
            flip: "rotate180"
        }
    }
}

