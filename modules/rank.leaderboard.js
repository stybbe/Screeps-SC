module.exports.init = function(){
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

        module.exports.update();
    });

    // We bind url-change to detect when scope data is updated. We do this by deleting an insufficient variable in the scope object.
    $(window).bind('hashchange', function() {

        var scope = angular.element(document.getElementsByClassName('leaderboard-list ng-scope')).scope();
        if (scope && scope.LeaderboardList && scope.LeaderboardList.pageSize){
            
            delete scope.LeaderboardList.pageSize;
        }
    });
}

module.exports.update = function(){
    module.getScopeData("leaderboard-list", "LeaderboardList", ['LeaderboardList.list', 'LeaderboardList.pageSize'], function(leaderBoard){
        var tableElement = document.getElementsByClassName("table table-striped");

        if($("#th-alliance").length == 0) {
            // Todo find a bettwer way to fix month swap
            delete leaderBoard.pageSize;

            $(".table.table-striped tbody tr th:nth-child(2)").after('<th id="th-alliance">Alliance</th>');

            for(var i = 2; i < leaderBoard.list.length + 2; i++){
                var playerColumn = $(".table.table-striped tbody tr:nth-child(" + i + ") td:nth-child(2)");
                var playerName = playerColumn[0].innerText.trim();
                var alliance = module.userToAlliance[playerName];
                var html = "";

                if (alliance){
                    var logo = module.alliances[alliance].logo;
                    if (logo){
                        var logoURL = "http://www.leagueofautomatednations.com/obj/" + module.alliances[alliance].logo;
                        html = `<td><a href='http://www.leagueofautomatednations.com/a/${alliance}'>
                                <img src='${logoURL}' height='16' width='16'>${alliance}</a></td>`;
                     }else{
                        html = `<td><a href='http://www.leagueofautomatednations.com/a/${alliance}'>${alliance}</a></td>`;
                     }

                }else{
                    html = "<td></td>";
                }

                playerColumn.after(html);
            }
        }



        $(".table.table-striped tbody tr th:last-child").css('text-align', 'right');
        $(".table.table-striped tbody tr td:last-child").css('text-align', 'right');

        if($("#th-gcl-h").length == 0) {
            $(".table.table-striped tbody tr th:last-child").after('<th id="th-gcl-h">Last hour</th>');

            
            for(var i = 0; i < leaderBoard.list.length; i++){
                var lastColumn = $(".table.table-striped tbody tr:nth-child(" + (i + 2) + ") td:last-child");
                
                var newColumn = $(`<td id='th-gcl-h-${i}'></td>`)
                lastColumn.after(newColumn);

                (function(column) {
                    module.ajaxGet(`https://screeps.com/api/user/stats?id=${leaderBoard.list[i].user}&interval=8`, function(result, err){
                        var html = "";

                        if (result){
                            var amount = 0;

                            if (window.location.href.includes("/power/")){
                                amount = Math.round(result.stats.powerProcessed) || 0;
                                column.text(`${amount}`);
                            }else{
                                amount = Math.round(result.stats.energyControl / 1000) || 0;
                                column.text(`${amount}K`);
                            }
                            
                            
                        }

                        
                    });
                })(newColumn);
            }
        }
        $(".table.table-striped tbody tr th:last-child").css('text-align', 'right');
        $(".table.table-striped tbody tr td:last-child").css('text-align', 'right');

        if($("#th-gcl").length == 0) {
            $(".table.table-striped tbody tr th:last-child").after('<th id="th-gcl">GCL</th>');

            
            for(var i = 0; i < leaderBoard.list.length; i++){
                var lastColumn = $(".table.table-striped tbody tr:nth-child(" + (i + 2) + ") td:last-child");
                var playerColumn = $(".table.table-striped tbody tr:nth-child(" + (i + 2) + ") td:nth-child(2)");
                var playerName = playerColumn[0].innerText.trim();
                
                var newColumn = $(`<td id='th-gcl-${i}'></td>`)
                lastColumn.after(newColumn);

                (function(column, player) {
                    module.ajaxGet(`https://screeps.com/api/user/find?username=${player}`, function(result, err){
                        var html = "";

                        if (result){
                            var gcl = result.user.gcl;
                            var gclLevel = Math.floor(Math.pow((gcl||0)/1000000,1/2.4))+1; 
                            column.text(`${gclLevel}`);   
                        }

                        
                    });
                })(newColumn, playerName);
            }
        }
        
        $(".table.table-striped tbody tr th:last-child").css('text-align', 'right');
        $(".table.table-striped tbody tr td:last-child").css('text-align', 'right');

        if($("#th-start-date").length == 0) {
            $(".table.table-striped tbody tr th:last-child").after('<th id="th-start-date">Start date</th>');

            
            for(var i = 0; i < leaderBoard.list.length; i++){
                var playerColumn = $(".table.table-striped tbody tr:nth-child(" + (i + 2) + ") td:nth-child(2)");
                var lastColumn = $(".table.table-striped tbody tr:nth-child(" + (i + 2) + ") td:last-child");
                var playerName = playerColumn[0].innerText.trim();

                var newColumn = $(`<td id='th-start-date-${i}'></td>`)
                lastColumn.after(newColumn);

                (function(column, player) {
                    module.ajaxGet(`https://screeps.com/api/leaderboard/find?mode=world&username=${player}`, function(result, err){
                        var html = "";

                        if (result && result.list.length){
                            var season = result.list[0].season;
                            season = season.replace("-rel","");
                            column.text(season);
                        } 
                    });
                })(newColumn, playerName);
            }
        }

    });
}
