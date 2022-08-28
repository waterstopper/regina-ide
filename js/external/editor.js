import * as themes from "/js/external/themes.js";

require.config({
    paths: {
        "vs": "monaco-editor/min/vs"
    }
});
require(["vs/editor/editor.main"], function() {
    // Register a new language
    monaco.languages.register({
        id: 'Regina'
    });

    const config = {
        surroundingPairs: [{
            open: '{',
            close: '}'
        }, {
            open: '[',
            close: ']'
        }, {
            open: '(',
            close: ')'
        }, {
            open: "'",
            close: "'"
        }, {
            open: '"',
            close: '"'
        }, ],
        autoClosingPairs: [{
            open: '/*',
            close: '*/'
        }, {
            open: '{',
            close: '}'
        }, {
            open: '[',
            close: ']'
        }, {
            open: '(',
            close: ')'
        }, {
            open: "'",
            close: "'",
            notIn: ['string', 'comment']
        }, {
            open: '"',
            close: '"',
            notIn: ['string', 'comment']
        }, ],
        "brackets": [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"]
        ]
    };
    monaco.languages.setLanguageConfiguration('Regina', config);

    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('Regina', {
        keywords: [
            'continue', 'if', 'break', 'else', 'return', 'class', 'fun', 'while'
        ],
        operators: [
            '=', '>', '<', '!', '?', ':', '==', '<=', '>=', '!=',
            '&&', '||', '+', '-', '*', '/', '%'
        ],
        // we include these common regular expressions
        symbols: /[=><!?:&|+\-*\/\%]+/,
        // C# style strings
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        tokenizer: {
            root: [
                // identifiers and keywords
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }],
                [/[A-Z][\w\$]*/, 'type.identifier'], // to show class names nicely
                [/([A-Za-z]\\w*)(\\.[A-Za-z]\\w*)*/, 'link'],

                // whitespace
                {
                    include: '@whitespace'
                },
                [/\/\/.$/, 'comment'],

                // delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }],
                // @ annotations.
                // As an example, we emit a debugging log message on these tokens.
                // Note: message are supressed during the first load -- change some lines to see them.
                [/@\s*[a-zA-Z_\$][\w\$]*/, {
                    token: 'annotation',
                    log: 'annotation token: $0'
                }],

                // numbers
                [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/\d+/, 'number'],

                // delimiter: after number because of .\d floats
                [/[;,.]/, 'delimiter'],

                // strings
                [/"([^"\\]|\\.)*$/, 'string'], // non-teminated string
                [/"/, {
                    token: 'string.quote',
                    bracket: '@open',
                    next: '@string'
                }],

                // characters
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                [/'/, 'string.invalid']
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/, 'comment', '@push'], // nested comment
                ["\\*/", 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, {
                    token: 'string.quote',
                    bracket: '@close',
                    next: '@pop'
                }]
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
            ]
        }
    });

    monaco.editor.defineTheme('regina-light', themes.light);

    monaco.editor.defineTheme('regina-dark', themes.dracula)

    // Register a completion item provider for the new language
    monaco.languages.registerCompletionItemProvider('Regina', {
        provideCompletionItems: (model, position) => {
            if (position.column == 2) {
                var suggestions = [{
                        label: 'fun',
                        kind: monaco.languages.CompletionItemKind.Text,
                        insertText: 'fun',
                    }, {
                        label: 'class',
                        kind: monaco.languages.CompletionItemKind.Text,
                        insertText: 'class',
                    }, {
                        label: 'object',
                        kind: monaco.languages.CompletionItemKind.Text,
                        insertText: 'object',
                    }, {
                        label: 'fun template',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['fun $1() {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }, {
                        label: 'import',
                        kind: monaco.languages.CompletionItemKind.Text,
                        insertText: 'import',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsText
                    },
                    {
                        label: 'import as',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'import $1 as $0',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }, {
                        label: 'class template',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['class ${1:name} {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'class template'
                    }, {
                        label: 'object template',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: ['object ${1:name} {', '\t$0', '}'].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'class template'
                    }
                ];
                return {
                    suggestions: suggestions
                };
            }
            var suggestions = [{
                    label: 'while',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'while',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }, {
                    label: 'if',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'if',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                },
                {
                    label: 'else',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'else',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }, {
                    label: 'return',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'return',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                }
            ];
            if (parseInt(position.column) > 8) {
                suggestions.push({
                    label: 'break',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'break',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                })
                suggestions.push({
                    label: 'continue',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'continue',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                })
            }
            return {
                suggestions: suggestions
            }
        }
    });

    window.editor = monaco.editor.create(document.getElementById("container"), {
        value: localStorage.getItem("code") == null ? [
            "class Rope {",
            "\tpoints = []",
            "}"
        ].join("\n") : localStorage.getItem("code"),
        language: "Regina",
        glyphMargin: true,
        fontFamily: "Fira Code",
        fontSize: 16,
        fontLigatures: true,
        theme: "regina-light",
        automaticLayout: true,
        minimap: {
            enabled: false
        },
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0

    });
    var bList = []
    var breakpoints = window.editor.deltaDecorations(
        [breakpoints], bList
    );

    window.editor.onMouseDown(function(e) {
        if (e.target.type == 2) {
            if (e.target.element.className.includes("codicon")) {
                bList = bList.filter(breakpoint =>
                    breakpoint.range.startLineNumber != e.target.position.lineNumber)
            } else {

                let pos = e.target.position
                bList.push({
                    range: new monaco.Range(pos.lineNumber, 1, pos.lineNumber, 1),
                    options: {
                        isWholeLine: true,
                        //className: 'breakpoint',
                        glyphMarginClassName: 'fas fa-circle'
                    }
                })
            }
        }
        breakpoints = window.editor.deltaDecorations(breakpoints, bList)
    })

    window.editor.getBreakpoints = function() {
        return bList
    }

    window.editor.setBreakpoints = function(list) {
        breakpoints = window.editor.deltaDecorations(breakpoints, list)
    }

    monaco.languages.registerCodeLensProvider('Regina', {
        provideCodeLenses: function(model, token) {
            return {
                lenses: [{
                    range: {
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 2,
                        endColumn: 1
                    },
                    id: 'First Line',
                    command: {
                        //id: commandId,
                        title: 'Changes in lib file are removed after page reload'
                    }
                }],
                dispose: () => {}
            };
        },
        resolveCodeLens: function(model, codeLens, token) {
            return codeLens;
        }
    });

    //window.m1 = monaco.editor.createModel()
    //window.m2 = monaco.editor.createModel()

    //console.log(window.editor)
    //console.log(window.m1)
    //window.editor.setModel(window.m1)
    //state1 = window.editor.saveViewState()
});

var modelFirst = true
var tabs = []
    // tab states
var state1 = null
var state2 = null

function switchModel() {
    // if (cur)
    //     console.log(window.editor)
    if (modelFirst) {
        state1 = window.editor.saveViewState()
        window.editor.setModel(window.m2)
        window.editor.restoreViewState(state2)
        window.editor.focus()
    } else {
        state2 = window.editor.saveViewState()
        window.editor.setModel(window.m1)
        window.editor.restoreViewState(state1)
        window.editor.focus()
    }
    modelFirst = !modelFirst
}

document.documentElement.setAttribute('data-theme', "light")
var mona;
export default mona;