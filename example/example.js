import XtermJSShell from '../index.js'

const terminal = new Terminal()

const shell = new XtermJSShell(terminal)

terminal.open(document.querySelector('main'))

shell
  .command('help', async (shell) => {
    await shell.printLine(`
Try running one of these commands:
${shell.commands.map((command) => ` - ${command}`).join('\n')}

`)
  })
  .command('fetch', async (shell, [ url ]) => {
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
