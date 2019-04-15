# xterm-js-shell
Building block for CLI environments for xterm.js

```js
const XtermJSShell = require('xterm-js-shell')

const terminal = new Terminal()

const shell = new XtermJSShell(terminal)

shell
  .command('help', (shell) => {
    await shell.printLine(`
Try running one of these commands:
- fetch
- echo
- confirm
`)
  })
  .command('fetch', (shell, [ url ]) => {
    const response = await fetch(url)

    const text = await response.text()

    await shell.print(text)
  })
  .command('echo', (shell) => {
    let message = null
    // Loop until they hit enter without typing anything
    while(message = await shell.readLine('> ')) {
      await shell.printLine(message)
    }
  })
  .command('confirm', (shell) => {
    const char = await shell.readChar('Y/n?')

    await shell.printLine(char)
  })

// Start the Read-Eval-Print-Loop
shell.repl()

terminal.open(someElement)
```

Features:

- Takes an [`xterm.js` terminal](https://xtermjs.org/) instance
- Keyboard navigation, history, tab completion [using local-echo](https://github.com/wavesoft/local-echo)
- Able to define commands with a name and `async` function
- Commands take a `shell` instance, and `args` array
- Commands should be able to `readline`, `readchar`, `printline`, and `print`
- Commands should be able to `run` other commands
- After a command resolves or rejects, it's `shell` should throw whenever there's input
- Commands should be able to "take over" the terminal to prevent default processing
  - Useful for stuff like SSH
  - Shell will take back control after the program exits
- Able to `detach` shell from the terminal
