export default () => {
  [...document.querySelectorAll('.bs-tooltip-auto')].forEach(tooltip => tooltip.remove())

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]:not(.processed)')
  ;[...tooltipTriggerList].forEach(tooltipTriggerEl => {
    /** @ts-ignore */
    new bootstrap.Tooltip(tooltipTriggerEl)
    tooltipTriggerEl.classList.add('processed')
  })
}