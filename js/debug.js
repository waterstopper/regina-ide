var breakpointsList = [];
var currentBreakpointIndex = 0;

function changeBreakpointColor(lineNumber) {
    let breakpoints = window.editor.getBreakpoints()
    if (lineNumber == null) {
        breakpoints.forEach(point => {
            point.options.glyphMarginClassName = "fas fa-ban inactive-breakpoint"
        })
    } else
        breakpoints.forEach(point => {
            if (point.range.startLineNumber == lineNumber) {
                point.options.glyphMarginClassName = "fas fa-circle"
            }
        })
    window.editor.setBreakpoints(breakpoints)
}

function traverseMap(map) {
    // non-map
    if (typeof map != 'object')
        return map
    if (isLinkedHashMap(map))
        map = transformLinkedHashMap(map)
        // normal map
    for (const [key, value] of Object.entries(map)) {
        map[key] = traverseMap(value)
    }
    return map
}

function isLinkedHashMap(map) {
    return map.equality_1 != null &&
        map.map_1 != null &&
        map.isReadOnly_1 != null &&
        map.internalMap_1 != null
}

function transformLinkedHashMap(map) {
    let res = {}
    let entry = map.head_1
    if (entry == null)
        return res
    let firstObject = null
    let index = 0
    while (res[entry.key_1] == null && entry.key_1 != firstObject) {
        if (typeof entry.key_1 == 'object') {
            if (firstObject == null)
                firstObject = entry.key_1
            res["@entry_" + index] = {}
            res["@entry_" + index].key = entry.key_1
            res["@entry_" + index].value = entry._value_1
            index++
        } else
            res[entry.key_1] = entry._value_1
        entry = entry.next_1
    }
    return res
}

function startDebugging() {
    let debugPanel = document.getElementById("debug-panel");
    let settingsPanel = document.getElementById("settings-panel");
    debugPanel.style = "display:block;";
    settingsPanel.style = "display:none;";
    showDebuggingScope(breakpointsList[currentBreakpointIndex]);
}

function showDebuggingScope(scope) {
    console.log(scope)
    highlightBreakpointLine(parseInt(scope["@position"].second_1) + 1)
    for (const [key, value] of Object.entries(scope)) {
        if (key[0] == "@")
            continue
        if (typeof value == 'object') {
            createFolder(key + ": " + getCollectionString(scope, value))
        } else createFile(key + ": " + value)
    }
    // empty debug panel
    // create all elements
}

function getCollectionString(scope, collection) {
    switch (collection.first_1) {
        case "type":
            return collection.second_1
        case "array":
            return getArrayById(collection.second_1, scope["@references"].arrays_1)
        case "dictionary":
            return getDictionaryById(collection.second_1, scope["@references"].dictionaries_1)
    }
}

function getArrayById(id, arrays) {
    let array = arrays[id].properties_1.array_1
    return "[" + array.slice(0, 4).map(e => shortenedString(e)).join(', ') +
        (array.length > 4 ? ",..]" : "]");
}

function shortenedString(e) {
    return typeof e == 'object' ? shortenedCollectionString(e) : e
}

function shortenedCollectionString(collection) {
    switch (collection.first_1) {
        case "type":
            return collection.second_1
        case "array":
            return "[..]"
        case "dictionary":
            return "{..}"
    }
}

function getDictionaryById(id, dictionaries) {
    let dict = dictionaries[id].properties_1
    return "{" + Object.entries(dict).slice(0, 3).map(([key, value], i) => {
        console.log(i)
        if (key[0] == "@") {
            return shortenedString(dict[key].key) + ":" + shortenedString(dict[key].value)
        }
        return key + ":" + shortenedString(value)
    }).join(', ') + (Object.keys(dict).length > 2 ? ",..}" : "}");
}

function highlightBreakpointLine(lineNumber) {
    let breakpoints = window.editor.getBreakpoints()
    for (let i = 0; i < breakpoints.length; i++) {
        if (breakpoints[i].range.startLineNumber == lineNumber) {
            breakpoints[i].options.className = "highlight-breakpoint-line";
            break;
        }

    }
    window.editor.setBreakpoints(breakpoints)
    window.editor.setPosition({ lineNumber: lineNumber, column: 1 });
    window.editor.revealLine(lineNumber);
}

function loadDebuggingFold(foldElement, scope, elementId) {}


function addBreakpointsToCode() {
    let code = window.editor.getValue().split("\n")
    let i = 0;
    let breakpoints = window.editor.getBreakpoints()
    breakpoints.sort((a, b) => parseInt(a.range.startLineNumber) - parseInt(b.range.startLineNumber))
    breakpoints.forEach(point => {
        code[point.range.startLineNumber - 1] = "#stop; " + code[point.range.startLineNumber - 1]
    });
    return code.join("\n")
}