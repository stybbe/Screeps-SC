module.exports.init = function(){
    $("body").on('change', '[heading="Show hostile names"] > div > div > label > input', function(e) {
        module.exports.update();
    });

    module.exports.update();
}

module.exports.update = function(){
    module.getScopeData("room", "Room", ['Room.objects'], function(Room){
        var creeps = _.filter(Room.objects, {type: "creep"});

        creeps.forEach(function(obj){
            if (obj._id){
                var ele = document.getElementById(obj._id);

                if (ele){
                    var textElement = ele.getElementsByTagName('text')[0];
                    if (textElement){
                        textElement.innerHTML = obj.name;
                    }
                }
            }
        });
    });
}