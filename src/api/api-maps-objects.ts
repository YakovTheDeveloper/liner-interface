import { apiClientMapsAndObject } from '.'
import type { MapItself, ObjectsResponse } from './types'

export const getMaps = () => apiClientMapsAndObject.get<MapItself[]>('/maps')

export const getObjects = (mapUlid: string) =>
  apiClientMapsAndObject.get<ObjectsResponse[]>('/points-of-interest?mapUlid=' + mapUlid)

export const getTerminals = (mapUlid: string) =>
  apiClientMapsAndObject.get<ObjectsResponse[]>('/terminals?mapUlid=' + mapUlid)
