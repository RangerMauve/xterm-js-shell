# xterm-js-shell
Building block for CLI environments for xterm.js

```js
const XtermJSShell = require('xterm-js-shell')

const terminal = new Terminal()

const shell = new XtermJSShell(terminal)

shell
  .command('help', async (shell) => {
    await shell.printLine(`
Try running one of these commands:
${shell.commands.map((command) => ` - ${command}`).join('\n')}

`)
  })
  .command('curl', async (shell, [ url ]) => {
    const response = await fetch(url)

    const text = await response.text()

    await shell.print(text)
  })
  .command('echo', async (shell, args) => {
    let message = null

    if (args.length) await shell.printLine(args.join(' '))

    // Loop until they hit enter without typing anything
    while (message = await shell.readLine('')) {
      await shell.printLine(message)
    }
  })
  .command('confirm', async (shell) => {
    const char = await shell.readChar('Y/n?')

    await shell.printLine(char)
  })
  .command('ssh', async (shell, {url}) => {
    // For use with https://github.com/RangerMauve/websocket-shell-service

    if(!url) url = 'ws:localhost:8080'

    const socket = new WebSocket(url)

    let closed = false

    socket.onclose = () => {
      closed = true
      shell.printLine(`Connection to ${url} closed`)
    }

    socket.onmessage = ({data}) => {
      shell.print(data)
    }

    for await(let data of shell.readStream()) {
      if(closed) break
      socket.send(data)
    }
  })

// Start the Read-Eval-Print-Loop
shell.repl()

terminal.open(someElement)
```

Features:

- Takes an [`xterm.js` terminal](https://xtermjs.org/) instance
- Keyboard navigation, history, tab completion [using local-echo](https://github.com/wavesoft/local-echo)
- Able to define commands with a name and an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) or an [async generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of#Iterating_over_async_generators)
- Commands take a `shell` instance, and `args` array
- Commands should be able to `readLine`, `readChar` from the shell
- Commands can `yield` data from the generator for output, or invoke `print` / `printLine`
- Commands should be abele to read raw data from the terminal as a stream
- After a command resolves or rejects, it's `shell` should throw whenever there's input
- Commands should be able to "take over" the terminal to prevent default processing
  - Useful for stuff like SSH
  - Shell will take back control after the program exits
- Able to `detach` shell from the terminal
