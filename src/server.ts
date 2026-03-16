import './instrumentation'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { paraglideMiddleware } from './paraglide/server.js'
import handler from '@tanstack/react-start/server-entry'

const tracer = trace.getTracer('archvault')

export default {
  fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const spanName = `${req.method} ${url.pathname}`

    return tracer.startActiveSpan(spanName, async (span) => {
      span.setAttributes({
        'http.method': req.method,
        'http.url': req.url,
        'http.route': url.pathname,
        'http.target': url.pathname + url.search,
      })

      try {
        const response = await paraglideMiddleware(req, () =>
          handler.fetch(req),
        )
        span.setAttribute('http.status_code', response.status)
        span.setStatus({ code: SpanStatusCode.OK })
        return response
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        })
        if (error instanceof Error) {
          span.recordException(error)
        }
        throw error
      } finally {
        span.end()
      }
    })
  },
}
