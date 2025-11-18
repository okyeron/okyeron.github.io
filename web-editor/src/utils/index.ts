export * from 'src/utils/clickBurst'

export const steppedExponentialAnimationFunction = ({
  base,
  count,
  factor,
}: {
  base: number
  count: number
  factor: number
}) => Array.from<number, number>({ length: count }, (_, i) => base * Math.pow(factor, i))

export const entranceAnimationsForSectionBorders = steppedExponentialAnimationFunction({
  base: 400,
  count: 5,
  factor: 0.2,
})
