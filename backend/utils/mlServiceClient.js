import fetch from "node-fetch"

class MLServiceClient {
  constructor() {
    this.baseURL = process.env.ML_SERVICE_URL || "http://localhost:8000"
    this.timeout = Number.parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === "AbortError") {
        throw new Error("ML service request timed out")
      }

      if (error.code === "ECONNREFUSED") {
        throw new Error("ML service is not available")
      }

      throw error
    }
  }

  async generateLearningPath(pathData) {
    return this.makeRequest("/generate-path", {
      method: "POST",
      body: JSON.stringify(pathData),
    })
  }

  async getDomains() {
    return this.makeRequest("/domains")
  }

  async validateInput(inputData) {
    return this.makeRequest("/validate-input", {
      method: "POST",
      body: JSON.stringify(inputData),
    })
  }

  async previewResources(domain, subdomain, difficulty = "intermediate") {
    return this.makeRequest("/resources/preview", {
      method: "POST",
      body: JSON.stringify({ domain, subdomain, difficulty }),
    })
  }

  async healthCheck() {
    try {
      return await this.makeRequest("/health")
    } catch (error) {
      return { status: "unhealthy", error: error.message }
    }
  }
}

export default new MLServiceClient()
