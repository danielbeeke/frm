export class Logger extends EventTarget {

  log (message: string) {
    console.log(message)
    
    this.dispatchEvent(new CustomEvent('message', {
      detail: {
        message
      }
    }))
  }

}