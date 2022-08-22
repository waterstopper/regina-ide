console.log("A")

function changeSaveSeconds(input) {
    console.log(input.value)
    let value = parseInt(input.value)
    if (value < 0)
        input.value = 0
    else if (value > 1000)
        input.value = 1000
    localStorage.setItem("autosaveSeconds", parseInt(input.value))
}