export type AuthInfo = {
  host: string,
  port: string,
  clusterName: string,
  user: string,
  password: string,
  database: string
}

export type Containers = {
  names: string[],
  total: Number,
  offset: Number,
  limit: Number
}

export type Container = {
  container_name: string,
  container_type: "COLLECTION" | "TIME_SERIES",
  rowkey: boolean,
  columns: Column[]
}

export type Column = {
  name: string,
  type: string,
  index: string[]
}

export type RowRequest = {
  offset: number,
  limit: number,
  condition: string,
  sort: string
}

export type DBError = {
  version: string,
  errorCode: Number,
  errorMessage: string
}

export const typeName =[
  {key: "STRING", label: "STRING"},
  {key: "INTEGER", label: "INTEGER"},
  {key: "BYTE", label: "BYTE"},
  {key: "SHORT", label: "SHORT"},
  {key: "LONG", label: "LONG"},
  {key: "FLOAT", label: "FLOAT"},
  {key: "DOUBLE", label: "DOUBLE"},
  {key: "TIMESTAMP", label: "TIMESTAMP"},
  {key: "GEOMETRY", label: "GEOMETRY"},
  {key: "BOOL", label: "BOOL"}
]