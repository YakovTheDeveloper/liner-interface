export interface Terminal {
  id: number
  mapId: string
  personPoint: {
    x: number
    y: number
  }
  terminalId: string
  x: number
  y: number
}

export type TerminalPayload = Omit<Terminal, 'id' | 'terminalId'>
export type TerminalPutPayload = Omit<Terminal, 'id' | 'mapId'>
