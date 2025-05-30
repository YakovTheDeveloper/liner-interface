export interface Point {
  x: number
  y: number
}

export interface AreaInput {
  cords: Point[][] // array of array of Points
  mapId: string
  objectId: string
  nodeId: number
}

export interface AreaOutput extends AreaInput {
  id: number
}

export interface NodeInput {
  areaId?: number
  direction?: string
}

export interface NodeOutput extends NodeInput {
  id: number
}

export interface RoadInput {
  mapId: string
  source: Point
  target: Point
}

export interface RoadOutput {
  id: number
  mapId: string
  source: RoadOutputPoint
  target: RoadOutputPoint
}

export interface RoadOutputPoint extends Point {
  nodeId?: number
}

export interface ShortestPathInput {
  areaId: number
  mapId: string
  start: Point
}

export interface ObjectsResponse {
  ulid: string
  title: string
  mapUlid: string
  naviData: {
    cords: Array<Array<{ x: number; y: number }>>
    areaId: number
    nodeId: number
  }
}

export type MapItself = {
  ulid: 'string'
  name: 'string'
  image: 'string'
}
