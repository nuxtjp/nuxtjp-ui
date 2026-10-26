import { expect, it } from 'vitest'
import { nuxtJpSeriesState } from '../src/runtime/core/series'
it('distinguishes empty, valid and incomplete series without inventing zeroes', () => {
  expect(nuxtJpSeriesState([])).toBe('empty')
  expect(nuxtJpSeriesState([{ id: 'a', label: 'October', value: 0 }, { id: 'b', label: 'November', value: -1 }])).toBe('ready')
  for (const points of [[{ id: 'a', label: 'A', value: NaN }], [{ id: 'a', label: 'A', value: Infinity }], [{ id: 'a', label: 'A', value: 1 }, { id: 'a', label: 'Again', value: 2 }], Array.from({ length: 1001 }, (_, i) => ({ id: String(i), label: 'A', value: 1 }))]) expect(nuxtJpSeriesState(points)).toBe('invalid')
})
