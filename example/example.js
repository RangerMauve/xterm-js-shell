import XtermJSShell from '../index.js'

const terminal = new Terminal()

const shell = new XtermJSShell(terminal)

terminal.open(document.querySelector('main'))

shell
  .command('help', async (shell) => {
    await shell.printLine(`
Try running one of these commands:
- fetch
- echo
- confirm
`)
  })
  .command('fetch', async (shell, [ url ]) => {
    const response = await fetch(url)

    const text = await response.text()

    await shell.print(text)
  })
  .command('echo', async (shell, args) => {
    let message = null

    if(args.length) await shell.printLine(args.join(' '))

    // Loop until they hit enter without typing anything
    while (message = await shell.readLine('> ')) {
      await shell.printLine(message)
    }
  })
  .command('confirm', async (shell) => {
    const char = await shell.readChar('Y/n?')

    await shell.printLine(char)
  })

// Start the Read-Eval-Print-Loop
shell.repl()
