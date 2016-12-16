function save_options() {
    var storage = {}
    
    document.SCsettings.modules.forEach(function(module){
        var name = module.path.replace("modules/", "").replace(".js", "");

        var moduleEle = document.getElementById(name)
        var enableCheckBox = moduleEle.getElementsByClassName('checkbox-enabled')[0]; 

        storage[name] = {}
        storage[name].enabled = enableCheckBox.checked;

        if (module.options && module.options.config &&  module.options.config.length){

            storage[name].config = {}

            module.options.config.forEach(function(config){
                var configEle = document.getElementById(config.name);

                if (configEle){
                    var elementTag = configEle.tagName.toLowerCase();
                    switch(elementTag) {
                        case "select":{
                            storage[name].config[config.name] = configEle.options[configEle.selectedIndex].value;
                            break;
                        }
                        default:
                            console.error("Config type: " + elementTag + " is not implemented in save options.");
                    }
                }
            });
        }
    });

    console.log(storage);
    
    chrome.storage.sync.set(storage, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
    
}

function addModuleOption(module){
    var div = document.createElement("div");

    var name = module.path.replace("modules/", "").replace(".js", "");
    var imgUrl = ""; 
    var content = "";
    var enableChecked = 'checked="checked"';
    var sync = document.SCsettings.sync[name];


    if (sync){
        if (!sync.enabled){
            enableChecked = "";
        }
    }

    if (module.options){
        imgUrl = module.options.image || "";

        if (module.options.config){
            module.options.config.forEach(function(config){
                var htmlLeft = "";
                var htmlRight = "";
                var syncConfig;

                // get saved value from chrome sync
                if (sync && sync.config && sync.config[config.name]){
                    syncConfig = sync.config[config.name];
                }

                switch(config.type) {
                    case "select":{
                        var options = "";
                        var defaultValue = syncConfig || config.defaultValue || config.options[0];

                        for(var i = 0; i < config.options.length; i++){
                            if (defaultValue === config.options[i]){
                                options += `<option selected="selected">${config.options[i]}</option>`
                            }else{
                                options += `<option>${config.options[i]}</option>`
                            }
                            
                        }

                        htmlLeft += `<label style="font-weight: bold;text-transform: capitalize;">${config.name}</label>`;
                        htmlLeft += `<select id="${config.name}">${options}</select>`;
                        htmlRight += `<span style="font-style: italic;">${config.description}</span>`;

                        break;
                    }
                    default:
                        console.error("Config type: " + config.type + " is not implemented in addModuleOption.");
                }

                content += `<div style="display: inline-block;width: 90%;padding-bottom:10px;">
                                <div style="width: 40%;float: left;height: 100%;">${htmlLeft}</div>
                                <div style="padding-top: 5px;">${htmlRight}</div>
                            </div>`;
            });
        }
    }

    div.className ="module-block"
    div.id = name;
    
    div.innerHTML = `
    <h3>
        ${name} 
        <label class='enable-label'>
            <input class='checkbox-enabled' type="checkbox" ${enableChecked}>
            <span class='checkbox-text'>Enabled</span>
        </label>
    </h3>
    <div class="module-image">
        <img src="${imgUrl}"/>
    </div>
    <div class="module-content">
        ${content}
    </div>`;
    document.getElementById('modules').appendChild(div);

}

function loadOptions() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            document.SCsettings = JSON.parse(xhr.responseText);

            chrome.storage.sync.get(null, function(items) {
                document.SCsettings.sync = items;

                document.SCsettings.modules.forEach(function(module){
                    addModuleOption(module);
                });
            });
        }
    }
    xhr.open("GET", chrome.extension.getURL('settings.json'), true);
    xhr.send();
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', save_options);