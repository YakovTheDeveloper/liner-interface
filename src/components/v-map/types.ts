export interface Area {
  id: string
  points: Point[]
  attachedRoutePoints: Point[]
  objectInfo?: any
}
export interface Point {
  x: number
  y: number
}
export interface TerminalPoint extends Point {
  direction: number
  terminalId: number
}
