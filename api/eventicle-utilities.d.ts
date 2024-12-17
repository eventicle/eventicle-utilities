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

/**
 * Allow querying against a single field.
 *
 * Will be mapped to a specific query technology by the underlying Datastore implementation.
 */
declare interface DataQuery {
    value: string | number | [number, number] | string[] | boolean | {
        [key: string]: any;
    };
    op: "EQ" | "LT" | "GT" | "LTE" | "GTE" | "BETWEEN" | "IN" | "OBJECT" | "LIKE" | "ARRAY_CONTAINS";
}

/**
 * Sort a {@link Query}
 */
declare interface DataSorting {
    [key: string]: 'ASC' | 'DESC';
}

/**
 * Abstraction around data storage in the form of document style records.
 *
 * Eventicle contains a built in InMemoryDatastore. Others can be imported as needed.
 */
declare interface DataStore {
    on(event: 'transaction.start', listener: (name: string, data: TransactionData) => void): this;
    on(event: 'transaction.commit', listener: (name: string, data: TransactionData) => void): this;
    /**
     * Bag of data associated with the current transaction
     */
    getTransactionData(): TransactionData;
    /**
     * Whether transaction data currently exists in this context.
     */
    hasTransactionData(): boolean;
    /**
     * Open a transaction (or optionally join one if it exists)
     * @param exec transaction is open within this execution. Once this function promise resolves, the transaction is committed or rolled back
     *             If `exec` Promise rejects, then the transaction is rolled back.
     * @param options if exists, controls if the trnasction should be new, or an existing on can be used.
     */
    transaction<T>(exec: () => Promise<T>, options?: TransactionOptions): Promise<T>;
    /**
     * Look up a single {@see Record} by its ID
     *
     * @param workspaceId when running on a multi-tenant Datastore, selects the tenant.
     * @param type The type of the Record
     * @param id The record ID
     */
    getEntity(workspaceId: string, type: string, id: string): Promise<Record_2>;
    /**
     * Find {@see Record} using a given {@link Query}, and optionally sort the results using a {@link DataSorting}
     *
     * @param workspaceId
     * @param {*} type Entity type or "table" name
     * @param {*} query  Json object to match fields
     * @param sorting
     */
    findEntity(workspaceId: string, type: any, query: Query, sorting?: DataSorting): Promise<Record_2[]>;
    /**
     * Find {@see Record} using a given {@link Query}, and optionally sort the results using a {@link DataSorting}, with
     * pagination information provided in {@link PagedRecords}
     *
     * @param workspaceId The tenant id.
     * @param type Entity type or "table" name
     * @param query Json object to match fields
     * @param sorting How to sort the results
     * @param page page count
     * @param pageSize page size
     */
    findEntityPaginated(workspaceId: string, type: string, query: Query, sorting: DataSorting, page: number, pageSize: number): Promise<PagedRecords>;
    /**
     * Create a new entity in the datastore.
     *
     * @param workspaceId Tenant
     * @param type Entity type or "table" name
     * @param content
     */
    createEntity(workspaceId: string, type: string, content: any): Promise<Record_2>;
    /**
     * Save updates an existing entity {@link Record}
     * @param workspaceId The tenant
     * @param type the record type
     * @param item The existing Record. Must have come from {@link DataStore#getEntity} or {@link DataStore#createEntity}
     */
    saveEntity(workspaceId: string, type: string, item: Record_2): Promise<Record_2>;
    /**
     * Remove a single Record by its ID
     *
     * @param workspaceId The tenant
     * @param type the record type
     * @param id the id of the entity.
     */
    deleteEntity(workspaceId: string, type: string, id: string): Promise<void>;
    /**
     * Delete multiple {@link Records} from the Datastore via a {@link Query} result
     *
     * @param workspaceId the tenant
     * @param type the Record type
     * @param query The query, any matching Records will be deleted.
     */
    deleteMany(workspaceId: string, type: string, query: Query): Promise<void>;
}

/**
 * The current {@link Datastore} implementation that Eventicle uses for internal data.
 * Can be used by application code to obtain a reference if required.
 */
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
 * Lock abstraction. This interface is used inside of Eventicle to provide semaphore access to shared resources.
 * Notably, this obtains exclusive locks around AggregateRoot instances when processing inside of Commands and Saga steps.
 *
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
    withLock: <T>(id: string, onLock: () => Promise<T>, onLockFailure: (e?: Error) => void) => Promise<T>;
    /**
     * Obtain a lock over a shared resource.
     *
     * If the lock is not immediately available, will call onLockFailure and terminate
     *
     * @param id
     * @param onLock
     * @param onLockFailure
     */
    tryLock: <T>(id: string, onLock: () => Promise<T>, onLockFailure: (e?: Error) => void) => Promise<T>;
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

/**
 * Utility function to pause for a given number of ms.
 */
export declare function pause(ms: number): Promise<void>;

declare function proxyLogger(logger: Logger, baseDirName: string): winston.Logger;

/**
 * A query object, to use with Datastore
 */
declare type Query = {
    [key: string]: string | number | DataQuery;
};

declare interface Record_2 {
    type: string;
    id: string;
    content: any;
    createdAt: Date;
}

/**
 * Set the Datastore implementation that Eventicle will use to persist in.
 */
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

/**
 * Bag of data that is associated with a given Transaction inside the Datastore.
 *
 * Datastore/ eventClient specific.   Can be added to by user code, but data inside it should be considered subject to
 * change between versions
 */
declare interface TransactionData {
    id: string;
    data: {
        [key: string]: any;
    };
}

/**
 * Datastore implementations that support Transactions will emit events on transaction start and commit.
 * This interface defines the listener for those interfaces.
 *
 * Notably, eventClient implementations register a TransactionListener in order to commit events after any local database is committed.
 */
declare interface TransactionListener {
    onStart: (data: TransactionData) => void;
    onCommit: (data: TransactionData) => void;
}

/**
 * Control whether a new Datastore transaction is required, and if so, if it should join an existing transaction or
 * create a new one to use.
 */
declare interface TransactionOptions {
    propagation: "requires" | "requires_new";
    /**
     * Not supported in all datastore implementations.
     */
    isolationLevel: "none" | "read-committed" | "repeatable-read" | "serializable";
}

export declare function withAPM(exec: (apm: ApmApi) => Promise<void>): Promise<void>;

export { }
