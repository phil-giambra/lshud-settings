const ipc = require('electron').ipcRenderer;

window.hudid = "lshud-settings"

window.sctl = require('./lib/settings_ctl.js')

console.log("pre-load : " , __dirname);

window.lsh = {}
// ipc to the main process
window.lsh.send = function (channel,data) {
    ipc.send(channel, data)
}

window.fromMain = {}
window.dataUpdate = {}
ipc.on('from_mainProcess', (event, data) => {
    if (fromMain[data.type]){
        fromMain[data.type](data)
    }

})
ipc.on('data_update', (event, data) => {
    if (dataUpdate[data.type]){
        dataUpdate[data.type](data)
    }

})


//-------------- launch control messages-----------------------------------------
sctl.msg.on("somthing", function(vol){
    //handleVolumeUpdate(vol)
    //lsh.send("data_update", { type:"volume_update", data:vol , hudid:hudid} )

})

sctl.msg.on("somthing_else", function(err){
    //handleVolumeError(data)
    //lsh.send("data_update", { type:"volume_error", data:err, hudid:hudid} )
})

window.onload = function() {
    lsh.send("hud_window",{type:"request_hud_defs", hudid: hudid })
};
