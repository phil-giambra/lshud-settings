
let setting_nav_select = document.getElementById('setting_nav_select')
setting_nav_select.addEventListener("change",handleSettingSwap)
let settings_hud_list_cont = document.getElementById('settings_hud_list_cont')

let win_bounds

fromMain.start_realtime_data = function(data){
    console.log("start_realtime_data");
    STATE.realtime = true

}
fromMain.stop_realtime_data = function(data){
    console.log("stop_realtime_data");
    STATE.realtime = false

}
fromMain.config_definition = function(data){
    console.log("config_definition", data.data);
    config = data.data
}


fromMain.position_size_update_pass = function(data){
    console.log("position_size_update_pass",data.bounds);
    win_bounds = data.bounds
}

let hdef = {}

fromMain.request_hud_defs = function(data){
    console.log("request_hud_defs");
    hdef = data.data
    updateHudList()
}

function updateHudList(){
    let str = `<option value="lshud-settings">General</option>`
    let str_list = ""
    for (let h in hdef){
        console.log("hdef ", hdef[h]);
        if (h !== "lshud-settings"){
            str += `<option value="${h}">${hdef[h].name}</option>`

            let checked = ""
            //if (hdef[h].active === true) { checked = "checked"}
            let swch = SF.switch_box_html.replace("replace_id", h+"_active" )
            swch = swch.replace("replace_class", "list_switch_active")
            swch = swch.replace("replace_checked", checked)
            str_list += `<p> hello ${hdef[h].name} ${swch} </p>`
        }


    }
    setting_nav_select.innerHTML = str
    settings_hud_list_cont.innerHTML = str_list
    let addlist = document.getElementsByClassName("list_switch_active");
    for (var i = 0; i < addlist.length; i++) {
        addlist[i].addEventListener("change", handleHudSettingChange);
    }

}



let viewid = "lshud-settings"
function handleSettingSwap(e){
    console.log("handleSettingSwap",setting_nav_select.value);
    let hud_to_view = setting_nav_select.value

    if (hud_to_view === "lshud-settings") {
        // hide remove any active browser_views
        lsh.send("hud_window",{type:"request_browser_view", hudid: hudid, remove:hud_to_view })
        viewid = hud_to_view
    } else {
        // request a browser_view from main
        viewid = hud_to_view
        let bv = {
            "name":hud_to_view,
            "url":`file://${hdef[hud_to_view].path}/settings.html`,
            "bounds":{ "x": 0, "y": 60, "width": win_bounds.width, "height": win_bounds.height - 60   },
            "auto_resize": {"width":true, "height":true},
            "auto_load" :true,
            "dev_tools": false
            }
        lsh.send("hud_window",{type:"request_browser_view", hudid: hudid, view:bv  })
    }
}


function handleHudSettingChange(event) {
    console.log("handleHudActiveChange", event.target.id );
    let parts = event.target.id.split("_")
    let hid = parts.shift()
    let value
    let itype = SF.BYID(event.target.id).type
    if (itype === "checkbox") {
        value = SF.BYID(event.target.id).checked
    }
    else if (itype === "number") {
        value = parseInt(SF.BYID(event.target.id).value)
        if (String(value) === "NaN") {
            console.log("handleHudSettingChange --- invalid number input" );
            return;
        }
    }
    else {
        value = SF.BYID(event.target.id).value
    }

    let sets = {
        hudid:hid,
        itype:itype,
        key:parts.join("_"),
        value: value
    }
    lsh.send("hud_window",{ type:"setting_change", hudid: hudid,  change:sets })
}


//-----------------------window buttons----------------------------------------
// menu and main button listeners
let window_buttons = document.getElementsByClassName("window_btn");
for (var i = 0; i < window_buttons.length; i++) {
    window_buttons[i].addEventListener("click", handleWindowButton);
}


// minimum/maximize/close
function handleWindowButton(event) {
    let btn_id
    if (typeof(event) === "string") {
        btn_id = event
    } else {
        btn_id = event.target.id
    }
    console.log("win-button", btn_id);
    lsh.send("hud_window",{type:"window_button", button:btn_id , hudid: hudid})
}
