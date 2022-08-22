// settings
//files


function getItem(item) {
    //if(localStorage.ge)
}

function autosave() {
    localStorage.setItem("code", window.editor.getValue())
}

var counter = 0;
setInterval(function() {
    autosave();
}, 3000);

document.getElementById("saveButton").onclick = () => {
    autosave()
}