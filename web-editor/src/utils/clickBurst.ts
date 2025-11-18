import type { Directive } from 'vue'

const createParticle = (x: number, y: number) => {
  const particle = document.createElement('particle')

  const size = Math.floor(Math.random() * 20 + 5)

  particle.style.width = `${size}px`
  particle.style.height = `${size}px`

  const rotation = Math.random() * 520

  if (Math.random() <= 0.5) {
    particle.classList.add('ni')
  }

  particle.style.fontSize = `${(Math.random() * 0.5 + 0.5).toPrecision(2)}rem`
  particle.style.color = 'white'

  const destinationX = x + (Math.random() - 0.5) * 2 * 75
  const destinationY = y + (Math.random() - 0.5) * 2 * 75

  const animation = particle.animate(
    [
      {
        transform: `translate(${x - size / 2}px, ${y - size / 2}px) rotate(0deg)`,
        opacity: 1,
      },
      {
        opacity: 1,
      },
      {
        transform: `translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`,
        opacity: 0,
      },
    ],
    {
      duration: 500 + Math.random() * 1000,
      easing: 'cubic-bezier(0, .9, .57, 1)',
      delay: Math.random() * 200,
    },
  )

  animation.onfinish = () => {
    particle.remove()
  }

  document.body.appendChild(particle)
}

const burstOnClick = (ev: MouseEvent) => {
  for (let i = 0; i < 5; i++) {
    createParticle(ev.clientX, ev.clientY)
  }
}

export const useClickBurst = () => {
  const aborts = new Map<HTMLElement, AbortController>()

  const directive: Directive = {
    mounted(el: HTMLElement) {
      aborts.set(el, new AbortController())

      el.addEventListener('click', burstOnClick, { signal: aborts.get(el)?.signal })
    },
    beforeUnmount(el: HTMLElement) {
      el.removeEventListener('click', burstOnClick)

      aborts.get(el)?.abort()
      aborts.delete(el)
    },
  }

  return directive
}
