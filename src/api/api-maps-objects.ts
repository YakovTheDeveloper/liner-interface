import { apiClientMapsAndObject } from '.'
import type { MapItself, ObjectsResponse } from './types'

export const getMaps = () => apiClientMapsAndObject.get<MapItself[]>('/maps')

export const getObjects = (mapUlid = '') =>
  apiClientMapsAndObject.get<ObjectsResponse[]>(
    mapUlid ? `/points-of-interest?mapUlid=${mapUlid}` : '/points-of-interest',
  )

export const getTerminalObjects = (mapUlid = '') =>
  apiClientMapsAndObject.get<ObjectsResponse[]>(
    mapUlid ? `/terminals?mapUlid=${mapUlid}` : '/terminals',
  )
