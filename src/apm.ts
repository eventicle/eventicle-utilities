import logger from "./logger";

let APM: ApmApi = {
  getCurrentTraceIds:  () => {},
  endTransaction: () => null,
  getCurrentTransaction: () => ({ startSpan: name => ({ rawSpan: () => null, addLabels: () => null, getCurrentTraceID: () => null, setType: type => null, end: () => {}}), traceparent: null}),
  getCurrentSpan: () => ({
    rawSpan: () => null,
    setType: type => null,
    getCurrentTraceID: () => null,
    addLabels: (val) => null,
    end: () => null
  }),
  rawApm: () => null,
  startTransaction: (name, type, subtype, parent) => {}
}

export function getAPM(): ApmApi {
  return APM
}

interface Span {
  rawSpan: () => any
  addLabels: (labels: any) => void
  setType: (type: string) => void
  getCurrentTraceID: () => string
  end: () => void
}

export interface ApmApi {
  rawApm: () => any
  getCurrentTraceIds?:  () => any,
  getCurrentTransaction: () => { traceparent: string, startSpan: (name: string) => Span }
  getCurrentSpan: () => Span
  startTransaction: (name: string, type: string, subtype: string, parent: string) => void
  endTransaction: () => void
}

export function setEventicleApm(apm: ApmApi) {
  APM = apm
}

export function getApmTraceparent() {
  if (APM && APM.getCurrentSpan()) {
    return APM.getCurrentSpan().getCurrentTraceID()
  }
  if (APM && APM.getCurrentTransaction()) {
    return APM.getCurrentTransaction().traceparent
  }
}

export function getApmCurrentTraceIds(): any {
  if (APM && APM.getCurrentTraceIds) {
    return APM.getCurrentTraceIds()
  }
}

export async function withAPM(exec: (apm: ApmApi) => Promise<void>) {
  if (APM) {
    return await exec(APM)
  }
}


export async function span<T>(name: string, labels: { [key: string]: string }, exec: (span: Span) => Promise<T>): Promise<T> {
  let span
  if (APM && APM.getCurrentTransaction()) {
    span = APM.getCurrentTransaction().startSpan(name)
    if (span) {
      span.addLabels(labels)
    } else {
      logger.debug("APM was requested to start a span, but did not: " + name)
    }
  }

  try {
    return await exec(span)
  } finally {
    if (span) {
      span.end()
    }
  }
}

export function elasticApmEventicle(apm): ApmApi {

  const currentSpanFun = apm.currentSpan ? () => ({
    rawSpan: () => apm.currentSpan,
    setType: type => apm.currentSpan.setType(type),
    getCurrentTraceID: () => (apm.currentSpan.traceparent),
    addLabels: (val) => (apm.currentSpan.addLabels(val)),
    end: () => apm.currentSpan.end()
  }) : () => null;

  return {
    rawApm: () => apm,
    getCurrentTraceIds:  () => apm.currentTraceIds ? apm.currentTraceIds : {},
    endTransaction: () => apm.endTransaction(),
    getCurrentTransaction: () => apm.currentTransaction,
    getCurrentSpan: currentSpanFun,
    startTransaction: (name, type, subtype, parent) => {
      apm.startTransaction(name, type, subtype, {
        childOf: parent
      })
    }
  }
}
