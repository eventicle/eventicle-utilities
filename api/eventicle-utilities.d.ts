import { Logger } from 'winston';
import * as winston from 'winston';

declare interface ApmApi {
    rawApm: () => any;
    getCurrentTraceIds?: () => any;
    getCurrentTransaction: () => {
        traceparent: string;
        startSpan: (name: string) => Span;
    };
    getCurrentSpan: () => Span;
    startTransaction: (name: string, type: string, subtype: string, parent: string) => void;
    endTransaction: () => void;
}

declare interface DataQuery {
    value: string | number | [number, number] | string[] | {
        [key: string]: any;
    };
    op: "EQ" | "LT" | "GT" | "LTE" | "GTE" | "BETWEEN" | "IN" | "OBJECT" | "LIKE";
}

declare interface DataSorting {
    [key: string]: 'ASC' | 'DESC';
}

declare interface DataStore {
    on(event: 'transaction.start', listener: (name: string, data: TransactionData) => void): this;
    on(event: 'transaction.commit', listener: (name: string, data: TransactionData) => void): this;
    /**
     * Bag of data associated with the current transaction
     */
    getTransactionData(): TransactionData;
    hasTransactionData(): boolean;
    transaction<T>(exec: () => Promise<T>, options?: TransactionOptions): Promise<T>;
    getEntity(workspaceId: string, type: string, id: string): Promise<Record_2>;
    /**
     *
     * @param workspaceId
     * @param {*} type Entity type or "table" name
     * @param {*} query  Json object to match fields
     * @param sorting
     */
    findEntity(workspaceId: string, type: any, query: Query, sorting?: DataSorting): Promise<Record_2[]>;
    /**
     *
     * @param workspaceId
     * @param {*} type Entity type or "table" name
     * @param {*} query  Json object to match fields
     * @param sorting
     * @param {*} page page count
     * @param {*} pageSize page size
     */
    findEntityPaginated(workspaceId: string, type: string, query: Query, sorting: DataSorting, page: number, pageSize: number): Promise<PagedRecords>;
    /**
     *
     * @param workspaceId
     * @param type Entity type or "table" name
     * @param content
     */
    createEntity(workspaceId: string, type: string, content: any): Promise<Record_2>;
    saveEntity(workspaceId: string, type: string, item: Record_2): Promise<Record_2>;
    deleteEntity(workspaceId: string, type: string, id: string): Promise<void>;
    deleteMany(workspaceId: string, type: string, query: Query): Promise<void>;
}

declare function dataStore(): DataStore;

declare namespace ds {
    export {
        Query,
        dataStore,
        setDataStore,
        DataSorting,
        DataStore,
        DataQuery,
        Record_2 as Record,
        PagedRecords,
        TransactionData,
        TransactionOptions,
        TransactionListener
    }
}
export { ds }

export declare function elasticApmEventicle(apm: any): ApmApi;

export declare function getAPM(): ApmApi;

export declare function getApmCurrentTraceIds(): any;

export declare function getApmTraceparent(): string;

declare function getFileNameAndLineNumber(numberOfLinesToFetch?: number): {
    file: any;
    lineno: any;
    timestamp: string;
};

declare function handleNestedContextualError(info: any): any;

declare function handleTopLevelContextualError(info: any): any;

export declare function hashCode(str: string): number;

declare function isError(data: any): data is Error;

export declare function lockManager(): LockManager_2;

/**
 * A lock manager
 */
declare interface LockManager_2 {
    /**
     * Obtain a lock over a shared resource.
     *
     * Will block until the lock becomes available.
     *
     * Will call onLockFailure if the lock is not available within the built in timeout
     *
     * @param id
     * @param onLock
     * @param onLockFailure
     */
    withLock: <T>(id: string, onLock: () => Promise<T>, onLockFailure: () => void) => Promise<T>;
    /**
     * Obtain a lock over a shared resource.
     *
     * If the lock is not immediately available, will call onLockFailure and terminate
     *
     * @param id
     * @param onLock
     * @param onLockFailure
     */
    tryLock: <T>(id: string, onLock: () => Promise<T>, onLockFailure: () => void) => Promise<T>;
}
export { LockManager_2 as LockManager }

export declare interface LogApi {
    error(message: string, arg?: any): any;
    info(message: string, arg?: any): any;
    warn(message: string, arg?: any): any;
    trace(message: string, arg?: any): any;
    debug(message: string, arg?: any): any;
    rainbow(message: string, arg?: any): any;
}

export declare const logger: {
    log: (message: any, obj?: any) => void;
    error: (message: any, err?: any) => void;
    warn: (message: any, obj?: any) => void;
    verbose: (message: any, obj?: any) => void;
    info: (message: any, obj?: any) => void;
    debug: (message: any, obj?: any) => void;
    trace: (message: any, obj?: any) => void;
    rainbow: (message: any, obj?: any) => void;
    close: (callback: any) => void;
};

declare namespace loggerUtil {
    export {
        getFileNameAndLineNumber,
        proxyLogger,
        handleTopLevelContextualError,
        handleNestedContextualError,
        maybeInsertInlineContext,
        maybeInsertContext,
        isError,
        maybeRenderError
    }
}
export { loggerUtil }

declare function maybeInsertContext(context: any, source: any, ...fields: string[]): any;

declare function maybeInsertInlineContext(message: string, source: any, ...fields: string[]): string;

declare function maybeRenderError(data: any): any;

declare interface PagedRecords {
    totalCount: number;
    pageInfo: {
        currentPage: number;
        pageSize: number;
    };
    entries: Record_2[];
}

export declare function pause(ms: number): Promise<void>;

declare function proxyLogger(logger: Logger, baseDirName: string): winston.Logger;

declare type Query = {
    [key: string]: string | number | DataQuery;
};

declare interface Record_2 {
    type: string;
    id: string;
    content: any;
    createdAt: Date;
}

declare function setDataStore(dataStore: DataStore): void;

export declare function setEventicleApm(apm: ApmApi): void;

export declare function setLockManager(lockManager: LockManager_2): void;

export declare function setLogApi(log: LogApi): void;

declare interface Span {
    rawSpan: () => any;
    addLabels: (labels: any) => void;
    setType: (type: string) => void;
    getCurrentTraceID: () => string;
    end: () => void;
}

export declare function span<T>(name: string, labels: {
    [key: string]: string;
}, exec: (span: Span) => Promise<T>): Promise<T>;

declare interface TransactionData {
    id: string;
    data: {
        [key: string]: any;
    };
}

declare interface TransactionListener {
    onStart: (data: TransactionData) => void;
    onCommit: (data: TransactionData) => void;
}

declare interface TransactionOptions {
    propagation: "requires" | "requires_new";
}

export declare function withAPM(exec: (apm: ApmApi) => Promise<void>): Promise<void>;

export { }
