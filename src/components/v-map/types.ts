export interface Area {
  id: string | number
  points: Point[]
  objectId: string
  mapId: string
  nodeId: number
}
export interface Point {
  x: number
  y: number
}
export interface TerminalPoint extends Point {
  direction: number
  terminalId: string
}
