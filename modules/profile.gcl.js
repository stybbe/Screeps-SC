module.exports.init = function(){
    var dropdown = '.stats-controls .dropdown-menu li a';
    $('body').off("click", dropdown).on("click", dropdown, function(){
        module.setScopeData('profile', 'Profile.data.user', undefined);

        module.getScopeData("profile", "Profile.data.user", [], function(data){
            module.exports.update();
        });
    });

    module.exports.update();
}

module.exports.update = function(){
    module.getScopeData("profile", "Profile", ['Profile.data.user', 'Profile.data.stats'], function(profile){
        var gcl = profile.data.user.gcl; 
        var gclPoints = profile.data.stats.energyControl
        var statInterval = profile.statInterval + "";

        var gclLevel = Math.floor(Math.pow((gcl||0)/1000000,1/2.4))+1; 
        var baseLevel = Math.pow(gclLevel - 1, 2.4) * 1000000;
        var currentProg = (gcl || 0) - baseLevel;
        var neededProg = Math.pow(gclLevel, 2.4) * 1000000 - baseLevel;
        var percentage = Math.floor(currentProg / neededProg * 100);
        var sec_num = 0;

        if (statInterval == "8"){
            sec_num = (neededProg - currentProg) / gclPoints * 60 * 60;
        } else if (statInterval == "180"){
            sec_num = (neededProg - currentProg) / gclPoints * 60 * 60 * 24;
        } else if (statInterval == "1440"){
            sec_num = (neededProg - currentProg) / gclPoints * 60 * 60 * 24 * 7;
        }

        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

        var profileElement = document.getElementsByClassName('profile-title')[0];

        var displayPercentage = percentage;
        var displayCurrentProg = parseFloat(Math.round(currentProg / 10000) / 100).toFixed(2);
        var displayNeededProg = Math.round(neededProg / 1000000);

        var html = `<div id="extended-gcl">
                        <div style="margin-top: 2px;padding: 4px 10px;background: #1b1b1b;position: relative;float:left;">
                            <div style="width: ${displayPercentage}%; position: absolute;left: 0;top: 0;bottom: 0;background: #009688;opacity: 0.7;filter: alpha(opacity=70);"></div>
                            <div style="z-index: 1;position: relative;color: white;font-size: 11px;">
                                <span style="opacity: 0.5;filter: alpha(opacity=50);font-weight: 300;">Next level: </span>
                                <strong style="font-weight: normal;">${displayCurrentProg}M / ${displayNeededProg}M</strong>
                            </div>
                        </div>
                        <div style="color: white;font-size: 11px;float:left;padding: 5px 0 0 5px;"> ~ ${hours}h until level</div>
                    </div>`;

        if (document.getElementById('extended-gcl')){
            $("#extended-gcl").remove();
        }

        profileElement.insertAdjacentHTML('beforeend', html);
    });
}