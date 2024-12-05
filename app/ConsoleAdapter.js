// Require the lib, get a working terminal
import Terminal from 'terminal-kit'

const Console = new Terminal.Terminal

const Colors = ['green', 'red', 'blue', 'black', 'yellow', 'magenta', 'violet', 'cyan', 'white', 'grey', 'gray']

function printText(text, color) {
    if (typeof text === "string") {
        if (typeof color === "string" && Colors.indexOf(color)>-1) {
            Console[color](text)
        } else {
            Console(text)
        }
    } else if (Array.isArray(text)){
        if (!Array.isArray(color)) {
            color = false
        }
        for (let j=0; j<text.length; j++) {
            if (color && Colors.indexOf(color[j])>-1) {
                Console[color[j]](text[j]+'')
            } else {
                Console(text[j]+'')
            }
        }
    }
}

export default class ConsoleAdapter {
    _process = {
        backups: {}
    }
    constructor() {
    }

    setContent(id, content) {
        if (!Array.isArray(content)) {
            content = [content]
        }
        if (id) {
            this._process.backups[id] = content
        }
    }

    setConsole(id) {
        const self = this;
        const content = self._process.backups[id]
        if (content) {
            for (let i = 0; i < content.length; i++) {
                if (typeof content[i] === "string" || typeof content[i] === "number") {
                    Console.wrapColumn({x: 0, width: null})
                    printText(content[i] + '')
                } else if (typeof content[i] === "object" && content[i].type) {
                    if (content[i].type === 'clear') {
                        Console.clear()
                    } else if (content[i].type === 'fullScreen') {
                        Console.fullScreen()
                    } else {
                        const wrap = {x: 0, width: null}
                        if (typeof content[i].start === "number") {
                            wrap.x = content[i].start
                        }
                        if (typeof content[i].wrap === "number") {
                            wrap.width = content[i].wrap
                        }
                        Console.wrapColumn(wrap)
                        if (content[i].type === 'text') {
                            printText(content[i].text, content[i].color)
                        } else if (content[i].type === 'prompt') {
                            if (content[i].confirm) {
                                printText(content[i].text, content[i].color)
                                Console.yesOrNo({yes: ['y', 'ENTER'], no: ['n']}, function (error, result) {
                                    if (typeof content[i].event === "function") {
                                        content[i].event.call(self, error, result)
                                    }
                                });
                            } else if (content[i].fileInput) {
                                printText(content[i].text, content[i].color)
                                Console.fileInput(
                                    {baseDir: content[i].baseDir || './'},
                                    function (error, input) {
                                        if (typeof content[i].event === "function") {
                                            content[i].event.call(self, error, input)
                                        }
                                    }
                                );
                            } else {
                                printText(content[i].text, content[i].color)
                                let autoComplete = content[i].autoComplete;
                                if (typeof autoComplete === "function") {
                                    autoComplete = async function (input, callback) {
                                        const list = await content[i].autoComplete(input);
                                        callback(undefined, Console.autoComplete(list, input, true));
                                    }
                                }

                                Console.inputField(
                                    {
                                        history: content[i].history || [],
                                        autoComplete: autoComplete || [],
                                        autoCompleteHint: true,
                                        autoCompleteMenu: true
                                    },
                                    function (error, input) {
                                        if (typeof content[i].event === "function") {
                                            content[i].event.call(self, error, input)
                                        }
                                    }
                                );
                            }
                        } else if (content[i].type === 'loader') {
                            if (content[i].spinner) {
                                Console.spinner()
                            } else if (content[i].progressBar) {
                                const progressBar = Console.progressBar({
                                    width: content[i].width,
                                    title: content[i].title,
                                    eta: content[i].time,
                                    items: content[i].items,
                                    percent: content[i].percent,
                                    barChar: content[i].barChar,
                                    barHeadChar: content[i].barHeadChar,
                                });
                                if (typeof content[i].update === "function") {
                                    content[i].update(function (value, items, title) {
                                        progressBar.update({
                                            title: title,
                                            items: items,
                                            progress: value,
                                        })
                                    })
                                }
                            }
                        } else if (content[i].type === 'table') {
                            let table = []
                            if (content[i].headers) {
                                table.push(content[i].headers)
                            }
                           table = Array.prototype.concat.call(table, content[i].items || [])
                            Console.table(table, {
                                hasBorder: !!content[i].border,
                                contentHasMarkup: true,
                                borderChars: 'lightRounded',
                                borderAttr: {color: content[i]?.styles?.borderColor || 'default'},
                                textAttr: {
                                    bgColor: content[i]?.styles?.cellBg || 'default',
                                    color: content[i]?.styles?.cellColor || 'default'
                                },
                                voidAttr: {
                                    bgColor: content[i]?.styles?.cellVBg || content[i]?.styles?.cellBg || 'default',
                                    color: content[i]?.styles?.cellVColor || content[i]?.styles?.cellColor || 'default'
                                },
                                firstCellTextAttr: {
                                    bgColor: content[i]?.styles?.firstCellBg,
                                    color: content[i]?.styles?.firstCellColor
                                },
                                firstCellVoidAttr: {
                                    bgColor: content[i]?.styles?.firstCellBg,
                                    color: content[i]?.styles?.firstCellColor
                                },
                                firstRowTextAttr: {
                                    bgColor: content[i]?.styles?.firstRowBg,
                                    color: content[i]?.styles?.firstRowColor
                                },
                                firstRowVoidAttr: {
                                    bgColor: content[i]?.styles?.firstRowBg,
                                    color: content[i]?.styles?.firstRowColor
                                },
                                firstColumnTextAttr: {
                                    bgColor: content[i]?.styles?.firstColumnBg,
                                    color: content[i]?.styles?.firstColumnColor
                                },
                                firstColumnVoidAttr: {
                                    bgColor: content[i]?.styles?.firstColumnBg,
                                    color: content[i]?.styles?.firstColumnColor
                                },
                                width: content[i].width,
                                lineWrap: content[i].lineWrap,
                                wordWrap: content[i].wordWrap,
                                fit: content[i].fit
                            })
                        } else if (content[i].type === 'menu') {
                            Console.singleLineMenu(content[i].items, {
                                y: content[i].y,
                                style: Console.inverse,
                                selectedStyle: Console.dim.blue.bgGreen,
                                itemMaxWidth: content[i].maxWidth,
                                cancelable: content[i].cancelable,
                            }, function (error, response) {
                                if (typeof content[i].event === "function") {
                                    content[i].event.call(self, error, response)
                                }
                            });
                        } else if (content[i].type === 'list') {
                            if (content[i].singleColumn) {
                                Console.singleColumnMenu(content[i].items, {
                                    y: content[i].y,
                                    itemMaxWidth: content[i].maxWidth,
                                    cancelable: content[i].cancelable,

                                }, function (error, response) {
                                    if (typeof content[i].event === "function") {
                                        content[i].event.call(self, error, response)
                                    }
                                });
                            } else {
                                Console.gridMenu(items, {
                                    y: content[i].y,
                                    itemMaxWidth: content[i].maxWidth,
                                    cancelable: content[i].cancelable,

                                }, function (error, response) {
                                    if (typeof content[i].event === "function") {
                                        content[i].event.call(self, error, response)
                                    }
                                });
                            }
                        } else if (content[i].type === 'animate') {
                            Console.slowTyping(
                                content[i].text,
                                {flashStyle: term.brightWhite},
                                function () {
                                    if (typeof content[i].end === "function") {
                                        content[i].end.call(self)
                                    }
                                }
                            );
                        } else if (content[i].type === 'image') {
                            Console.drawImage(content[i].url, {
                                shrink: {
                                    width: content[i].width || Console.width,
                                    height: content[i].height || Console.height,
                                }
                            }, content[i].onError)
                        } else {

                        }
                    }
                }
            }
        }
    }

    fullScreen() {
        Console.fullscreen()
    }

    clear() {
        Console.clear()
    }

    exit() {
        Console.processExit()
    }
}