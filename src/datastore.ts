
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

interface DataQuery {
  value: string | number | [number, number] | string[] | {[key: string]: any}
  op: "EQ" | "LT" | "GT" | "LTE" | "GTE" | "BETWEEN" | "IN" | "OBJECT" | "LIKE"
}

export type Query = {
  [key: string]: string | number | DataQuery
}

interface DataSorting {
  [key:string]: 'ASC' | 'DESC'
}

interface TransactionOptions {
  propagation: "requires" | "requires_new"
}

interface TransactionListener {
  onStart: (data: TransactionData) => void
  onCommit: (data: TransactionData) => void
}

interface TransactionData {
  id: string
  data: {
    [key: string]: any
  }
}

interface DataStore {

  on(event: 'transaction.start', listener: (name: string, data: TransactionData) => void): this;
  on(event: 'transaction.commit', listener: (name: string, data: TransactionData) => void): this;

  /**
   * Bag of data associated with the current transaction
   */
  getTransactionData(): TransactionData
  hasTransactionData(): boolean

  transaction<T>(exec: () => Promise<T>, options?: TransactionOptions): Promise<T>;

  getEntity(workspaceId: string, type: string, id: string): Promise<Record>

  /**
   *
   * @param workspaceId
   * @param {*} type Entity type or "table" name
   * @param {*} query  Json object to match fields
   * @param sorting
   */
  findEntity(workspaceId: string, type: any, query: Query, sorting?: DataSorting): Promise<Record[]>

  /**
   *
   * @param workspaceId
   * @param {*} type Entity type or "table" name
   * @param {*} query  Json object to match fields
   * @param sorting
   * @param {*} page page count
   * @param {*} pageSize page size
   */
  findEntityPaginated(workspaceId: string, type: string, query: Query, sorting: DataSorting, page: number, pageSize: number): Promise<PagedRecords>

  /**
   *
   * @param workspaceId
   * @param type Entity type or "table" name
   * @param content
   */
  createEntity(workspaceId: string, type: string, content: any): Promise<Record>

  saveEntity(workspaceId: string, type: string, item: Record): Promise<Record>

  deleteEntity(workspaceId: string, type: string, id: string): Promise<void>

  deleteMany(workspaceId: string, type: string, query: Query): Promise<void>
}

let dataStoreModule: DataStore;


function setDataStore(dataStore: DataStore) {
  dataStoreModule = dataStore
}

function dataStore() {
  return dataStoreModule
}

export {
  dataStore, setDataStore, DataSorting, DataStore, DataQuery, Record, PagedRecords, TransactionData, TransactionOptions, TransactionListener
}
