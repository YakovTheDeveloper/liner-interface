import type {
  AreaInput,
  AreaOutput,
  NodeInput,
  NodeOutput,
  RoadInput,
  RoadOutput,
  ShortestPathInput,
  Point,
} from './types'
import { apiClient } from '.'
import type { Terminal, TerminalPayload, TerminalPutPayload } from '@/entities/terminal'

// ---------------------- AREA ----------------------

export const getAreas = () => apiClient.get<AreaOutput[]>('/areas')

export const createArea = (data: AreaInput) => apiClient.post<AreaOutput>('/areas', data)

export const updateArea = (id: number, data: AreaInput) =>
  apiClient.patch<AreaOutput>(`/areas/${id}`, data)

export const deleteArea = (id: number) => apiClient.delete<void>(`/areas/${id}`)

// ---------------------- NODE ----------------------

export const updateNode = (id: number, data: NodeInput) =>
  apiClient.patch<NodeOutput>(`/nodes/${id}`, data)

// ---------------------- ROAD ----------------------

export const getRoads = () => apiClient.get<RoadOutput[]>('/roads')

export const createRoad = (data: RoadInput) => apiClient.post<RoadOutput>('/roads', data)

export const updateRoad = (id: number, data: RoadInput) =>
  apiClient.patch<RoadOutput>(`/roads/${id}`, data)

export const deleteRoad = (id: number) => apiClient.delete<void>(`/roads/${id}`)

export const findShortestPath = (data: ShortestPathInput) =>
  apiClient.post<Point[]>('/roads/shortest-path', data)

// ---------------------- TERMINALS ----------------------

export const getTerminals = () => apiClient.get<Terminal[]>('/terminals')

export const createTerminal = (data: TerminalPayload) =>
  apiClient.post<Terminal>('/terminals', data)

export const updateTerminal = (id: number, data: TerminalPutPayload) =>
  apiClient.patch<Terminal>(`/terminals/${id}`, data)

export const deleteTerminal = (id: number) => apiClient.delete<void>(`/terminals/${id}`)
