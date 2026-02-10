import { fetchAuthSession } from 'aws-amplify/auth'

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  partitionKey?: string
  headers?: Record<string, string>
}

class FlaskService {
  private baseUrl: string
  private partitionKey: string | null

  constructor() {
    this.baseUrl = import.meta.env.VITE_FLASK_API_URL || ''
    this.partitionKey =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('partition_key')
        : null
  }

  setPartitionKey(partitionKey: string | null) {
    this.partitionKey = partitionKey
    if (typeof window !== 'undefined') {
      if (partitionKey) {
        window.localStorage.setItem('partition_key', partitionKey)
      } else {
        window.localStorage.removeItem('partition_key')
      }
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()

    if (!token) {
      throw new Error('Authentication required')
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const headers = await this.getAuthHeaders()
    const partitionKey = options.partitionKey || this.partitionKey

    const { partitionKey: _pk, headers: extraHeaders, ...fetchOptions } = options

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...(partitionKey ? { 'X-Partition-Key': partitionKey } : {}),
        ...extraHeaders,
      },
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      const message =
        (body as Record<string, string>)?.error ||
        `HTTP ${response.status}`
      throw new Error(message)
    }

    return response.json() as Promise<T>
  }
}

export const flaskService = new FlaskService()
