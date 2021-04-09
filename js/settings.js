
let setting_nav_select = document.getElementById('setting_nav_select')
setting_nav_select.addEventListener("change",handleSettingSwap)
let cs_selected_cont = document.getElementById('cs_selected_cont')
let settings_shared = document.getElementById('settings_shared')
let settings_general = document.getElementById('settings_general')


let win_bounds
let viewid = "lshud-settings"
let hdef = {}

// disable default top panel behavour
SF.hoverbar.removeEventListener("mouseenter",SF.hoverbarShowPanel)
SF.top_panel.removeEventListener("mouseleave",SF.hoverbarHidePanel)


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


// any time a huds config changes (other than the app object) we will get this event
// we will just set and reparse the hdefs
fromMain.request_hud_defs = function(data){
    console.log("request_hud_defs");
    hdef = data.data
    updateHudList()
}

// when any changes are made to the app object of a huds config this event will happen
// we will update the local hdef and if this huds settings are up we will reload the browserView
fromMain.app_setting_change = function(data){
    console.log("settings_change_update", data);
    if (data.change.hudid === viewid) {
        lsh.send("hud_window",{type:"request_browser_view", hudid: hudid, reload:viewid })
    }
    hdef[data.change.hudid].app = data.app

}



function updateHudList(){
    let str = `<option value="lshud-settings">General</option>`
    let str_list = ""
    for (let h in hdef){
        console.log("hdef ", hdef[h]);
        if (h !== "lshud-settings"){
            let checked = {active:"",is_hidden:"", is_pinned:"", viewid:"", selected:""}
            if (h === viewid) {
                checked.viewid = "cs_selected"
                checked.selected = "selected"
            }
            if (hdef[h].active === true) { checked.active = "checked"}
            if (hdef[h].is_hidden === true) { checked.is_hidden = "checked"}
            if (hdef[h].is_pinned === true) { checked.is_pinned = "checked"}

            str += `<option value="${h}" ${checked.selected}>${hdef[h].name}</option>`
            let swch = SF.switch_box_html.replace("replace_id", `${h}_active`)
            swch = swch.replace("replace_class", "list_switch_key")
            swch = swch.replace("replace_checked", checked.active)
            let swch2 = SF.switch_box_html.replace("replace_id", `${h}_is_hidden` )
            swch2 = swch2.replace("replace_class", "list_switch_key")
            swch2 = swch2.replace("replace_checked", checked.is_hidden)
            swch2 = swch2.replace("On", "Hide").replace("Off", "Show")
            let swch3 = SF.switch_box_html.replace("replace_id", `${h}_is_pinned` )
            swch3 = swch3.replace("replace_class", "list_switch_key")
            swch3 = swch3.replace("replace_checked", checked.is_pinned)
            swch3 = swch3.replace("On", "Pin").replace("Off", "Un-Pin")
            str_list += `<p class="commom_settings ${checked.viewid}" id="cs_${h}">
            &nbsp;&nbsp; ${swch}&nbsp;&nbsp;${swch2}&nbsp;&nbsp;${swch3}
            </p>`
        }


    }
    setting_nav_select.innerHTML = str
    settings_shared.innerHTML = str_list
    let addlist = document.getElementsByClassName("list_switch_key");
    for (var i = 0; i < addlist.length; i++) {
        addlist[i].addEventListener("change", SF.handleHudSettingChange);
    }

}




function handleSettingSwap(e){
    console.log("handleSettingSwap",setting_nav_select.value);
    let hud_to_view = setting_nav_select.value
    let cs_blocks = document.getElementsByClassName("commom_settings");
    if (hud_to_view === "lshud-settings") {
        // hide remove any active browser_views
        lsh.send("hud_window",{type:"request_browser_view", hudid: hudid, remove:hud_to_view })
        viewid = hud_to_view
        for (let i = 0; i < cs_blocks.length; i++) { cs_blocks[i].classList.remove("cs_selected") };
        settings_general.style.display = "block"
        settings_shared.style.display = "none"
    } else {
        // request a browser_view from main
        viewid = hud_to_view
        let bv = {
            "name":hud_to_view,
            "url":`file://${hdef[hud_to_view].path}/settings.html`,
            "bounds":{ "x":0, "y": 60, "width": Math.floor(win_bounds.width/2), "height": win_bounds.height - 60   },
            "auto_resize": {"horizontal":true, "height":true},
            "auto_load" :true,
            "dev_tools": false
            }
        lsh.send("hud_window",{type:"request_browser_view", hudid: hudid, view:bv  })
        for (let i = 0; i < cs_blocks.length; i++) {
            let bid = cs_blocks[i].id.replace("cs_", "")
            console.log(bid);
            if (bid = viewid){ cs_blocks[i].classList.add("cs_selected")  }
            else { cs_blocks[i].classList.remove("cs_selected") }
        };
        settings_general.style.display = "none"
        settings_shared.style.display = "block"
    }
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
