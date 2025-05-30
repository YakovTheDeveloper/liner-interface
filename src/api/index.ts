import axios from "axios"

export const apiClient = axios.create({
  baseURL: 'http://api.vdnh.test.itlabs.top/navi/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiClientMapsAndObject = axios.create({
    baseURL: 'http://api.vdnh.test.itlabs.top/api',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  