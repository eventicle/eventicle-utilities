import logger, {LogApi, setLogApi} from "./logger";
import {getAPM, span, withAPM, getApmCurrentTraceIds, getApmTraceparent, setEventicleApm, elasticApmEventicle} from "./apm";
import * as loggerUtil from "./logger-util";
import * as ds from "./datastore"
import {lockManager, setLockManager, hashCode, LockManager} from "./lock-manager";

function pause(ms: number): Promise<void> {
  return new Promise((res => {
    setTimeout(args => {
      res()
    }, ms)
  }))
}


export {
  logger, loggerUtil, LogApi, setLogApi,
  getAPM, span, withAPM, getApmCurrentTraceIds, getApmTraceparent, setEventicleApm, elasticApmEventicle,
  ds,
  lockManager, setLockManager, hashCode, LockManager,
  pause
}
