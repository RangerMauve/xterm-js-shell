import LocalEchoController from 'local-echo'

console.log(LocalEchoController)

const chalk = require('chalk')

const ERROR_NOT_FOUND = (command) => `Command Not Found: ${command}`
const ERROR_ALREADY_REGISTERED = (command) => `Command Already Registered: ${command}`

const WHITESPACE_REGEX = /[\s\r\n]+/g
const RESET = chalk.reset

/**
 * Command structure
 * @callback Command
 * @param {SubShell} shell Shell instance for input/output
 * @param {Array<string>} args Arguments for the command
 */

/** Shell abstraction for Xterm.js */
export default class XtermJSShell {
  /**
   * Instantiate and attach a shell to the terminal
   * @param {Terminal} term The xterm.js terminal
   */
  constructor (term) {
    this.prompt = this.color.yellow('> ')
    this.commands = new Map()
    this.echo = new LocalEchoController(term)

    this.attached = true

    this.echo.addAutocompleteHandler(this.autoCompleteCommands.bind(this))
  }

  /**
   * Detach the shell from xtermjs
   */
  detach () {
    if (!this.attached) return
    this.echo.detach()
    this.attached = false
  }

  /**
   * Attach the shell to the terminal
   */
  attach () {
    if (this.attached) return
    this.echo.attach()
    this.attached = true
  }

  /**
   * Utility for getting
   * @return {chalk} A [chalk](https://www.npmjs.com/package/chalk) instance
   */
  get color () {
    return chalk
  }

  /**
   * Read-eval-print-loop, run this to start the shell
   * @return {Promise} Resolves after a pass of the loop finishes
   */
  async repl () {
    // Read
    const line = await this.echo.read(this.prompt)

    const [command, ...args] = line.split(WHITESPACE_REGEX)

    try {
      // Eval / Print
      await this.run(command, args)
    } catch (e) {
      console.error(e)
      await this.echo.println(e.message)
    }

    // Loop
    this.repl()
  }

  /**
   * Run a command in the shell
   * @param  {string}         command The name of the command to run
   * @param  {Array<string>}  args    The list of command arguments to run
   * @return {Promise}                Resolves after the command has finished
   */
  async run (command, args) {
    const fn = this.commands.get(command)

    if (!fn) return new TypeError(ERROR_NOT_FOUND(command))

    const shell = new SubShell(this)

    await fn(shell, args)

    shell.destroy()
  }

  /**
   * Add a command to the shell
   * @param  {string}        command The name of the command
   * @param  {Command}      fn      Async function that takes a shell / args
   * @return {XtermJSShell}          Returns self for chaining
   */
  command (command, fn) {
    if (this.commands.has(command)) {
      console.warn(ERROR_ALREADY_REGISTERED(command))
    }

    this.commands.set(command, fn)

    return this
  }

  // Internal command for auto completion of command names
  autoCompleteCommands (index, tokens) {
    if (index === 0) {
      return [...this.commands.values()]
    } else {
      return []
    }
  }

  async readChar (message) {
    return this.echo.readChar(message)
  }

  async readLine (message) {
    return this.echo.read(message)
  }

  async abortRead (reason) {
    return this.echo.abortRead(reason)
  }

  async print (message) {
    return this.echo.print(message)
  }

  async printLine (message) {
    return this.echo.println(message)
  }

  async printList (list) {
    return this.echo.printWide(list)
  }
}

class SubShell {
  constructor (shell) {
    this.shell = shell
    this.destroyed = false
  }

  async readChar (message) {
    this.checkDestroyed()
    return this.shell.readChar(message)
  }

  async readLine (message) {
    this.checkDestroyed()
    return this.shell.readLine(message)
  }

  async abortRead (reason) {
    this.checkDestroyed()
    return this.shell.abortRead(reason)
  }

  async print (message) {
    this.checkDestroyed()
    this.shell.print(message)
  }

  async printLine (message) {
    this.checkDestroyed()
    this.shell.printLine(message)
  }

  async printList (list) {
    this.checkDestroyed()
    this.shell.printList(list)
  }

  get color () {
    return chalk
  }

  checkDestroyed () {
    if (this.destroyed) throw new Error('Terminal destroyed')
  }

  destroy () {
    this.destroyed = true
  }
}
