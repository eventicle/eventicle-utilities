
interface PagedRecords {
  totalCount: number;
  pageInfo: {
    currentPage: number;
    pageSize: number;
  };
  entries: Record[]
}

interface Record {
  type: string
  id: string
  content: any
  createdAt: Date
}

/**
 * Allow querying against a single field.
 *
 * Will be mapped to a specific query technology by the underlying Datastore implementation.
 */
interface DataQuery {
  value: string | number | [number, number] | string[] | {[key: string]: any}
  op: "EQ" | "LT" | "GT" | "LTE" | "GTE" | "BETWEEN" | "IN" | "OBJECT" | "LIKE" | "INARRAY"
}

/**
 * A query object, to use with Datastore
 */
export type Query = {
  [key: string]: string | number | DataQuery
}

/**
 * Sort a {@link Query}
 */
interface DataSorting {
  [key:string]: 'ASC' | 'DESC'
}

/**
 * Control whether a new Datastore transaction is required, and if so, if it should join an existing transaction or
 * create a new one to use.
 */
interface TransactionOptions {
  propagation: "requires" | "requires_new"
}

/**
 * Datastore implementations that support Transactions will emit events on transaction start and commit.
 * This interface defines the listener for those interfaces.
 *
 * Notably, eventClient implementations register a TransactionListener in order to commit events after any local database is committed.
 */
interface TransactionListener {
  onStart: (data: TransactionData) => void
  onCommit: (data: TransactionData) => void
}

/**
 * Bag of data that is associated with a given Transaction inside the Datastore.
 *
 * Datastore/ eventClient specific.   Can be added to by user code, but data inside it should be considered subject to
 * change between versions
 */
interface TransactionData {
  id: string
  data: {
    [key: string]: any
  }
}

/**
 * Abstraction around data storage in the form of document style records.
 *
 * Eventicle contains a built in InMemoryDatastore. Others can be imported as needed.
 */
interface DataStore {

  on(event: 'transaction.start', listener: (name: string, data: TransactionData) => void): this;
  on(event: 'transaction.commit', listener: (name: string, data: TransactionData) => void): this;

  /**
   * Bag of data associated with the current transaction
   */
  getTransactionData(): TransactionData

  /**
   * Whether transaction data currently exists in this context.
   */
  hasTransactionData(): boolean

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
  getEntity(workspaceId: string, type: string, id: string): Promise<Record>

  /**
   * Find {@see Record} using a given {@link Query}, and optionally sort the results using a {@link DataSorting}
   *
   * @param workspaceId
   * @param {*} type Entity type or "table" name
   * @param {*} query  Json object to match fields
   * @param sorting
   */
  findEntity(workspaceId: string, type: any, query: Query, sorting?: DataSorting): Promise<Record[]>

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
  findEntityPaginated(workspaceId: string, type: string, query: Query, sorting: DataSorting, page: number, pageSize: number): Promise<PagedRecords>

  /**
   * Create a new entity in the datastore.
   *
   * @param workspaceId Tenant
   * @param type Entity type or "table" name
   * @param content
   */
  createEntity(workspaceId: string, type: string, content: any): Promise<Record>

  /**
   * Save updates an existing entity {@link Record}
   * @param workspaceId The tenant
   * @param type the record type
   * @param item The existing Record. Must have come from {@link DataStore#getEntity} or {@link DataStore#createEntity}
   */
  saveEntity(workspaceId: string, type: string, item: Record): Promise<Record>

  /**
   * Remove a single Record by its ID
   *
   * @param workspaceId The tenant
   * @param type the record type
   * @param id the id of the entity.
   */
  deleteEntity(workspaceId: string, type: string, id: string): Promise<void>

  /**
   * Delete multiple {@link Records} from the Datastore via a {@link Query} result
   *
   * @param workspaceId the tenant
   * @param type the Record type
   * @param query The query, any matching Records will be deleted.
   */
  deleteMany(workspaceId: string, type: string, query: Query): Promise<void>
}

let dataStoreModule: DataStore;

/**
 * Set the Datastore implementation that Eventicle will use to persist in.
 */
function setDataStore(dataStore: DataStore) {
  dataStoreModule = dataStore
}

/**
 * The current {@link Datastore} implementation that Eventicle uses for internal data.
 * Can be used by application code to obtain a reference if required.
 */
function dataStore() {
  return dataStoreModule
}

export {
  dataStore, setDataStore, DataSorting, DataStore, DataQuery, Record, PagedRecords, TransactionData, TransactionOptions, TransactionListener
}
