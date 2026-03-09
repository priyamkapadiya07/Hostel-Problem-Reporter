import { EventEmitter } from 'events';
import * as Promise from 'bluebird';
import * as Knex from 'knex';

export interface DriveOptions {

}

export interface SetupOptions {
  type : string;
  options : any;
  pool : {
    min: number;
    max: number;
  };
}

export interface QueryArgs {
  [key: string]: any;
}

export interface ResultRecord {
  [key: string]: any;
}

export type NoResultCallback = (err : Error) => void;

export type ResultRecordCallback = (err : Error, result : ResultRecord) => void;

export type ResultSetCallback = (err : Error, result : ResultRecord[]) => void;

export type QueryType = Knex.QueryBuilder | string;

interface DriverConstructor {
    new (hour: number, minute: number): Driver;
}

export interface Driver extends EventEmitter {
  constructor(key : string, options : DriveOptions) : Driver;
  connect(cb : NoResultCallback) : Driver;
  isConnected() : boolean;
  driverName() : string;
  loadScript(filePath : string, inTransaction : boolean, cb : NoResultCallback) : void;
  query(query : QueryType, cb : ResultSetCallback) : void;
  query(query : QueryType, args : QueryArgs, cb : ResultSetCallback) : void;
  queryOne(query : QueryType, cb : ResultRecordCallback) : void;
  queryOne(query : QueryType, args : QueryArgs, cb : ResultRecordCallback) : void;
  exec(query : QueryType, cb : NoResultCallback) : void;
  exec(query : QueryType, args : QueryArgs, cb : NoResultCallback) : void;
  begin(cb : NoResultCallback) : void;
  commit(cb : NoResultCallback) : void;
  rollback(cb : NoResultCallback) : void;
  disconnect(cb : NoResultCallback) : void;
  close(cb : NoResultCallback) : void;
  execScript(filePath : string, cb : NoResultCallback) : void;

  // promised-based API.
  connectAsync() : Promise<Driver>;
  queryAsync(query : QueryType) : Promise<ResultRecord[]>;
  queryAsync(query : QueryType, args : QueryArgs) : Promise<ResultRecord[]>;
  queryOneAsync(query : QueryType) : Promise<ResultRecord>;
  queryOneAsync(query : QueryType, args : QueryArgs) : Promise<ResultRecord>;
  execAsync(query : QueryType) : Promise<void>;
  execAsync(query : QueryType, args : QueryArgs) : Promise<void>;
  beginAsync() : Promise<void>;
  commitAsync() : Promise<void>;
  rollbackAsync() : Promise<void>;  
  disconnectAsync() : Promise<void>;
  closeAsync() : Promise<void>;
  execScriptAsync(filePath : string) : Promise<void>;

}

export function register(type : string, driver : DriverConstructor) : void;

export function getType(type : string) : DriverConstructor;

export function connect(name : string, cb : (err : Error, conn : Driver) => void) : void;

export function connectAsync(name : string) : Promise<Driver>;

export function setup(name : string, options : SetupOptions) : void;

