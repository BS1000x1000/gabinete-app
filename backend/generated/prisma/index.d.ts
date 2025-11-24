
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Rol
 * 
 */
export type Rol = $Result.DefaultSelection<Prisma.$RolPayload>
/**
 * Model Trabajador
 * 
 */
export type Trabajador = $Result.DefaultSelection<Prisma.$TrabajadorPayload>
/**
 * Model Colegio
 * 
 */
export type Colegio = $Result.DefaultSelection<Prisma.$ColegioPayload>
/**
 * Model Cliente
 * 
 */
export type Cliente = $Result.DefaultSelection<Prisma.$ClientePayload>
/**
 * Model ClienteTrabajador
 * 
 */
export type ClienteTrabajador = $Result.DefaultSelection<Prisma.$ClienteTrabajadorPayload>
/**
 * Model Horario
 * 
 */
export type Horario = $Result.DefaultSelection<Prisma.$HorarioPayload>
/**
 * Model Informe
 * 
 */
export type Informe = $Result.DefaultSelection<Prisma.$InformePayload>
/**
 * Model Familiar
 * 
 */
export type Familiar = $Result.DefaultSelection<Prisma.$FamiliarPayload>
/**
 * Model RegistroDiario
 * 
 */
export type RegistroDiario = $Result.DefaultSelection<Prisma.$RegistroDiarioPayload>
/**
 * Model Objetivo
 * 
 */
export type Objetivo = $Result.DefaultSelection<Prisma.$ObjetivoPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Rols
 * const rols = await prisma.rol.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Rols
   * const rols = await prisma.rol.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.rol`: Exposes CRUD operations for the **Rol** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rols
    * const rols = await prisma.rol.findMany()
    * ```
    */
  get rol(): Prisma.RolDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.trabajador`: Exposes CRUD operations for the **Trabajador** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Trabajadors
    * const trabajadors = await prisma.trabajador.findMany()
    * ```
    */
  get trabajador(): Prisma.TrabajadorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.colegio`: Exposes CRUD operations for the **Colegio** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Colegios
    * const colegios = await prisma.colegio.findMany()
    * ```
    */
  get colegio(): Prisma.ColegioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cliente`: Exposes CRUD operations for the **Cliente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clientes
    * const clientes = await prisma.cliente.findMany()
    * ```
    */
  get cliente(): Prisma.ClienteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.clienteTrabajador`: Exposes CRUD operations for the **ClienteTrabajador** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClienteTrabajadors
    * const clienteTrabajadors = await prisma.clienteTrabajador.findMany()
    * ```
    */
  get clienteTrabajador(): Prisma.ClienteTrabajadorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.horario`: Exposes CRUD operations for the **Horario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Horarios
    * const horarios = await prisma.horario.findMany()
    * ```
    */
  get horario(): Prisma.HorarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.informe`: Exposes CRUD operations for the **Informe** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Informes
    * const informes = await prisma.informe.findMany()
    * ```
    */
  get informe(): Prisma.InformeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.familiar`: Exposes CRUD operations for the **Familiar** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Familiars
    * const familiars = await prisma.familiar.findMany()
    * ```
    */
  get familiar(): Prisma.FamiliarDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.registroDiario`: Exposes CRUD operations for the **RegistroDiario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RegistroDiarios
    * const registroDiarios = await prisma.registroDiario.findMany()
    * ```
    */
  get registroDiario(): Prisma.RegistroDiarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.objetivo`: Exposes CRUD operations for the **Objetivo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Objetivos
    * const objetivos = await prisma.objetivo.findMany()
    * ```
    */
  get objetivo(): Prisma.ObjetivoDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.0.0
   * Query Engine version: 0c19ccc313cf9911a90d99d2ac2eb0280c76c513
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Rol: 'Rol',
    Trabajador: 'Trabajador',
    Colegio: 'Colegio',
    Cliente: 'Cliente',
    ClienteTrabajador: 'ClienteTrabajador',
    Horario: 'Horario',
    Informe: 'Informe',
    Familiar: 'Familiar',
    RegistroDiario: 'RegistroDiario',
    Objetivo: 'Objetivo'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "rol" | "trabajador" | "colegio" | "cliente" | "clienteTrabajador" | "horario" | "informe" | "familiar" | "registroDiario" | "objetivo"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Rol: {
        payload: Prisma.$RolPayload<ExtArgs>
        fields: Prisma.RolFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RolFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RolFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>
          }
          findFirst: {
            args: Prisma.RolFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RolFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>
          }
          findMany: {
            args: Prisma.RolFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>[]
          }
          create: {
            args: Prisma.RolCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>
          }
          createMany: {
            args: Prisma.RolCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RolCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>[]
          }
          delete: {
            args: Prisma.RolDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>
          }
          update: {
            args: Prisma.RolUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>
          }
          deleteMany: {
            args: Prisma.RolDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RolUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RolUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>[]
          }
          upsert: {
            args: Prisma.RolUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolPayload>
          }
          aggregate: {
            args: Prisma.RolAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRol>
          }
          groupBy: {
            args: Prisma.RolGroupByArgs<ExtArgs>
            result: $Utils.Optional<RolGroupByOutputType>[]
          }
          count: {
            args: Prisma.RolCountArgs<ExtArgs>
            result: $Utils.Optional<RolCountAggregateOutputType> | number
          }
        }
      }
      Trabajador: {
        payload: Prisma.$TrabajadorPayload<ExtArgs>
        fields: Prisma.TrabajadorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TrabajadorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TrabajadorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>
          }
          findFirst: {
            args: Prisma.TrabajadorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TrabajadorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>
          }
          findMany: {
            args: Prisma.TrabajadorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>[]
          }
          create: {
            args: Prisma.TrabajadorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>
          }
          createMany: {
            args: Prisma.TrabajadorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TrabajadorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>[]
          }
          delete: {
            args: Prisma.TrabajadorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>
          }
          update: {
            args: Prisma.TrabajadorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>
          }
          deleteMany: {
            args: Prisma.TrabajadorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TrabajadorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TrabajadorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>[]
          }
          upsert: {
            args: Prisma.TrabajadorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TrabajadorPayload>
          }
          aggregate: {
            args: Prisma.TrabajadorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrabajador>
          }
          groupBy: {
            args: Prisma.TrabajadorGroupByArgs<ExtArgs>
            result: $Utils.Optional<TrabajadorGroupByOutputType>[]
          }
          count: {
            args: Prisma.TrabajadorCountArgs<ExtArgs>
            result: $Utils.Optional<TrabajadorCountAggregateOutputType> | number
          }
        }
      }
      Colegio: {
        payload: Prisma.$ColegioPayload<ExtArgs>
        fields: Prisma.ColegioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ColegioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ColegioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>
          }
          findFirst: {
            args: Prisma.ColegioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ColegioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>
          }
          findMany: {
            args: Prisma.ColegioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>[]
          }
          create: {
            args: Prisma.ColegioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>
          }
          createMany: {
            args: Prisma.ColegioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ColegioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>[]
          }
          delete: {
            args: Prisma.ColegioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>
          }
          update: {
            args: Prisma.ColegioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>
          }
          deleteMany: {
            args: Prisma.ColegioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ColegioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ColegioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>[]
          }
          upsert: {
            args: Prisma.ColegioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ColegioPayload>
          }
          aggregate: {
            args: Prisma.ColegioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateColegio>
          }
          groupBy: {
            args: Prisma.ColegioGroupByArgs<ExtArgs>
            result: $Utils.Optional<ColegioGroupByOutputType>[]
          }
          count: {
            args: Prisma.ColegioCountArgs<ExtArgs>
            result: $Utils.Optional<ColegioCountAggregateOutputType> | number
          }
        }
      }
      Cliente: {
        payload: Prisma.$ClientePayload<ExtArgs>
        fields: Prisma.ClienteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClienteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClienteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findFirst: {
            args: Prisma.ClienteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClienteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findMany: {
            args: Prisma.ClienteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          create: {
            args: Prisma.ClienteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          createMany: {
            args: Prisma.ClienteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClienteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          delete: {
            args: Prisma.ClienteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          update: {
            args: Prisma.ClienteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          deleteMany: {
            args: Prisma.ClienteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClienteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClienteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          upsert: {
            args: Prisma.ClienteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          aggregate: {
            args: Prisma.ClienteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCliente>
          }
          groupBy: {
            args: Prisma.ClienteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClienteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClienteCountArgs<ExtArgs>
            result: $Utils.Optional<ClienteCountAggregateOutputType> | number
          }
        }
      }
      ClienteTrabajador: {
        payload: Prisma.$ClienteTrabajadorPayload<ExtArgs>
        fields: Prisma.ClienteTrabajadorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClienteTrabajadorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClienteTrabajadorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>
          }
          findFirst: {
            args: Prisma.ClienteTrabajadorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClienteTrabajadorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>
          }
          findMany: {
            args: Prisma.ClienteTrabajadorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>[]
          }
          create: {
            args: Prisma.ClienteTrabajadorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>
          }
          createMany: {
            args: Prisma.ClienteTrabajadorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClienteTrabajadorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>[]
          }
          delete: {
            args: Prisma.ClienteTrabajadorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>
          }
          update: {
            args: Prisma.ClienteTrabajadorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>
          }
          deleteMany: {
            args: Prisma.ClienteTrabajadorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClienteTrabajadorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClienteTrabajadorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>[]
          }
          upsert: {
            args: Prisma.ClienteTrabajadorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClienteTrabajadorPayload>
          }
          aggregate: {
            args: Prisma.ClienteTrabajadorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClienteTrabajador>
          }
          groupBy: {
            args: Prisma.ClienteTrabajadorGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClienteTrabajadorGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClienteTrabajadorCountArgs<ExtArgs>
            result: $Utils.Optional<ClienteTrabajadorCountAggregateOutputType> | number
          }
        }
      }
      Horario: {
        payload: Prisma.$HorarioPayload<ExtArgs>
        fields: Prisma.HorarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.HorarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.HorarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>
          }
          findFirst: {
            args: Prisma.HorarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.HorarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>
          }
          findMany: {
            args: Prisma.HorarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>[]
          }
          create: {
            args: Prisma.HorarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>
          }
          createMany: {
            args: Prisma.HorarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.HorarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>[]
          }
          delete: {
            args: Prisma.HorarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>
          }
          update: {
            args: Prisma.HorarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>
          }
          deleteMany: {
            args: Prisma.HorarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.HorarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.HorarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>[]
          }
          upsert: {
            args: Prisma.HorarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$HorarioPayload>
          }
          aggregate: {
            args: Prisma.HorarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateHorario>
          }
          groupBy: {
            args: Prisma.HorarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<HorarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.HorarioCountArgs<ExtArgs>
            result: $Utils.Optional<HorarioCountAggregateOutputType> | number
          }
        }
      }
      Informe: {
        payload: Prisma.$InformePayload<ExtArgs>
        fields: Prisma.InformeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InformeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InformeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>
          }
          findFirst: {
            args: Prisma.InformeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InformeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>
          }
          findMany: {
            args: Prisma.InformeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>[]
          }
          create: {
            args: Prisma.InformeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>
          }
          createMany: {
            args: Prisma.InformeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InformeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>[]
          }
          delete: {
            args: Prisma.InformeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>
          }
          update: {
            args: Prisma.InformeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>
          }
          deleteMany: {
            args: Prisma.InformeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InformeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InformeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>[]
          }
          upsert: {
            args: Prisma.InformeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InformePayload>
          }
          aggregate: {
            args: Prisma.InformeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInforme>
          }
          groupBy: {
            args: Prisma.InformeGroupByArgs<ExtArgs>
            result: $Utils.Optional<InformeGroupByOutputType>[]
          }
          count: {
            args: Prisma.InformeCountArgs<ExtArgs>
            result: $Utils.Optional<InformeCountAggregateOutputType> | number
          }
        }
      }
      Familiar: {
        payload: Prisma.$FamiliarPayload<ExtArgs>
        fields: Prisma.FamiliarFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FamiliarFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FamiliarFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>
          }
          findFirst: {
            args: Prisma.FamiliarFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FamiliarFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>
          }
          findMany: {
            args: Prisma.FamiliarFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>[]
          }
          create: {
            args: Prisma.FamiliarCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>
          }
          createMany: {
            args: Prisma.FamiliarCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FamiliarCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>[]
          }
          delete: {
            args: Prisma.FamiliarDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>
          }
          update: {
            args: Prisma.FamiliarUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>
          }
          deleteMany: {
            args: Prisma.FamiliarDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FamiliarUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FamiliarUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>[]
          }
          upsert: {
            args: Prisma.FamiliarUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FamiliarPayload>
          }
          aggregate: {
            args: Prisma.FamiliarAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFamiliar>
          }
          groupBy: {
            args: Prisma.FamiliarGroupByArgs<ExtArgs>
            result: $Utils.Optional<FamiliarGroupByOutputType>[]
          }
          count: {
            args: Prisma.FamiliarCountArgs<ExtArgs>
            result: $Utils.Optional<FamiliarCountAggregateOutputType> | number
          }
        }
      }
      RegistroDiario: {
        payload: Prisma.$RegistroDiarioPayload<ExtArgs>
        fields: Prisma.RegistroDiarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RegistroDiarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RegistroDiarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>
          }
          findFirst: {
            args: Prisma.RegistroDiarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RegistroDiarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>
          }
          findMany: {
            args: Prisma.RegistroDiarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>[]
          }
          create: {
            args: Prisma.RegistroDiarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>
          }
          createMany: {
            args: Prisma.RegistroDiarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RegistroDiarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>[]
          }
          delete: {
            args: Prisma.RegistroDiarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>
          }
          update: {
            args: Prisma.RegistroDiarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>
          }
          deleteMany: {
            args: Prisma.RegistroDiarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RegistroDiarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RegistroDiarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>[]
          }
          upsert: {
            args: Prisma.RegistroDiarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RegistroDiarioPayload>
          }
          aggregate: {
            args: Prisma.RegistroDiarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRegistroDiario>
          }
          groupBy: {
            args: Prisma.RegistroDiarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<RegistroDiarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.RegistroDiarioCountArgs<ExtArgs>
            result: $Utils.Optional<RegistroDiarioCountAggregateOutputType> | number
          }
        }
      }
      Objetivo: {
        payload: Prisma.$ObjetivoPayload<ExtArgs>
        fields: Prisma.ObjetivoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ObjetivoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ObjetivoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          findFirst: {
            args: Prisma.ObjetivoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ObjetivoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          findMany: {
            args: Prisma.ObjetivoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>[]
          }
          create: {
            args: Prisma.ObjetivoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          createMany: {
            args: Prisma.ObjetivoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ObjetivoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>[]
          }
          delete: {
            args: Prisma.ObjetivoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          update: {
            args: Prisma.ObjetivoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          deleteMany: {
            args: Prisma.ObjetivoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ObjetivoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ObjetivoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>[]
          }
          upsert: {
            args: Prisma.ObjetivoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ObjetivoPayload>
          }
          aggregate: {
            args: Prisma.ObjetivoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateObjetivo>
          }
          groupBy: {
            args: Prisma.ObjetivoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ObjetivoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ObjetivoCountArgs<ExtArgs>
            result: $Utils.Optional<ObjetivoCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    rol?: RolOmit
    trabajador?: TrabajadorOmit
    colegio?: ColegioOmit
    cliente?: ClienteOmit
    clienteTrabajador?: ClienteTrabajadorOmit
    horario?: HorarioOmit
    informe?: InformeOmit
    familiar?: FamiliarOmit
    registroDiario?: RegistroDiarioOmit
    objetivo?: ObjetivoOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type RolCountOutputType
   */

  export type RolCountOutputType = {
    trabajadores: number
  }

  export type RolCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trabajadores?: boolean | RolCountOutputTypeCountTrabajadoresArgs
  }

  // Custom InputTypes
  /**
   * RolCountOutputType without action
   */
  export type RolCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolCountOutputType
     */
    select?: RolCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RolCountOutputType without action
   */
  export type RolCountOutputTypeCountTrabajadoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrabajadorWhereInput
  }


  /**
   * Count Type TrabajadorCountOutputType
   */

  export type TrabajadorCountOutputType = {
    clientesAsignados: number
    horarios: number
    informes: number
    registrosCreados: number
    objetivosAsignados: number
  }

  export type TrabajadorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clientesAsignados?: boolean | TrabajadorCountOutputTypeCountClientesAsignadosArgs
    horarios?: boolean | TrabajadorCountOutputTypeCountHorariosArgs
    informes?: boolean | TrabajadorCountOutputTypeCountInformesArgs
    registrosCreados?: boolean | TrabajadorCountOutputTypeCountRegistrosCreadosArgs
    objetivosAsignados?: boolean | TrabajadorCountOutputTypeCountObjetivosAsignadosArgs
  }

  // Custom InputTypes
  /**
   * TrabajadorCountOutputType without action
   */
  export type TrabajadorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TrabajadorCountOutputType
     */
    select?: TrabajadorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TrabajadorCountOutputType without action
   */
  export type TrabajadorCountOutputTypeCountClientesAsignadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteTrabajadorWhereInput
  }

  /**
   * TrabajadorCountOutputType without action
   */
  export type TrabajadorCountOutputTypeCountHorariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HorarioWhereInput
  }

  /**
   * TrabajadorCountOutputType without action
   */
  export type TrabajadorCountOutputTypeCountInformesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InformeWhereInput
  }

  /**
   * TrabajadorCountOutputType without action
   */
  export type TrabajadorCountOutputTypeCountRegistrosCreadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroDiarioWhereInput
  }

  /**
   * TrabajadorCountOutputType without action
   */
  export type TrabajadorCountOutputTypeCountObjetivosAsignadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoWhereInput
  }


  /**
   * Count Type ColegioCountOutputType
   */

  export type ColegioCountOutputType = {
    clientes: number
  }

  export type ColegioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clientes?: boolean | ColegioCountOutputTypeCountClientesArgs
  }

  // Custom InputTypes
  /**
   * ColegioCountOutputType without action
   */
  export type ColegioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ColegioCountOutputType
     */
    select?: ColegioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ColegioCountOutputType without action
   */
  export type ColegioCountOutputTypeCountClientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteWhereInput
  }


  /**
   * Count Type ClienteCountOutputType
   */

  export type ClienteCountOutputType = {
    trabajadoresAsignados: number
    horarios: number
    informes: number
    contactosFamiliares: number
    registrosDiarios: number
    objetivos: number
  }

  export type ClienteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trabajadoresAsignados?: boolean | ClienteCountOutputTypeCountTrabajadoresAsignadosArgs
    horarios?: boolean | ClienteCountOutputTypeCountHorariosArgs
    informes?: boolean | ClienteCountOutputTypeCountInformesArgs
    contactosFamiliares?: boolean | ClienteCountOutputTypeCountContactosFamiliaresArgs
    registrosDiarios?: boolean | ClienteCountOutputTypeCountRegistrosDiariosArgs
    objetivos?: boolean | ClienteCountOutputTypeCountObjetivosArgs
  }

  // Custom InputTypes
  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteCountOutputType
     */
    select?: ClienteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountTrabajadoresAsignadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteTrabajadorWhereInput
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountHorariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HorarioWhereInput
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountInformesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InformeWhereInput
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountContactosFamiliaresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FamiliarWhereInput
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountRegistrosDiariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroDiarioWhereInput
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountObjetivosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Rol
   */

  export type AggregateRol = {
    _count: RolCountAggregateOutputType | null
    _min: RolMinAggregateOutputType | null
    _max: RolMaxAggregateOutputType | null
  }

  export type RolMinAggregateOutputType = {
    id: string | null
    nombreRol: string | null
    codigo: string | null
    descripcion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RolMaxAggregateOutputType = {
    id: string | null
    nombreRol: string | null
    codigo: string | null
    descripcion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RolCountAggregateOutputType = {
    id: number
    nombreRol: number
    codigo: number
    descripcion: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RolMinAggregateInputType = {
    id?: true
    nombreRol?: true
    codigo?: true
    descripcion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RolMaxAggregateInputType = {
    id?: true
    nombreRol?: true
    codigo?: true
    descripcion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RolCountAggregateInputType = {
    id?: true
    nombreRol?: true
    codigo?: true
    descripcion?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RolAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rol to aggregate.
     */
    where?: RolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rols to fetch.
     */
    orderBy?: RolOrderByWithRelationInput | RolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rols
    **/
    _count?: true | RolCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RolMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RolMaxAggregateInputType
  }

  export type GetRolAggregateType<T extends RolAggregateArgs> = {
        [P in keyof T & keyof AggregateRol]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRol[P]>
      : GetScalarType<T[P], AggregateRol[P]>
  }




  export type RolGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolWhereInput
    orderBy?: RolOrderByWithAggregationInput | RolOrderByWithAggregationInput[]
    by: RolScalarFieldEnum[] | RolScalarFieldEnum
    having?: RolScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RolCountAggregateInputType | true
    _min?: RolMinAggregateInputType
    _max?: RolMaxAggregateInputType
  }

  export type RolGroupByOutputType = {
    id: string
    nombreRol: string
    codigo: string
    descripcion: string | null
    createdAt: Date
    updatedAt: Date
    _count: RolCountAggregateOutputType | null
    _min: RolMinAggregateOutputType | null
    _max: RolMaxAggregateOutputType | null
  }

  type GetRolGroupByPayload<T extends RolGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RolGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RolGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RolGroupByOutputType[P]>
            : GetScalarType<T[P], RolGroupByOutputType[P]>
        }
      >
    >


  export type RolSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreRol?: boolean
    codigo?: boolean
    descripcion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    trabajadores?: boolean | Rol$trabajadoresArgs<ExtArgs>
    _count?: boolean | RolCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rol"]>

  export type RolSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreRol?: boolean
    codigo?: boolean
    descripcion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["rol"]>

  export type RolSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreRol?: boolean
    codigo?: boolean
    descripcion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["rol"]>

  export type RolSelectScalar = {
    id?: boolean
    nombreRol?: boolean
    codigo?: boolean
    descripcion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RolOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombreRol" | "codigo" | "descripcion" | "createdAt" | "updatedAt", ExtArgs["result"]["rol"]>
  export type RolInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trabajadores?: boolean | Rol$trabajadoresArgs<ExtArgs>
    _count?: boolean | RolCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RolIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RolIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RolPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Rol"
    objects: {
      trabajadores: Prisma.$TrabajadorPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nombreRol: string
      codigo: string
      descripcion: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["rol"]>
    composites: {}
  }

  type RolGetPayload<S extends boolean | null | undefined | RolDefaultArgs> = $Result.GetResult<Prisma.$RolPayload, S>

  type RolCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RolFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RolCountAggregateInputType | true
    }

  export interface RolDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Rol'], meta: { name: 'Rol' } }
    /**
     * Find zero or one Rol that matches the filter.
     * @param {RolFindUniqueArgs} args - Arguments to find a Rol
     * @example
     * // Get one Rol
     * const rol = await prisma.rol.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RolFindUniqueArgs>(args: SelectSubset<T, RolFindUniqueArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Rol that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RolFindUniqueOrThrowArgs} args - Arguments to find a Rol
     * @example
     * // Get one Rol
     * const rol = await prisma.rol.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RolFindUniqueOrThrowArgs>(args: SelectSubset<T, RolFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rol that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolFindFirstArgs} args - Arguments to find a Rol
     * @example
     * // Get one Rol
     * const rol = await prisma.rol.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RolFindFirstArgs>(args?: SelectSubset<T, RolFindFirstArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Rol that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolFindFirstOrThrowArgs} args - Arguments to find a Rol
     * @example
     * // Get one Rol
     * const rol = await prisma.rol.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RolFindFirstOrThrowArgs>(args?: SelectSubset<T, RolFindFirstOrThrowArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rols that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rols
     * const rols = await prisma.rol.findMany()
     * 
     * // Get first 10 Rols
     * const rols = await prisma.rol.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rolWithIdOnly = await prisma.rol.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RolFindManyArgs>(args?: SelectSubset<T, RolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Rol.
     * @param {RolCreateArgs} args - Arguments to create a Rol.
     * @example
     * // Create one Rol
     * const Rol = await prisma.rol.create({
     *   data: {
     *     // ... data to create a Rol
     *   }
     * })
     * 
     */
    create<T extends RolCreateArgs>(args: SelectSubset<T, RolCreateArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rols.
     * @param {RolCreateManyArgs} args - Arguments to create many Rols.
     * @example
     * // Create many Rols
     * const rol = await prisma.rol.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RolCreateManyArgs>(args?: SelectSubset<T, RolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rols and returns the data saved in the database.
     * @param {RolCreateManyAndReturnArgs} args - Arguments to create many Rols.
     * @example
     * // Create many Rols
     * const rol = await prisma.rol.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rols and only return the `id`
     * const rolWithIdOnly = await prisma.rol.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RolCreateManyAndReturnArgs>(args?: SelectSubset<T, RolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Rol.
     * @param {RolDeleteArgs} args - Arguments to delete one Rol.
     * @example
     * // Delete one Rol
     * const Rol = await prisma.rol.delete({
     *   where: {
     *     // ... filter to delete one Rol
     *   }
     * })
     * 
     */
    delete<T extends RolDeleteArgs>(args: SelectSubset<T, RolDeleteArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Rol.
     * @param {RolUpdateArgs} args - Arguments to update one Rol.
     * @example
     * // Update one Rol
     * const rol = await prisma.rol.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RolUpdateArgs>(args: SelectSubset<T, RolUpdateArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rols.
     * @param {RolDeleteManyArgs} args - Arguments to filter Rols to delete.
     * @example
     * // Delete a few Rols
     * const { count } = await prisma.rol.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RolDeleteManyArgs>(args?: SelectSubset<T, RolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rols.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rols
     * const rol = await prisma.rol.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RolUpdateManyArgs>(args: SelectSubset<T, RolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rols and returns the data updated in the database.
     * @param {RolUpdateManyAndReturnArgs} args - Arguments to update many Rols.
     * @example
     * // Update many Rols
     * const rol = await prisma.rol.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rols and only return the `id`
     * const rolWithIdOnly = await prisma.rol.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RolUpdateManyAndReturnArgs>(args: SelectSubset<T, RolUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Rol.
     * @param {RolUpsertArgs} args - Arguments to update or create a Rol.
     * @example
     * // Update or create a Rol
     * const rol = await prisma.rol.upsert({
     *   create: {
     *     // ... data to create a Rol
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Rol we want to update
     *   }
     * })
     */
    upsert<T extends RolUpsertArgs>(args: SelectSubset<T, RolUpsertArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rols.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolCountArgs} args - Arguments to filter Rols to count.
     * @example
     * // Count the number of Rols
     * const count = await prisma.rol.count({
     *   where: {
     *     // ... the filter for the Rols we want to count
     *   }
     * })
    **/
    count<T extends RolCountArgs>(
      args?: Subset<T, RolCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RolCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Rol.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RolAggregateArgs>(args: Subset<T, RolAggregateArgs>): Prisma.PrismaPromise<GetRolAggregateType<T>>

    /**
     * Group by Rol.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RolGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RolGroupByArgs['orderBy'] }
        : { orderBy?: RolGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Rol model
   */
  readonly fields: RolFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Rol.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RolClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trabajadores<T extends Rol$trabajadoresArgs<ExtArgs> = {}>(args?: Subset<T, Rol$trabajadoresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Rol model
   */
  interface RolFieldRefs {
    readonly id: FieldRef<"Rol", 'String'>
    readonly nombreRol: FieldRef<"Rol", 'String'>
    readonly codigo: FieldRef<"Rol", 'String'>
    readonly descripcion: FieldRef<"Rol", 'String'>
    readonly createdAt: FieldRef<"Rol", 'DateTime'>
    readonly updatedAt: FieldRef<"Rol", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Rol findUnique
   */
  export type RolFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * Filter, which Rol to fetch.
     */
    where: RolWhereUniqueInput
  }

  /**
   * Rol findUniqueOrThrow
   */
  export type RolFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * Filter, which Rol to fetch.
     */
    where: RolWhereUniqueInput
  }

  /**
   * Rol findFirst
   */
  export type RolFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * Filter, which Rol to fetch.
     */
    where?: RolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rols to fetch.
     */
    orderBy?: RolOrderByWithRelationInput | RolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rols.
     */
    cursor?: RolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rols.
     */
    distinct?: RolScalarFieldEnum | RolScalarFieldEnum[]
  }

  /**
   * Rol findFirstOrThrow
   */
  export type RolFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * Filter, which Rol to fetch.
     */
    where?: RolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rols to fetch.
     */
    orderBy?: RolOrderByWithRelationInput | RolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rols.
     */
    cursor?: RolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rols.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rols.
     */
    distinct?: RolScalarFieldEnum | RolScalarFieldEnum[]
  }

  /**
   * Rol findMany
   */
  export type RolFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * Filter, which Rols to fetch.
     */
    where?: RolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rols to fetch.
     */
    orderBy?: RolOrderByWithRelationInput | RolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rols.
     */
    cursor?: RolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rols from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rols.
     */
    skip?: number
    distinct?: RolScalarFieldEnum | RolScalarFieldEnum[]
  }

  /**
   * Rol create
   */
  export type RolCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * The data needed to create a Rol.
     */
    data: XOR<RolCreateInput, RolUncheckedCreateInput>
  }

  /**
   * Rol createMany
   */
  export type RolCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rols.
     */
    data: RolCreateManyInput | RolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Rol createManyAndReturn
   */
  export type RolCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * The data used to create many Rols.
     */
    data: RolCreateManyInput | RolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Rol update
   */
  export type RolUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * The data needed to update a Rol.
     */
    data: XOR<RolUpdateInput, RolUncheckedUpdateInput>
    /**
     * Choose, which Rol to update.
     */
    where: RolWhereUniqueInput
  }

  /**
   * Rol updateMany
   */
  export type RolUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rols.
     */
    data: XOR<RolUpdateManyMutationInput, RolUncheckedUpdateManyInput>
    /**
     * Filter which Rols to update
     */
    where?: RolWhereInput
    /**
     * Limit how many Rols to update.
     */
    limit?: number
  }

  /**
   * Rol updateManyAndReturn
   */
  export type RolUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * The data used to update Rols.
     */
    data: XOR<RolUpdateManyMutationInput, RolUncheckedUpdateManyInput>
    /**
     * Filter which Rols to update
     */
    where?: RolWhereInput
    /**
     * Limit how many Rols to update.
     */
    limit?: number
  }

  /**
   * Rol upsert
   */
  export type RolUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * The filter to search for the Rol to update in case it exists.
     */
    where: RolWhereUniqueInput
    /**
     * In case the Rol found by the `where` argument doesn't exist, create a new Rol with this data.
     */
    create: XOR<RolCreateInput, RolUncheckedCreateInput>
    /**
     * In case the Rol was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RolUpdateInput, RolUncheckedUpdateInput>
  }

  /**
   * Rol delete
   */
  export type RolDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
    /**
     * Filter which Rol to delete.
     */
    where: RolWhereUniqueInput
  }

  /**
   * Rol deleteMany
   */
  export type RolDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rols to delete
     */
    where?: RolWhereInput
    /**
     * Limit how many Rols to delete.
     */
    limit?: number
  }

  /**
   * Rol.trabajadores
   */
  export type Rol$trabajadoresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    where?: TrabajadorWhereInput
    orderBy?: TrabajadorOrderByWithRelationInput | TrabajadorOrderByWithRelationInput[]
    cursor?: TrabajadorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TrabajadorScalarFieldEnum | TrabajadorScalarFieldEnum[]
  }

  /**
   * Rol without action
   */
  export type RolDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Rol
     */
    select?: RolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Rol
     */
    omit?: RolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolInclude<ExtArgs> | null
  }


  /**
   * Model Trabajador
   */

  export type AggregateTrabajador = {
    _count: TrabajadorCountAggregateOutputType | null
    _min: TrabajadorMinAggregateOutputType | null
    _max: TrabajadorMaxAggregateOutputType | null
  }

  export type TrabajadorMinAggregateOutputType = {
    id: string | null
    username: string | null
    passwordHash: string | null
    nombre: string | null
    apellidos: string | null
    email: string | null
    telefono: string | null
    img: string | null
    fechaContratacion: Date | null
    activo: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    rolId: string | null
  }

  export type TrabajadorMaxAggregateOutputType = {
    id: string | null
    username: string | null
    passwordHash: string | null
    nombre: string | null
    apellidos: string | null
    email: string | null
    telefono: string | null
    img: string | null
    fechaContratacion: Date | null
    activo: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    rolId: string | null
  }

  export type TrabajadorCountAggregateOutputType = {
    id: number
    username: number
    passwordHash: number
    nombre: number
    apellidos: number
    email: number
    telefono: number
    img: number
    fechaContratacion: number
    activo: number
    createdAt: number
    updatedAt: number
    rolId: number
    _all: number
  }


  export type TrabajadorMinAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    nombre?: true
    apellidos?: true
    email?: true
    telefono?: true
    img?: true
    fechaContratacion?: true
    activo?: true
    createdAt?: true
    updatedAt?: true
    rolId?: true
  }

  export type TrabajadorMaxAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    nombre?: true
    apellidos?: true
    email?: true
    telefono?: true
    img?: true
    fechaContratacion?: true
    activo?: true
    createdAt?: true
    updatedAt?: true
    rolId?: true
  }

  export type TrabajadorCountAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    nombre?: true
    apellidos?: true
    email?: true
    telefono?: true
    img?: true
    fechaContratacion?: true
    activo?: true
    createdAt?: true
    updatedAt?: true
    rolId?: true
    _all?: true
  }

  export type TrabajadorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trabajador to aggregate.
     */
    where?: TrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trabajadors to fetch.
     */
    orderBy?: TrabajadorOrderByWithRelationInput | TrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trabajadors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Trabajadors
    **/
    _count?: true | TrabajadorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrabajadorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrabajadorMaxAggregateInputType
  }

  export type GetTrabajadorAggregateType<T extends TrabajadorAggregateArgs> = {
        [P in keyof T & keyof AggregateTrabajador]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrabajador[P]>
      : GetScalarType<T[P], AggregateTrabajador[P]>
  }




  export type TrabajadorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TrabajadorWhereInput
    orderBy?: TrabajadorOrderByWithAggregationInput | TrabajadorOrderByWithAggregationInput[]
    by: TrabajadorScalarFieldEnum[] | TrabajadorScalarFieldEnum
    having?: TrabajadorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrabajadorCountAggregateInputType | true
    _min?: TrabajadorMinAggregateInputType
    _max?: TrabajadorMaxAggregateInputType
  }

  export type TrabajadorGroupByOutputType = {
    id: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono: string | null
    img: string | null
    fechaContratacion: Date | null
    activo: boolean
    createdAt: Date
    updatedAt: Date
    rolId: string
    _count: TrabajadorCountAggregateOutputType | null
    _min: TrabajadorMinAggregateOutputType | null
    _max: TrabajadorMaxAggregateOutputType | null
  }

  type GetTrabajadorGroupByPayload<T extends TrabajadorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TrabajadorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrabajadorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrabajadorGroupByOutputType[P]>
            : GetScalarType<T[P], TrabajadorGroupByOutputType[P]>
        }
      >
    >


  export type TrabajadorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    nombre?: boolean
    apellidos?: boolean
    email?: boolean
    telefono?: boolean
    img?: boolean
    fechaContratacion?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rolId?: boolean
    rol?: boolean | RolDefaultArgs<ExtArgs>
    clientesAsignados?: boolean | Trabajador$clientesAsignadosArgs<ExtArgs>
    horarios?: boolean | Trabajador$horariosArgs<ExtArgs>
    informes?: boolean | Trabajador$informesArgs<ExtArgs>
    registrosCreados?: boolean | Trabajador$registrosCreadosArgs<ExtArgs>
    objetivosAsignados?: boolean | Trabajador$objetivosAsignadosArgs<ExtArgs>
    _count?: boolean | TrabajadorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trabajador"]>

  export type TrabajadorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    nombre?: boolean
    apellidos?: boolean
    email?: boolean
    telefono?: boolean
    img?: boolean
    fechaContratacion?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rolId?: boolean
    rol?: boolean | RolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trabajador"]>

  export type TrabajadorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    nombre?: boolean
    apellidos?: boolean
    email?: boolean
    telefono?: boolean
    img?: boolean
    fechaContratacion?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rolId?: boolean
    rol?: boolean | RolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trabajador"]>

  export type TrabajadorSelectScalar = {
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    nombre?: boolean
    apellidos?: boolean
    email?: boolean
    telefono?: boolean
    img?: boolean
    fechaContratacion?: boolean
    activo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    rolId?: boolean
  }

  export type TrabajadorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "passwordHash" | "nombre" | "apellidos" | "email" | "telefono" | "img" | "fechaContratacion" | "activo" | "createdAt" | "updatedAt" | "rolId", ExtArgs["result"]["trabajador"]>
  export type TrabajadorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rol?: boolean | RolDefaultArgs<ExtArgs>
    clientesAsignados?: boolean | Trabajador$clientesAsignadosArgs<ExtArgs>
    horarios?: boolean | Trabajador$horariosArgs<ExtArgs>
    informes?: boolean | Trabajador$informesArgs<ExtArgs>
    registrosCreados?: boolean | Trabajador$registrosCreadosArgs<ExtArgs>
    objetivosAsignados?: boolean | Trabajador$objetivosAsignadosArgs<ExtArgs>
    _count?: boolean | TrabajadorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TrabajadorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rol?: boolean | RolDefaultArgs<ExtArgs>
  }
  export type TrabajadorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    rol?: boolean | RolDefaultArgs<ExtArgs>
  }

  export type $TrabajadorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Trabajador"
    objects: {
      rol: Prisma.$RolPayload<ExtArgs>
      clientesAsignados: Prisma.$ClienteTrabajadorPayload<ExtArgs>[]
      horarios: Prisma.$HorarioPayload<ExtArgs>[]
      informes: Prisma.$InformePayload<ExtArgs>[]
      registrosCreados: Prisma.$RegistroDiarioPayload<ExtArgs>[]
      objetivosAsignados: Prisma.$ObjetivoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      username: string
      passwordHash: string
      nombre: string
      apellidos: string
      email: string
      telefono: string | null
      img: string | null
      fechaContratacion: Date | null
      activo: boolean
      createdAt: Date
      updatedAt: Date
      rolId: string
    }, ExtArgs["result"]["trabajador"]>
    composites: {}
  }

  type TrabajadorGetPayload<S extends boolean | null | undefined | TrabajadorDefaultArgs> = $Result.GetResult<Prisma.$TrabajadorPayload, S>

  type TrabajadorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TrabajadorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TrabajadorCountAggregateInputType | true
    }

  export interface TrabajadorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Trabajador'], meta: { name: 'Trabajador' } }
    /**
     * Find zero or one Trabajador that matches the filter.
     * @param {TrabajadorFindUniqueArgs} args - Arguments to find a Trabajador
     * @example
     * // Get one Trabajador
     * const trabajador = await prisma.trabajador.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TrabajadorFindUniqueArgs>(args: SelectSubset<T, TrabajadorFindUniqueArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Trabajador that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TrabajadorFindUniqueOrThrowArgs} args - Arguments to find a Trabajador
     * @example
     * // Get one Trabajador
     * const trabajador = await prisma.trabajador.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TrabajadorFindUniqueOrThrowArgs>(args: SelectSubset<T, TrabajadorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trabajador that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrabajadorFindFirstArgs} args - Arguments to find a Trabajador
     * @example
     * // Get one Trabajador
     * const trabajador = await prisma.trabajador.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TrabajadorFindFirstArgs>(args?: SelectSubset<T, TrabajadorFindFirstArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trabajador that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrabajadorFindFirstOrThrowArgs} args - Arguments to find a Trabajador
     * @example
     * // Get one Trabajador
     * const trabajador = await prisma.trabajador.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TrabajadorFindFirstOrThrowArgs>(args?: SelectSubset<T, TrabajadorFindFirstOrThrowArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Trabajadors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrabajadorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Trabajadors
     * const trabajadors = await prisma.trabajador.findMany()
     * 
     * // Get first 10 Trabajadors
     * const trabajadors = await prisma.trabajador.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trabajadorWithIdOnly = await prisma.trabajador.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TrabajadorFindManyArgs>(args?: SelectSubset<T, TrabajadorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Trabajador.
     * @param {TrabajadorCreateArgs} args - Arguments to create a Trabajador.
     * @example
     * // Create one Trabajador
     * const Trabajador = await prisma.trabajador.create({
     *   data: {
     *     // ... data to create a Trabajador
     *   }
     * })
     * 
     */
    create<T extends TrabajadorCreateArgs>(args: SelectSubset<T, TrabajadorCreateArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Trabajadors.
     * @param {TrabajadorCreateManyArgs} args - Arguments to create many Trabajadors.
     * @example
     * // Create many Trabajadors
     * const trabajador = await prisma.trabajador.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TrabajadorCreateManyArgs>(args?: SelectSubset<T, TrabajadorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Trabajadors and returns the data saved in the database.
     * @param {TrabajadorCreateManyAndReturnArgs} args - Arguments to create many Trabajadors.
     * @example
     * // Create many Trabajadors
     * const trabajador = await prisma.trabajador.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Trabajadors and only return the `id`
     * const trabajadorWithIdOnly = await prisma.trabajador.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TrabajadorCreateManyAndReturnArgs>(args?: SelectSubset<T, TrabajadorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Trabajador.
     * @param {TrabajadorDeleteArgs} args - Arguments to delete one Trabajador.
     * @example
     * // Delete one Trabajador
     * const Trabajador = await prisma.trabajador.delete({
     *   where: {
     *     // ... filter to delete one Trabajador
     *   }
     * })
     * 
     */
    delete<T extends TrabajadorDeleteArgs>(args: SelectSubset<T, TrabajadorDeleteArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Trabajador.
     * @param {TrabajadorUpdateArgs} args - Arguments to update one Trabajador.
     * @example
     * // Update one Trabajador
     * const trabajador = await prisma.trabajador.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TrabajadorUpdateArgs>(args: SelectSubset<T, TrabajadorUpdateArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Trabajadors.
     * @param {TrabajadorDeleteManyArgs} args - Arguments to filter Trabajadors to delete.
     * @example
     * // Delete a few Trabajadors
     * const { count } = await prisma.trabajador.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TrabajadorDeleteManyArgs>(args?: SelectSubset<T, TrabajadorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trabajadors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrabajadorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Trabajadors
     * const trabajador = await prisma.trabajador.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TrabajadorUpdateManyArgs>(args: SelectSubset<T, TrabajadorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trabajadors and returns the data updated in the database.
     * @param {TrabajadorUpdateManyAndReturnArgs} args - Arguments to update many Trabajadors.
     * @example
     * // Update many Trabajadors
     * const trabajador = await prisma.trabajador.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Trabajadors and only return the `id`
     * const trabajadorWithIdOnly = await prisma.trabajador.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TrabajadorUpdateManyAndReturnArgs>(args: SelectSubset<T, TrabajadorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Trabajador.
     * @param {TrabajadorUpsertArgs} args - Arguments to update or create a Trabajador.
     * @example
     * // Update or create a Trabajador
     * const trabajador = await prisma.trabajador.upsert({
     *   create: {
     *     // ... data to create a Trabajador
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Trabajador we want to update
     *   }
     * })
     */
    upsert<T extends TrabajadorUpsertArgs>(args: SelectSubset<T, TrabajadorUpsertArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Trabajadors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrabajadorCountArgs} args - Arguments to filter Trabajadors to count.
     * @example
     * // Count the number of Trabajadors
     * const count = await prisma.trabajador.count({
     *   where: {
     *     // ... the filter for the Trabajadors we want to count
     *   }
     * })
    **/
    count<T extends TrabajadorCountArgs>(
      args?: Subset<T, TrabajadorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrabajadorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Trabajador.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrabajadorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrabajadorAggregateArgs>(args: Subset<T, TrabajadorAggregateArgs>): Prisma.PrismaPromise<GetTrabajadorAggregateType<T>>

    /**
     * Group by Trabajador.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrabajadorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrabajadorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrabajadorGroupByArgs['orderBy'] }
        : { orderBy?: TrabajadorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrabajadorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrabajadorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Trabajador model
   */
  readonly fields: TrabajadorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Trabajador.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TrabajadorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    rol<T extends RolDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RolDefaultArgs<ExtArgs>>): Prisma__RolClient<$Result.GetResult<Prisma.$RolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    clientesAsignados<T extends Trabajador$clientesAsignadosArgs<ExtArgs> = {}>(args?: Subset<T, Trabajador$clientesAsignadosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    horarios<T extends Trabajador$horariosArgs<ExtArgs> = {}>(args?: Subset<T, Trabajador$horariosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    informes<T extends Trabajador$informesArgs<ExtArgs> = {}>(args?: Subset<T, Trabajador$informesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    registrosCreados<T extends Trabajador$registrosCreadosArgs<ExtArgs> = {}>(args?: Subset<T, Trabajador$registrosCreadosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    objetivosAsignados<T extends Trabajador$objetivosAsignadosArgs<ExtArgs> = {}>(args?: Subset<T, Trabajador$objetivosAsignadosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Trabajador model
   */
  interface TrabajadorFieldRefs {
    readonly id: FieldRef<"Trabajador", 'String'>
    readonly username: FieldRef<"Trabajador", 'String'>
    readonly passwordHash: FieldRef<"Trabajador", 'String'>
    readonly nombre: FieldRef<"Trabajador", 'String'>
    readonly apellidos: FieldRef<"Trabajador", 'String'>
    readonly email: FieldRef<"Trabajador", 'String'>
    readonly telefono: FieldRef<"Trabajador", 'String'>
    readonly img: FieldRef<"Trabajador", 'String'>
    readonly fechaContratacion: FieldRef<"Trabajador", 'DateTime'>
    readonly activo: FieldRef<"Trabajador", 'Boolean'>
    readonly createdAt: FieldRef<"Trabajador", 'DateTime'>
    readonly updatedAt: FieldRef<"Trabajador", 'DateTime'>
    readonly rolId: FieldRef<"Trabajador", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Trabajador findUnique
   */
  export type TrabajadorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which Trabajador to fetch.
     */
    where: TrabajadorWhereUniqueInput
  }

  /**
   * Trabajador findUniqueOrThrow
   */
  export type TrabajadorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which Trabajador to fetch.
     */
    where: TrabajadorWhereUniqueInput
  }

  /**
   * Trabajador findFirst
   */
  export type TrabajadorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which Trabajador to fetch.
     */
    where?: TrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trabajadors to fetch.
     */
    orderBy?: TrabajadorOrderByWithRelationInput | TrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trabajadors.
     */
    cursor?: TrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trabajadors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trabajadors.
     */
    distinct?: TrabajadorScalarFieldEnum | TrabajadorScalarFieldEnum[]
  }

  /**
   * Trabajador findFirstOrThrow
   */
  export type TrabajadorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which Trabajador to fetch.
     */
    where?: TrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trabajadors to fetch.
     */
    orderBy?: TrabajadorOrderByWithRelationInput | TrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trabajadors.
     */
    cursor?: TrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trabajadors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trabajadors.
     */
    distinct?: TrabajadorScalarFieldEnum | TrabajadorScalarFieldEnum[]
  }

  /**
   * Trabajador findMany
   */
  export type TrabajadorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which Trabajadors to fetch.
     */
    where?: TrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trabajadors to fetch.
     */
    orderBy?: TrabajadorOrderByWithRelationInput | TrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Trabajadors.
     */
    cursor?: TrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trabajadors.
     */
    skip?: number
    distinct?: TrabajadorScalarFieldEnum | TrabajadorScalarFieldEnum[]
  }

  /**
   * Trabajador create
   */
  export type TrabajadorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * The data needed to create a Trabajador.
     */
    data: XOR<TrabajadorCreateInput, TrabajadorUncheckedCreateInput>
  }

  /**
   * Trabajador createMany
   */
  export type TrabajadorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Trabajadors.
     */
    data: TrabajadorCreateManyInput | TrabajadorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trabajador createManyAndReturn
   */
  export type TrabajadorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * The data used to create many Trabajadors.
     */
    data: TrabajadorCreateManyInput | TrabajadorCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Trabajador update
   */
  export type TrabajadorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * The data needed to update a Trabajador.
     */
    data: XOR<TrabajadorUpdateInput, TrabajadorUncheckedUpdateInput>
    /**
     * Choose, which Trabajador to update.
     */
    where: TrabajadorWhereUniqueInput
  }

  /**
   * Trabajador updateMany
   */
  export type TrabajadorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Trabajadors.
     */
    data: XOR<TrabajadorUpdateManyMutationInput, TrabajadorUncheckedUpdateManyInput>
    /**
     * Filter which Trabajadors to update
     */
    where?: TrabajadorWhereInput
    /**
     * Limit how many Trabajadors to update.
     */
    limit?: number
  }

  /**
   * Trabajador updateManyAndReturn
   */
  export type TrabajadorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * The data used to update Trabajadors.
     */
    data: XOR<TrabajadorUpdateManyMutationInput, TrabajadorUncheckedUpdateManyInput>
    /**
     * Filter which Trabajadors to update
     */
    where?: TrabajadorWhereInput
    /**
     * Limit how many Trabajadors to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Trabajador upsert
   */
  export type TrabajadorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * The filter to search for the Trabajador to update in case it exists.
     */
    where: TrabajadorWhereUniqueInput
    /**
     * In case the Trabajador found by the `where` argument doesn't exist, create a new Trabajador with this data.
     */
    create: XOR<TrabajadorCreateInput, TrabajadorUncheckedCreateInput>
    /**
     * In case the Trabajador was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TrabajadorUpdateInput, TrabajadorUncheckedUpdateInput>
  }

  /**
   * Trabajador delete
   */
  export type TrabajadorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
    /**
     * Filter which Trabajador to delete.
     */
    where: TrabajadorWhereUniqueInput
  }

  /**
   * Trabajador deleteMany
   */
  export type TrabajadorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trabajadors to delete
     */
    where?: TrabajadorWhereInput
    /**
     * Limit how many Trabajadors to delete.
     */
    limit?: number
  }

  /**
   * Trabajador.clientesAsignados
   */
  export type Trabajador$clientesAsignadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    where?: ClienteTrabajadorWhereInput
    orderBy?: ClienteTrabajadorOrderByWithRelationInput | ClienteTrabajadorOrderByWithRelationInput[]
    cursor?: ClienteTrabajadorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClienteTrabajadorScalarFieldEnum | ClienteTrabajadorScalarFieldEnum[]
  }

  /**
   * Trabajador.horarios
   */
  export type Trabajador$horariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    where?: HorarioWhereInput
    orderBy?: HorarioOrderByWithRelationInput | HorarioOrderByWithRelationInput[]
    cursor?: HorarioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HorarioScalarFieldEnum | HorarioScalarFieldEnum[]
  }

  /**
   * Trabajador.informes
   */
  export type Trabajador$informesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    where?: InformeWhereInput
    orderBy?: InformeOrderByWithRelationInput | InformeOrderByWithRelationInput[]
    cursor?: InformeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InformeScalarFieldEnum | InformeScalarFieldEnum[]
  }

  /**
   * Trabajador.registrosCreados
   */
  export type Trabajador$registrosCreadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    where?: RegistroDiarioWhereInput
    orderBy?: RegistroDiarioOrderByWithRelationInput | RegistroDiarioOrderByWithRelationInput[]
    cursor?: RegistroDiarioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RegistroDiarioScalarFieldEnum | RegistroDiarioScalarFieldEnum[]
  }

  /**
   * Trabajador.objetivosAsignados
   */
  export type Trabajador$objetivosAsignadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    where?: ObjetivoWhereInput
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    cursor?: ObjetivoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Trabajador without action
   */
  export type TrabajadorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trabajador
     */
    select?: TrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trabajador
     */
    omit?: TrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TrabajadorInclude<ExtArgs> | null
  }


  /**
   * Model Colegio
   */

  export type AggregateColegio = {
    _count: ColegioCountAggregateOutputType | null
    _min: ColegioMinAggregateOutputType | null
    _max: ColegioMaxAggregateOutputType | null
  }

  export type ColegioMinAggregateOutputType = {
    id: string | null
    nombre: string | null
    direccionColegio: string | null
    emailTutor: string | null
    emailOrientador: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ColegioMaxAggregateOutputType = {
    id: string | null
    nombre: string | null
    direccionColegio: string | null
    emailTutor: string | null
    emailOrientador: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ColegioCountAggregateOutputType = {
    id: number
    nombre: number
    direccionColegio: number
    emailTutor: number
    emailOrientador: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ColegioMinAggregateInputType = {
    id?: true
    nombre?: true
    direccionColegio?: true
    emailTutor?: true
    emailOrientador?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ColegioMaxAggregateInputType = {
    id?: true
    nombre?: true
    direccionColegio?: true
    emailTutor?: true
    emailOrientador?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ColegioCountAggregateInputType = {
    id?: true
    nombre?: true
    direccionColegio?: true
    emailTutor?: true
    emailOrientador?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ColegioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Colegio to aggregate.
     */
    where?: ColegioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colegios to fetch.
     */
    orderBy?: ColegioOrderByWithRelationInput | ColegioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ColegioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colegios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colegios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Colegios
    **/
    _count?: true | ColegioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ColegioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ColegioMaxAggregateInputType
  }

  export type GetColegioAggregateType<T extends ColegioAggregateArgs> = {
        [P in keyof T & keyof AggregateColegio]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateColegio[P]>
      : GetScalarType<T[P], AggregateColegio[P]>
  }




  export type ColegioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ColegioWhereInput
    orderBy?: ColegioOrderByWithAggregationInput | ColegioOrderByWithAggregationInput[]
    by: ColegioScalarFieldEnum[] | ColegioScalarFieldEnum
    having?: ColegioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ColegioCountAggregateInputType | true
    _min?: ColegioMinAggregateInputType
    _max?: ColegioMaxAggregateInputType
  }

  export type ColegioGroupByOutputType = {
    id: string
    nombre: string
    direccionColegio: string
    emailTutor: string | null
    emailOrientador: string | null
    createdAt: Date
    updatedAt: Date
    _count: ColegioCountAggregateOutputType | null
    _min: ColegioMinAggregateOutputType | null
    _max: ColegioMaxAggregateOutputType | null
  }

  type GetColegioGroupByPayload<T extends ColegioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ColegioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ColegioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ColegioGroupByOutputType[P]>
            : GetScalarType<T[P], ColegioGroupByOutputType[P]>
        }
      >
    >


  export type ColegioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    direccionColegio?: boolean
    emailTutor?: boolean
    emailOrientador?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clientes?: boolean | Colegio$clientesArgs<ExtArgs>
    _count?: boolean | ColegioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["colegio"]>

  export type ColegioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    direccionColegio?: boolean
    emailTutor?: boolean
    emailOrientador?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["colegio"]>

  export type ColegioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    direccionColegio?: boolean
    emailTutor?: boolean
    emailOrientador?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["colegio"]>

  export type ColegioSelectScalar = {
    id?: boolean
    nombre?: boolean
    direccionColegio?: boolean
    emailTutor?: boolean
    emailOrientador?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ColegioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombre" | "direccionColegio" | "emailTutor" | "emailOrientador" | "createdAt" | "updatedAt", ExtArgs["result"]["colegio"]>
  export type ColegioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    clientes?: boolean | Colegio$clientesArgs<ExtArgs>
    _count?: boolean | ColegioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ColegioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ColegioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ColegioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Colegio"
    objects: {
      clientes: Prisma.$ClientePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nombre: string
      direccionColegio: string
      emailTutor: string | null
      emailOrientador: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["colegio"]>
    composites: {}
  }

  type ColegioGetPayload<S extends boolean | null | undefined | ColegioDefaultArgs> = $Result.GetResult<Prisma.$ColegioPayload, S>

  type ColegioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ColegioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ColegioCountAggregateInputType | true
    }

  export interface ColegioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Colegio'], meta: { name: 'Colegio' } }
    /**
     * Find zero or one Colegio that matches the filter.
     * @param {ColegioFindUniqueArgs} args - Arguments to find a Colegio
     * @example
     * // Get one Colegio
     * const colegio = await prisma.colegio.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ColegioFindUniqueArgs>(args: SelectSubset<T, ColegioFindUniqueArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Colegio that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ColegioFindUniqueOrThrowArgs} args - Arguments to find a Colegio
     * @example
     * // Get one Colegio
     * const colegio = await prisma.colegio.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ColegioFindUniqueOrThrowArgs>(args: SelectSubset<T, ColegioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Colegio that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColegioFindFirstArgs} args - Arguments to find a Colegio
     * @example
     * // Get one Colegio
     * const colegio = await prisma.colegio.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ColegioFindFirstArgs>(args?: SelectSubset<T, ColegioFindFirstArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Colegio that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColegioFindFirstOrThrowArgs} args - Arguments to find a Colegio
     * @example
     * // Get one Colegio
     * const colegio = await prisma.colegio.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ColegioFindFirstOrThrowArgs>(args?: SelectSubset<T, ColegioFindFirstOrThrowArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Colegios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColegioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Colegios
     * const colegios = await prisma.colegio.findMany()
     * 
     * // Get first 10 Colegios
     * const colegios = await prisma.colegio.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const colegioWithIdOnly = await prisma.colegio.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ColegioFindManyArgs>(args?: SelectSubset<T, ColegioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Colegio.
     * @param {ColegioCreateArgs} args - Arguments to create a Colegio.
     * @example
     * // Create one Colegio
     * const Colegio = await prisma.colegio.create({
     *   data: {
     *     // ... data to create a Colegio
     *   }
     * })
     * 
     */
    create<T extends ColegioCreateArgs>(args: SelectSubset<T, ColegioCreateArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Colegios.
     * @param {ColegioCreateManyArgs} args - Arguments to create many Colegios.
     * @example
     * // Create many Colegios
     * const colegio = await prisma.colegio.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ColegioCreateManyArgs>(args?: SelectSubset<T, ColegioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Colegios and returns the data saved in the database.
     * @param {ColegioCreateManyAndReturnArgs} args - Arguments to create many Colegios.
     * @example
     * // Create many Colegios
     * const colegio = await prisma.colegio.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Colegios and only return the `id`
     * const colegioWithIdOnly = await prisma.colegio.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ColegioCreateManyAndReturnArgs>(args?: SelectSubset<T, ColegioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Colegio.
     * @param {ColegioDeleteArgs} args - Arguments to delete one Colegio.
     * @example
     * // Delete one Colegio
     * const Colegio = await prisma.colegio.delete({
     *   where: {
     *     // ... filter to delete one Colegio
     *   }
     * })
     * 
     */
    delete<T extends ColegioDeleteArgs>(args: SelectSubset<T, ColegioDeleteArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Colegio.
     * @param {ColegioUpdateArgs} args - Arguments to update one Colegio.
     * @example
     * // Update one Colegio
     * const colegio = await prisma.colegio.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ColegioUpdateArgs>(args: SelectSubset<T, ColegioUpdateArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Colegios.
     * @param {ColegioDeleteManyArgs} args - Arguments to filter Colegios to delete.
     * @example
     * // Delete a few Colegios
     * const { count } = await prisma.colegio.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ColegioDeleteManyArgs>(args?: SelectSubset<T, ColegioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Colegios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColegioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Colegios
     * const colegio = await prisma.colegio.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ColegioUpdateManyArgs>(args: SelectSubset<T, ColegioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Colegios and returns the data updated in the database.
     * @param {ColegioUpdateManyAndReturnArgs} args - Arguments to update many Colegios.
     * @example
     * // Update many Colegios
     * const colegio = await prisma.colegio.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Colegios and only return the `id`
     * const colegioWithIdOnly = await prisma.colegio.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ColegioUpdateManyAndReturnArgs>(args: SelectSubset<T, ColegioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Colegio.
     * @param {ColegioUpsertArgs} args - Arguments to update or create a Colegio.
     * @example
     * // Update or create a Colegio
     * const colegio = await prisma.colegio.upsert({
     *   create: {
     *     // ... data to create a Colegio
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Colegio we want to update
     *   }
     * })
     */
    upsert<T extends ColegioUpsertArgs>(args: SelectSubset<T, ColegioUpsertArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Colegios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColegioCountArgs} args - Arguments to filter Colegios to count.
     * @example
     * // Count the number of Colegios
     * const count = await prisma.colegio.count({
     *   where: {
     *     // ... the filter for the Colegios we want to count
     *   }
     * })
    **/
    count<T extends ColegioCountArgs>(
      args?: Subset<T, ColegioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ColegioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Colegio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColegioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ColegioAggregateArgs>(args: Subset<T, ColegioAggregateArgs>): Prisma.PrismaPromise<GetColegioAggregateType<T>>

    /**
     * Group by Colegio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ColegioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ColegioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ColegioGroupByArgs['orderBy'] }
        : { orderBy?: ColegioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ColegioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetColegioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Colegio model
   */
  readonly fields: ColegioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Colegio.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ColegioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    clientes<T extends Colegio$clientesArgs<ExtArgs> = {}>(args?: Subset<T, Colegio$clientesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Colegio model
   */
  interface ColegioFieldRefs {
    readonly id: FieldRef<"Colegio", 'String'>
    readonly nombre: FieldRef<"Colegio", 'String'>
    readonly direccionColegio: FieldRef<"Colegio", 'String'>
    readonly emailTutor: FieldRef<"Colegio", 'String'>
    readonly emailOrientador: FieldRef<"Colegio", 'String'>
    readonly createdAt: FieldRef<"Colegio", 'DateTime'>
    readonly updatedAt: FieldRef<"Colegio", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Colegio findUnique
   */
  export type ColegioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * Filter, which Colegio to fetch.
     */
    where: ColegioWhereUniqueInput
  }

  /**
   * Colegio findUniqueOrThrow
   */
  export type ColegioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * Filter, which Colegio to fetch.
     */
    where: ColegioWhereUniqueInput
  }

  /**
   * Colegio findFirst
   */
  export type ColegioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * Filter, which Colegio to fetch.
     */
    where?: ColegioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colegios to fetch.
     */
    orderBy?: ColegioOrderByWithRelationInput | ColegioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Colegios.
     */
    cursor?: ColegioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colegios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colegios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Colegios.
     */
    distinct?: ColegioScalarFieldEnum | ColegioScalarFieldEnum[]
  }

  /**
   * Colegio findFirstOrThrow
   */
  export type ColegioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * Filter, which Colegio to fetch.
     */
    where?: ColegioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colegios to fetch.
     */
    orderBy?: ColegioOrderByWithRelationInput | ColegioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Colegios.
     */
    cursor?: ColegioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colegios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colegios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Colegios.
     */
    distinct?: ColegioScalarFieldEnum | ColegioScalarFieldEnum[]
  }

  /**
   * Colegio findMany
   */
  export type ColegioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * Filter, which Colegios to fetch.
     */
    where?: ColegioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Colegios to fetch.
     */
    orderBy?: ColegioOrderByWithRelationInput | ColegioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Colegios.
     */
    cursor?: ColegioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Colegios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Colegios.
     */
    skip?: number
    distinct?: ColegioScalarFieldEnum | ColegioScalarFieldEnum[]
  }

  /**
   * Colegio create
   */
  export type ColegioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * The data needed to create a Colegio.
     */
    data: XOR<ColegioCreateInput, ColegioUncheckedCreateInput>
  }

  /**
   * Colegio createMany
   */
  export type ColegioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Colegios.
     */
    data: ColegioCreateManyInput | ColegioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Colegio createManyAndReturn
   */
  export type ColegioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * The data used to create many Colegios.
     */
    data: ColegioCreateManyInput | ColegioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Colegio update
   */
  export type ColegioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * The data needed to update a Colegio.
     */
    data: XOR<ColegioUpdateInput, ColegioUncheckedUpdateInput>
    /**
     * Choose, which Colegio to update.
     */
    where: ColegioWhereUniqueInput
  }

  /**
   * Colegio updateMany
   */
  export type ColegioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Colegios.
     */
    data: XOR<ColegioUpdateManyMutationInput, ColegioUncheckedUpdateManyInput>
    /**
     * Filter which Colegios to update
     */
    where?: ColegioWhereInput
    /**
     * Limit how many Colegios to update.
     */
    limit?: number
  }

  /**
   * Colegio updateManyAndReturn
   */
  export type ColegioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * The data used to update Colegios.
     */
    data: XOR<ColegioUpdateManyMutationInput, ColegioUncheckedUpdateManyInput>
    /**
     * Filter which Colegios to update
     */
    where?: ColegioWhereInput
    /**
     * Limit how many Colegios to update.
     */
    limit?: number
  }

  /**
   * Colegio upsert
   */
  export type ColegioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * The filter to search for the Colegio to update in case it exists.
     */
    where: ColegioWhereUniqueInput
    /**
     * In case the Colegio found by the `where` argument doesn't exist, create a new Colegio with this data.
     */
    create: XOR<ColegioCreateInput, ColegioUncheckedCreateInput>
    /**
     * In case the Colegio was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ColegioUpdateInput, ColegioUncheckedUpdateInput>
  }

  /**
   * Colegio delete
   */
  export type ColegioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    /**
     * Filter which Colegio to delete.
     */
    where: ColegioWhereUniqueInput
  }

  /**
   * Colegio deleteMany
   */
  export type ColegioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Colegios to delete
     */
    where?: ColegioWhereInput
    /**
     * Limit how many Colegios to delete.
     */
    limit?: number
  }

  /**
   * Colegio.clientes
   */
  export type Colegio$clientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    where?: ClienteWhereInput
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    cursor?: ClienteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Colegio without action
   */
  export type ColegioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
  }


  /**
   * Model Cliente
   */

  export type AggregateCliente = {
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  export type ClienteMinAggregateOutputType = {
    id: string | null
    idCarpetaDrive: string | null
    nombre: string | null
    apellidos: string | null
    fechaNacimiento: Date | null
    domicilio: string | null
    curso: string | null
    diagnostico: string | null
    tratamientos: string | null
    medicacion: string | null
    alergias: string | null
    activo: boolean | null
    adaptaciones: boolean | null
    apoyos: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    colegioId: string | null
  }

  export type ClienteMaxAggregateOutputType = {
    id: string | null
    idCarpetaDrive: string | null
    nombre: string | null
    apellidos: string | null
    fechaNacimiento: Date | null
    domicilio: string | null
    curso: string | null
    diagnostico: string | null
    tratamientos: string | null
    medicacion: string | null
    alergias: string | null
    activo: boolean | null
    adaptaciones: boolean | null
    apoyos: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    colegioId: string | null
  }

  export type ClienteCountAggregateOutputType = {
    id: number
    idCarpetaDrive: number
    nombre: number
    apellidos: number
    fechaNacimiento: number
    domicilio: number
    curso: number
    diagnostico: number
    tratamientos: number
    medicacion: number
    alergias: number
    activo: number
    adaptaciones: number
    apoyos: number
    createdAt: number
    updatedAt: number
    colegioId: number
    _all: number
  }


  export type ClienteMinAggregateInputType = {
    id?: true
    idCarpetaDrive?: true
    nombre?: true
    apellidos?: true
    fechaNacimiento?: true
    domicilio?: true
    curso?: true
    diagnostico?: true
    tratamientos?: true
    medicacion?: true
    alergias?: true
    activo?: true
    adaptaciones?: true
    apoyos?: true
    createdAt?: true
    updatedAt?: true
    colegioId?: true
  }

  export type ClienteMaxAggregateInputType = {
    id?: true
    idCarpetaDrive?: true
    nombre?: true
    apellidos?: true
    fechaNacimiento?: true
    domicilio?: true
    curso?: true
    diagnostico?: true
    tratamientos?: true
    medicacion?: true
    alergias?: true
    activo?: true
    adaptaciones?: true
    apoyos?: true
    createdAt?: true
    updatedAt?: true
    colegioId?: true
  }

  export type ClienteCountAggregateInputType = {
    id?: true
    idCarpetaDrive?: true
    nombre?: true
    apellidos?: true
    fechaNacimiento?: true
    domicilio?: true
    curso?: true
    diagnostico?: true
    tratamientos?: true
    medicacion?: true
    alergias?: true
    activo?: true
    adaptaciones?: true
    apoyos?: true
    createdAt?: true
    updatedAt?: true
    colegioId?: true
    _all?: true
  }

  export type ClienteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cliente to aggregate.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clientes
    **/
    _count?: true | ClienteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClienteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClienteMaxAggregateInputType
  }

  export type GetClienteAggregateType<T extends ClienteAggregateArgs> = {
        [P in keyof T & keyof AggregateCliente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCliente[P]>
      : GetScalarType<T[P], AggregateCliente[P]>
  }




  export type ClienteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteWhereInput
    orderBy?: ClienteOrderByWithAggregationInput | ClienteOrderByWithAggregationInput[]
    by: ClienteScalarFieldEnum[] | ClienteScalarFieldEnum
    having?: ClienteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClienteCountAggregateInputType | true
    _min?: ClienteMinAggregateInputType
    _max?: ClienteMaxAggregateInputType
  }

  export type ClienteGroupByOutputType = {
    id: string
    idCarpetaDrive: string | null
    nombre: string
    apellidos: string
    fechaNacimiento: Date | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias: string | null
    activo: boolean
    adaptaciones: boolean
    apoyos: boolean
    createdAt: Date
    updatedAt: Date
    colegioId: string | null
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  type GetClienteGroupByPayload<T extends ClienteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClienteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClienteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClienteGroupByOutputType[P]>
            : GetScalarType<T[P], ClienteGroupByOutputType[P]>
        }
      >
    >


  export type ClienteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idCarpetaDrive?: boolean
    nombre?: boolean
    apellidos?: boolean
    fechaNacimiento?: boolean
    domicilio?: boolean
    curso?: boolean
    diagnostico?: boolean
    tratamientos?: boolean
    medicacion?: boolean
    alergias?: boolean
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    colegioId?: boolean
    trabajadoresAsignados?: boolean | Cliente$trabajadoresAsignadosArgs<ExtArgs>
    colegio?: boolean | Cliente$colegioArgs<ExtArgs>
    horarios?: boolean | Cliente$horariosArgs<ExtArgs>
    informes?: boolean | Cliente$informesArgs<ExtArgs>
    contactosFamiliares?: boolean | Cliente$contactosFamiliaresArgs<ExtArgs>
    registrosDiarios?: boolean | Cliente$registrosDiariosArgs<ExtArgs>
    objetivos?: boolean | Cliente$objetivosArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idCarpetaDrive?: boolean
    nombre?: boolean
    apellidos?: boolean
    fechaNacimiento?: boolean
    domicilio?: boolean
    curso?: boolean
    diagnostico?: boolean
    tratamientos?: boolean
    medicacion?: boolean
    alergias?: boolean
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    colegioId?: boolean
    colegio?: boolean | Cliente$colegioArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    idCarpetaDrive?: boolean
    nombre?: boolean
    apellidos?: boolean
    fechaNacimiento?: boolean
    domicilio?: boolean
    curso?: boolean
    diagnostico?: boolean
    tratamientos?: boolean
    medicacion?: boolean
    alergias?: boolean
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    colegioId?: boolean
    colegio?: boolean | Cliente$colegioArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectScalar = {
    id?: boolean
    idCarpetaDrive?: boolean
    nombre?: boolean
    apellidos?: boolean
    fechaNacimiento?: boolean
    domicilio?: boolean
    curso?: boolean
    diagnostico?: boolean
    tratamientos?: boolean
    medicacion?: boolean
    alergias?: boolean
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    colegioId?: boolean
  }

  export type ClienteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "idCarpetaDrive" | "nombre" | "apellidos" | "fechaNacimiento" | "domicilio" | "curso" | "diagnostico" | "tratamientos" | "medicacion" | "alergias" | "activo" | "adaptaciones" | "apoyos" | "createdAt" | "updatedAt" | "colegioId", ExtArgs["result"]["cliente"]>
  export type ClienteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trabajadoresAsignados?: boolean | Cliente$trabajadoresAsignadosArgs<ExtArgs>
    colegio?: boolean | Cliente$colegioArgs<ExtArgs>
    horarios?: boolean | Cliente$horariosArgs<ExtArgs>
    informes?: boolean | Cliente$informesArgs<ExtArgs>
    contactosFamiliares?: boolean | Cliente$contactosFamiliaresArgs<ExtArgs>
    registrosDiarios?: boolean | Cliente$registrosDiariosArgs<ExtArgs>
    objetivos?: boolean | Cliente$objetivosArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClienteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    colegio?: boolean | Cliente$colegioArgs<ExtArgs>
  }
  export type ClienteIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    colegio?: boolean | Cliente$colegioArgs<ExtArgs>
  }

  export type $ClientePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cliente"
    objects: {
      trabajadoresAsignados: Prisma.$ClienteTrabajadorPayload<ExtArgs>[]
      colegio: Prisma.$ColegioPayload<ExtArgs> | null
      horarios: Prisma.$HorarioPayload<ExtArgs>[]
      informes: Prisma.$InformePayload<ExtArgs>[]
      contactosFamiliares: Prisma.$FamiliarPayload<ExtArgs>[]
      registrosDiarios: Prisma.$RegistroDiarioPayload<ExtArgs>[]
      objetivos: Prisma.$ObjetivoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      idCarpetaDrive: string | null
      nombre: string
      apellidos: string
      fechaNacimiento: Date | null
      domicilio: string
      curso: string
      diagnostico: string
      tratamientos: string
      medicacion: string
      alergias: string | null
      activo: boolean
      adaptaciones: boolean
      apoyos: boolean
      createdAt: Date
      updatedAt: Date
      colegioId: string | null
    }, ExtArgs["result"]["cliente"]>
    composites: {}
  }

  type ClienteGetPayload<S extends boolean | null | undefined | ClienteDefaultArgs> = $Result.GetResult<Prisma.$ClientePayload, S>

  type ClienteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClienteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClienteCountAggregateInputType | true
    }

  export interface ClienteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cliente'], meta: { name: 'Cliente' } }
    /**
     * Find zero or one Cliente that matches the filter.
     * @param {ClienteFindUniqueArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClienteFindUniqueArgs>(args: SelectSubset<T, ClienteFindUniqueArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cliente that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClienteFindUniqueOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClienteFindUniqueOrThrowArgs>(args: SelectSubset<T, ClienteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cliente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClienteFindFirstArgs>(args?: SelectSubset<T, ClienteFindFirstArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cliente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClienteFindFirstOrThrowArgs>(args?: SelectSubset<T, ClienteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Clientes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clientes
     * const clientes = await prisma.cliente.findMany()
     * 
     * // Get first 10 Clientes
     * const clientes = await prisma.cliente.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clienteWithIdOnly = await prisma.cliente.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClienteFindManyArgs>(args?: SelectSubset<T, ClienteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cliente.
     * @param {ClienteCreateArgs} args - Arguments to create a Cliente.
     * @example
     * // Create one Cliente
     * const Cliente = await prisma.cliente.create({
     *   data: {
     *     // ... data to create a Cliente
     *   }
     * })
     * 
     */
    create<T extends ClienteCreateArgs>(args: SelectSubset<T, ClienteCreateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Clientes.
     * @param {ClienteCreateManyArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClienteCreateManyArgs>(args?: SelectSubset<T, ClienteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clientes and returns the data saved in the database.
     * @param {ClienteCreateManyAndReturnArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clientes and only return the `id`
     * const clienteWithIdOnly = await prisma.cliente.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClienteCreateManyAndReturnArgs>(args?: SelectSubset<T, ClienteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cliente.
     * @param {ClienteDeleteArgs} args - Arguments to delete one Cliente.
     * @example
     * // Delete one Cliente
     * const Cliente = await prisma.cliente.delete({
     *   where: {
     *     // ... filter to delete one Cliente
     *   }
     * })
     * 
     */
    delete<T extends ClienteDeleteArgs>(args: SelectSubset<T, ClienteDeleteArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cliente.
     * @param {ClienteUpdateArgs} args - Arguments to update one Cliente.
     * @example
     * // Update one Cliente
     * const cliente = await prisma.cliente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClienteUpdateArgs>(args: SelectSubset<T, ClienteUpdateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Clientes.
     * @param {ClienteDeleteManyArgs} args - Arguments to filter Clientes to delete.
     * @example
     * // Delete a few Clientes
     * const { count } = await prisma.cliente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClienteDeleteManyArgs>(args?: SelectSubset<T, ClienteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clientes
     * const cliente = await prisma.cliente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClienteUpdateManyArgs>(args: SelectSubset<T, ClienteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clientes and returns the data updated in the database.
     * @param {ClienteUpdateManyAndReturnArgs} args - Arguments to update many Clientes.
     * @example
     * // Update many Clientes
     * const cliente = await prisma.cliente.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Clientes and only return the `id`
     * const clienteWithIdOnly = await prisma.cliente.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClienteUpdateManyAndReturnArgs>(args: SelectSubset<T, ClienteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cliente.
     * @param {ClienteUpsertArgs} args - Arguments to update or create a Cliente.
     * @example
     * // Update or create a Cliente
     * const cliente = await prisma.cliente.upsert({
     *   create: {
     *     // ... data to create a Cliente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cliente we want to update
     *   }
     * })
     */
    upsert<T extends ClienteUpsertArgs>(args: SelectSubset<T, ClienteUpsertArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteCountArgs} args - Arguments to filter Clientes to count.
     * @example
     * // Count the number of Clientes
     * const count = await prisma.cliente.count({
     *   where: {
     *     // ... the filter for the Clientes we want to count
     *   }
     * })
    **/
    count<T extends ClienteCountArgs>(
      args?: Subset<T, ClienteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClienteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClienteAggregateArgs>(args: Subset<T, ClienteAggregateArgs>): Prisma.PrismaPromise<GetClienteAggregateType<T>>

    /**
     * Group by Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClienteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClienteGroupByArgs['orderBy'] }
        : { orderBy?: ClienteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClienteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClienteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cliente model
   */
  readonly fields: ClienteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cliente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClienteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trabajadoresAsignados<T extends Cliente$trabajadoresAsignadosArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$trabajadoresAsignadosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    colegio<T extends Cliente$colegioArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$colegioArgs<ExtArgs>>): Prisma__ColegioClient<$Result.GetResult<Prisma.$ColegioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    horarios<T extends Cliente$horariosArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$horariosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    informes<T extends Cliente$informesArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$informesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    contactosFamiliares<T extends Cliente$contactosFamiliaresArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$contactosFamiliaresArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    registrosDiarios<T extends Cliente$registrosDiariosArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$registrosDiariosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    objetivos<T extends Cliente$objetivosArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$objetivosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cliente model
   */
  interface ClienteFieldRefs {
    readonly id: FieldRef<"Cliente", 'String'>
    readonly idCarpetaDrive: FieldRef<"Cliente", 'String'>
    readonly nombre: FieldRef<"Cliente", 'String'>
    readonly apellidos: FieldRef<"Cliente", 'String'>
    readonly fechaNacimiento: FieldRef<"Cliente", 'DateTime'>
    readonly domicilio: FieldRef<"Cliente", 'String'>
    readonly curso: FieldRef<"Cliente", 'String'>
    readonly diagnostico: FieldRef<"Cliente", 'String'>
    readonly tratamientos: FieldRef<"Cliente", 'String'>
    readonly medicacion: FieldRef<"Cliente", 'String'>
    readonly alergias: FieldRef<"Cliente", 'String'>
    readonly activo: FieldRef<"Cliente", 'Boolean'>
    readonly adaptaciones: FieldRef<"Cliente", 'Boolean'>
    readonly apoyos: FieldRef<"Cliente", 'Boolean'>
    readonly createdAt: FieldRef<"Cliente", 'DateTime'>
    readonly updatedAt: FieldRef<"Cliente", 'DateTime'>
    readonly colegioId: FieldRef<"Cliente", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Cliente findUnique
   */
  export type ClienteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findUniqueOrThrow
   */
  export type ClienteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findFirst
   */
  export type ClienteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findFirstOrThrow
   */
  export type ClienteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findMany
   */
  export type ClienteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Clientes to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente create
   */
  export type ClienteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to create a Cliente.
     */
    data: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
  }

  /**
   * Cliente createMany
   */
  export type ClienteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Cliente createManyAndReturn
   */
  export type ClienteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cliente update
   */
  export type ClienteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to update a Cliente.
     */
    data: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
    /**
     * Choose, which Cliente to update.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente updateMany
   */
  export type ClienteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clientes.
     */
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyInput>
    /**
     * Filter which Clientes to update
     */
    where?: ClienteWhereInput
    /**
     * Limit how many Clientes to update.
     */
    limit?: number
  }

  /**
   * Cliente updateManyAndReturn
   */
  export type ClienteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * The data used to update Clientes.
     */
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyInput>
    /**
     * Filter which Clientes to update
     */
    where?: ClienteWhereInput
    /**
     * Limit how many Clientes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cliente upsert
   */
  export type ClienteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The filter to search for the Cliente to update in case it exists.
     */
    where: ClienteWhereUniqueInput
    /**
     * In case the Cliente found by the `where` argument doesn't exist, create a new Cliente with this data.
     */
    create: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
    /**
     * In case the Cliente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
  }

  /**
   * Cliente delete
   */
  export type ClienteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter which Cliente to delete.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente deleteMany
   */
  export type ClienteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clientes to delete
     */
    where?: ClienteWhereInput
    /**
     * Limit how many Clientes to delete.
     */
    limit?: number
  }

  /**
   * Cliente.trabajadoresAsignados
   */
  export type Cliente$trabajadoresAsignadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    where?: ClienteTrabajadorWhereInput
    orderBy?: ClienteTrabajadorOrderByWithRelationInput | ClienteTrabajadorOrderByWithRelationInput[]
    cursor?: ClienteTrabajadorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClienteTrabajadorScalarFieldEnum | ClienteTrabajadorScalarFieldEnum[]
  }

  /**
   * Cliente.colegio
   */
  export type Cliente$colegioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Colegio
     */
    select?: ColegioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Colegio
     */
    omit?: ColegioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ColegioInclude<ExtArgs> | null
    where?: ColegioWhereInput
  }

  /**
   * Cliente.horarios
   */
  export type Cliente$horariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    where?: HorarioWhereInput
    orderBy?: HorarioOrderByWithRelationInput | HorarioOrderByWithRelationInput[]
    cursor?: HorarioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: HorarioScalarFieldEnum | HorarioScalarFieldEnum[]
  }

  /**
   * Cliente.informes
   */
  export type Cliente$informesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    where?: InformeWhereInput
    orderBy?: InformeOrderByWithRelationInput | InformeOrderByWithRelationInput[]
    cursor?: InformeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InformeScalarFieldEnum | InformeScalarFieldEnum[]
  }

  /**
   * Cliente.contactosFamiliares
   */
  export type Cliente$contactosFamiliaresArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    where?: FamiliarWhereInput
    orderBy?: FamiliarOrderByWithRelationInput | FamiliarOrderByWithRelationInput[]
    cursor?: FamiliarWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FamiliarScalarFieldEnum | FamiliarScalarFieldEnum[]
  }

  /**
   * Cliente.registrosDiarios
   */
  export type Cliente$registrosDiariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    where?: RegistroDiarioWhereInput
    orderBy?: RegistroDiarioOrderByWithRelationInput | RegistroDiarioOrderByWithRelationInput[]
    cursor?: RegistroDiarioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RegistroDiarioScalarFieldEnum | RegistroDiarioScalarFieldEnum[]
  }

  /**
   * Cliente.objetivos
   */
  export type Cliente$objetivosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    where?: ObjetivoWhereInput
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    cursor?: ObjetivoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Cliente without action
   */
  export type ClienteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Cliente
     */
    omit?: ClienteOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
  }


  /**
   * Model ClienteTrabajador
   */

  export type AggregateClienteTrabajador = {
    _count: ClienteTrabajadorCountAggregateOutputType | null
    _min: ClienteTrabajadorMinAggregateOutputType | null
    _max: ClienteTrabajadorMaxAggregateOutputType | null
  }

  export type ClienteTrabajadorMinAggregateOutputType = {
    clienteId: string | null
    trabajadorId: string | null
    createdAt: Date | null
    tipoTerapia: string | null
  }

  export type ClienteTrabajadorMaxAggregateOutputType = {
    clienteId: string | null
    trabajadorId: string | null
    createdAt: Date | null
    tipoTerapia: string | null
  }

  export type ClienteTrabajadorCountAggregateOutputType = {
    clienteId: number
    trabajadorId: number
    createdAt: number
    tipoTerapia: number
    _all: number
  }


  export type ClienteTrabajadorMinAggregateInputType = {
    clienteId?: true
    trabajadorId?: true
    createdAt?: true
    tipoTerapia?: true
  }

  export type ClienteTrabajadorMaxAggregateInputType = {
    clienteId?: true
    trabajadorId?: true
    createdAt?: true
    tipoTerapia?: true
  }

  export type ClienteTrabajadorCountAggregateInputType = {
    clienteId?: true
    trabajadorId?: true
    createdAt?: true
    tipoTerapia?: true
    _all?: true
  }

  export type ClienteTrabajadorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClienteTrabajador to aggregate.
     */
    where?: ClienteTrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClienteTrabajadors to fetch.
     */
    orderBy?: ClienteTrabajadorOrderByWithRelationInput | ClienteTrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClienteTrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClienteTrabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClienteTrabajadors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClienteTrabajadors
    **/
    _count?: true | ClienteTrabajadorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClienteTrabajadorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClienteTrabajadorMaxAggregateInputType
  }

  export type GetClienteTrabajadorAggregateType<T extends ClienteTrabajadorAggregateArgs> = {
        [P in keyof T & keyof AggregateClienteTrabajador]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClienteTrabajador[P]>
      : GetScalarType<T[P], AggregateClienteTrabajador[P]>
  }




  export type ClienteTrabajadorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteTrabajadorWhereInput
    orderBy?: ClienteTrabajadorOrderByWithAggregationInput | ClienteTrabajadorOrderByWithAggregationInput[]
    by: ClienteTrabajadorScalarFieldEnum[] | ClienteTrabajadorScalarFieldEnum
    having?: ClienteTrabajadorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClienteTrabajadorCountAggregateInputType | true
    _min?: ClienteTrabajadorMinAggregateInputType
    _max?: ClienteTrabajadorMaxAggregateInputType
  }

  export type ClienteTrabajadorGroupByOutputType = {
    clienteId: string
    trabajadorId: string
    createdAt: Date
    tipoTerapia: string | null
    _count: ClienteTrabajadorCountAggregateOutputType | null
    _min: ClienteTrabajadorMinAggregateOutputType | null
    _max: ClienteTrabajadorMaxAggregateOutputType | null
  }

  type GetClienteTrabajadorGroupByPayload<T extends ClienteTrabajadorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClienteTrabajadorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClienteTrabajadorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClienteTrabajadorGroupByOutputType[P]>
            : GetScalarType<T[P], ClienteTrabajadorGroupByOutputType[P]>
        }
      >
    >


  export type ClienteTrabajadorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    clienteId?: boolean
    trabajadorId?: boolean
    createdAt?: boolean
    tipoTerapia?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clienteTrabajador"]>

  export type ClienteTrabajadorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    clienteId?: boolean
    trabajadorId?: boolean
    createdAt?: boolean
    tipoTerapia?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clienteTrabajador"]>

  export type ClienteTrabajadorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    clienteId?: boolean
    trabajadorId?: boolean
    createdAt?: boolean
    tipoTerapia?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["clienteTrabajador"]>

  export type ClienteTrabajadorSelectScalar = {
    clienteId?: boolean
    trabajadorId?: boolean
    createdAt?: boolean
    tipoTerapia?: boolean
  }

  export type ClienteTrabajadorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"clienteId" | "trabajadorId" | "createdAt" | "tipoTerapia", ExtArgs["result"]["clienteTrabajador"]>
  export type ClienteTrabajadorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type ClienteTrabajadorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type ClienteTrabajadorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }

  export type $ClienteTrabajadorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClienteTrabajador"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      trabajador: Prisma.$TrabajadorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      clienteId: string
      trabajadorId: string
      createdAt: Date
      tipoTerapia: string | null
    }, ExtArgs["result"]["clienteTrabajador"]>
    composites: {}
  }

  type ClienteTrabajadorGetPayload<S extends boolean | null | undefined | ClienteTrabajadorDefaultArgs> = $Result.GetResult<Prisma.$ClienteTrabajadorPayload, S>

  type ClienteTrabajadorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClienteTrabajadorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClienteTrabajadorCountAggregateInputType | true
    }

  export interface ClienteTrabajadorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClienteTrabajador'], meta: { name: 'ClienteTrabajador' } }
    /**
     * Find zero or one ClienteTrabajador that matches the filter.
     * @param {ClienteTrabajadorFindUniqueArgs} args - Arguments to find a ClienteTrabajador
     * @example
     * // Get one ClienteTrabajador
     * const clienteTrabajador = await prisma.clienteTrabajador.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClienteTrabajadorFindUniqueArgs>(args: SelectSubset<T, ClienteTrabajadorFindUniqueArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClienteTrabajador that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClienteTrabajadorFindUniqueOrThrowArgs} args - Arguments to find a ClienteTrabajador
     * @example
     * // Get one ClienteTrabajador
     * const clienteTrabajador = await prisma.clienteTrabajador.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClienteTrabajadorFindUniqueOrThrowArgs>(args: SelectSubset<T, ClienteTrabajadorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClienteTrabajador that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteTrabajadorFindFirstArgs} args - Arguments to find a ClienteTrabajador
     * @example
     * // Get one ClienteTrabajador
     * const clienteTrabajador = await prisma.clienteTrabajador.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClienteTrabajadorFindFirstArgs>(args?: SelectSubset<T, ClienteTrabajadorFindFirstArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClienteTrabajador that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteTrabajadorFindFirstOrThrowArgs} args - Arguments to find a ClienteTrabajador
     * @example
     * // Get one ClienteTrabajador
     * const clienteTrabajador = await prisma.clienteTrabajador.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClienteTrabajadorFindFirstOrThrowArgs>(args?: SelectSubset<T, ClienteTrabajadorFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClienteTrabajadors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteTrabajadorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClienteTrabajadors
     * const clienteTrabajadors = await prisma.clienteTrabajador.findMany()
     * 
     * // Get first 10 ClienteTrabajadors
     * const clienteTrabajadors = await prisma.clienteTrabajador.findMany({ take: 10 })
     * 
     * // Only select the `clienteId`
     * const clienteTrabajadorWithClienteIdOnly = await prisma.clienteTrabajador.findMany({ select: { clienteId: true } })
     * 
     */
    findMany<T extends ClienteTrabajadorFindManyArgs>(args?: SelectSubset<T, ClienteTrabajadorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClienteTrabajador.
     * @param {ClienteTrabajadorCreateArgs} args - Arguments to create a ClienteTrabajador.
     * @example
     * // Create one ClienteTrabajador
     * const ClienteTrabajador = await prisma.clienteTrabajador.create({
     *   data: {
     *     // ... data to create a ClienteTrabajador
     *   }
     * })
     * 
     */
    create<T extends ClienteTrabajadorCreateArgs>(args: SelectSubset<T, ClienteTrabajadorCreateArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClienteTrabajadors.
     * @param {ClienteTrabajadorCreateManyArgs} args - Arguments to create many ClienteTrabajadors.
     * @example
     * // Create many ClienteTrabajadors
     * const clienteTrabajador = await prisma.clienteTrabajador.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClienteTrabajadorCreateManyArgs>(args?: SelectSubset<T, ClienteTrabajadorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClienteTrabajadors and returns the data saved in the database.
     * @param {ClienteTrabajadorCreateManyAndReturnArgs} args - Arguments to create many ClienteTrabajadors.
     * @example
     * // Create many ClienteTrabajadors
     * const clienteTrabajador = await prisma.clienteTrabajador.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClienteTrabajadors and only return the `clienteId`
     * const clienteTrabajadorWithClienteIdOnly = await prisma.clienteTrabajador.createManyAndReturn({
     *   select: { clienteId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClienteTrabajadorCreateManyAndReturnArgs>(args?: SelectSubset<T, ClienteTrabajadorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClienteTrabajador.
     * @param {ClienteTrabajadorDeleteArgs} args - Arguments to delete one ClienteTrabajador.
     * @example
     * // Delete one ClienteTrabajador
     * const ClienteTrabajador = await prisma.clienteTrabajador.delete({
     *   where: {
     *     // ... filter to delete one ClienteTrabajador
     *   }
     * })
     * 
     */
    delete<T extends ClienteTrabajadorDeleteArgs>(args: SelectSubset<T, ClienteTrabajadorDeleteArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClienteTrabajador.
     * @param {ClienteTrabajadorUpdateArgs} args - Arguments to update one ClienteTrabajador.
     * @example
     * // Update one ClienteTrabajador
     * const clienteTrabajador = await prisma.clienteTrabajador.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClienteTrabajadorUpdateArgs>(args: SelectSubset<T, ClienteTrabajadorUpdateArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClienteTrabajadors.
     * @param {ClienteTrabajadorDeleteManyArgs} args - Arguments to filter ClienteTrabajadors to delete.
     * @example
     * // Delete a few ClienteTrabajadors
     * const { count } = await prisma.clienteTrabajador.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClienteTrabajadorDeleteManyArgs>(args?: SelectSubset<T, ClienteTrabajadorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClienteTrabajadors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteTrabajadorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClienteTrabajadors
     * const clienteTrabajador = await prisma.clienteTrabajador.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClienteTrabajadorUpdateManyArgs>(args: SelectSubset<T, ClienteTrabajadorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClienteTrabajadors and returns the data updated in the database.
     * @param {ClienteTrabajadorUpdateManyAndReturnArgs} args - Arguments to update many ClienteTrabajadors.
     * @example
     * // Update many ClienteTrabajadors
     * const clienteTrabajador = await prisma.clienteTrabajador.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClienteTrabajadors and only return the `clienteId`
     * const clienteTrabajadorWithClienteIdOnly = await prisma.clienteTrabajador.updateManyAndReturn({
     *   select: { clienteId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClienteTrabajadorUpdateManyAndReturnArgs>(args: SelectSubset<T, ClienteTrabajadorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClienteTrabajador.
     * @param {ClienteTrabajadorUpsertArgs} args - Arguments to update or create a ClienteTrabajador.
     * @example
     * // Update or create a ClienteTrabajador
     * const clienteTrabajador = await prisma.clienteTrabajador.upsert({
     *   create: {
     *     // ... data to create a ClienteTrabajador
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClienteTrabajador we want to update
     *   }
     * })
     */
    upsert<T extends ClienteTrabajadorUpsertArgs>(args: SelectSubset<T, ClienteTrabajadorUpsertArgs<ExtArgs>>): Prisma__ClienteTrabajadorClient<$Result.GetResult<Prisma.$ClienteTrabajadorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClienteTrabajadors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteTrabajadorCountArgs} args - Arguments to filter ClienteTrabajadors to count.
     * @example
     * // Count the number of ClienteTrabajadors
     * const count = await prisma.clienteTrabajador.count({
     *   where: {
     *     // ... the filter for the ClienteTrabajadors we want to count
     *   }
     * })
    **/
    count<T extends ClienteTrabajadorCountArgs>(
      args?: Subset<T, ClienteTrabajadorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClienteTrabajadorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClienteTrabajador.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteTrabajadorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClienteTrabajadorAggregateArgs>(args: Subset<T, ClienteTrabajadorAggregateArgs>): Prisma.PrismaPromise<GetClienteTrabajadorAggregateType<T>>

    /**
     * Group by ClienteTrabajador.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteTrabajadorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClienteTrabajadorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClienteTrabajadorGroupByArgs['orderBy'] }
        : { orderBy?: ClienteTrabajadorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClienteTrabajadorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClienteTrabajadorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClienteTrabajador model
   */
  readonly fields: ClienteTrabajadorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClienteTrabajador.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClienteTrabajadorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    trabajador<T extends TrabajadorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrabajadorDefaultArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClienteTrabajador model
   */
  interface ClienteTrabajadorFieldRefs {
    readonly clienteId: FieldRef<"ClienteTrabajador", 'String'>
    readonly trabajadorId: FieldRef<"ClienteTrabajador", 'String'>
    readonly createdAt: FieldRef<"ClienteTrabajador", 'DateTime'>
    readonly tipoTerapia: FieldRef<"ClienteTrabajador", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ClienteTrabajador findUnique
   */
  export type ClienteTrabajadorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which ClienteTrabajador to fetch.
     */
    where: ClienteTrabajadorWhereUniqueInput
  }

  /**
   * ClienteTrabajador findUniqueOrThrow
   */
  export type ClienteTrabajadorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which ClienteTrabajador to fetch.
     */
    where: ClienteTrabajadorWhereUniqueInput
  }

  /**
   * ClienteTrabajador findFirst
   */
  export type ClienteTrabajadorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which ClienteTrabajador to fetch.
     */
    where?: ClienteTrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClienteTrabajadors to fetch.
     */
    orderBy?: ClienteTrabajadorOrderByWithRelationInput | ClienteTrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClienteTrabajadors.
     */
    cursor?: ClienteTrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClienteTrabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClienteTrabajadors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClienteTrabajadors.
     */
    distinct?: ClienteTrabajadorScalarFieldEnum | ClienteTrabajadorScalarFieldEnum[]
  }

  /**
   * ClienteTrabajador findFirstOrThrow
   */
  export type ClienteTrabajadorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which ClienteTrabajador to fetch.
     */
    where?: ClienteTrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClienteTrabajadors to fetch.
     */
    orderBy?: ClienteTrabajadorOrderByWithRelationInput | ClienteTrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClienteTrabajadors.
     */
    cursor?: ClienteTrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClienteTrabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClienteTrabajadors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClienteTrabajadors.
     */
    distinct?: ClienteTrabajadorScalarFieldEnum | ClienteTrabajadorScalarFieldEnum[]
  }

  /**
   * ClienteTrabajador findMany
   */
  export type ClienteTrabajadorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * Filter, which ClienteTrabajadors to fetch.
     */
    where?: ClienteTrabajadorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClienteTrabajadors to fetch.
     */
    orderBy?: ClienteTrabajadorOrderByWithRelationInput | ClienteTrabajadorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClienteTrabajadors.
     */
    cursor?: ClienteTrabajadorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClienteTrabajadors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClienteTrabajadors.
     */
    skip?: number
    distinct?: ClienteTrabajadorScalarFieldEnum | ClienteTrabajadorScalarFieldEnum[]
  }

  /**
   * ClienteTrabajador create
   */
  export type ClienteTrabajadorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * The data needed to create a ClienteTrabajador.
     */
    data: XOR<ClienteTrabajadorCreateInput, ClienteTrabajadorUncheckedCreateInput>
  }

  /**
   * ClienteTrabajador createMany
   */
  export type ClienteTrabajadorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClienteTrabajadors.
     */
    data: ClienteTrabajadorCreateManyInput | ClienteTrabajadorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClienteTrabajador createManyAndReturn
   */
  export type ClienteTrabajadorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * The data used to create many ClienteTrabajadors.
     */
    data: ClienteTrabajadorCreateManyInput | ClienteTrabajadorCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClienteTrabajador update
   */
  export type ClienteTrabajadorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * The data needed to update a ClienteTrabajador.
     */
    data: XOR<ClienteTrabajadorUpdateInput, ClienteTrabajadorUncheckedUpdateInput>
    /**
     * Choose, which ClienteTrabajador to update.
     */
    where: ClienteTrabajadorWhereUniqueInput
  }

  /**
   * ClienteTrabajador updateMany
   */
  export type ClienteTrabajadorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClienteTrabajadors.
     */
    data: XOR<ClienteTrabajadorUpdateManyMutationInput, ClienteTrabajadorUncheckedUpdateManyInput>
    /**
     * Filter which ClienteTrabajadors to update
     */
    where?: ClienteTrabajadorWhereInput
    /**
     * Limit how many ClienteTrabajadors to update.
     */
    limit?: number
  }

  /**
   * ClienteTrabajador updateManyAndReturn
   */
  export type ClienteTrabajadorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * The data used to update ClienteTrabajadors.
     */
    data: XOR<ClienteTrabajadorUpdateManyMutationInput, ClienteTrabajadorUncheckedUpdateManyInput>
    /**
     * Filter which ClienteTrabajadors to update
     */
    where?: ClienteTrabajadorWhereInput
    /**
     * Limit how many ClienteTrabajadors to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClienteTrabajador upsert
   */
  export type ClienteTrabajadorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * The filter to search for the ClienteTrabajador to update in case it exists.
     */
    where: ClienteTrabajadorWhereUniqueInput
    /**
     * In case the ClienteTrabajador found by the `where` argument doesn't exist, create a new ClienteTrabajador with this data.
     */
    create: XOR<ClienteTrabajadorCreateInput, ClienteTrabajadorUncheckedCreateInput>
    /**
     * In case the ClienteTrabajador was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClienteTrabajadorUpdateInput, ClienteTrabajadorUncheckedUpdateInput>
  }

  /**
   * ClienteTrabajador delete
   */
  export type ClienteTrabajadorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
    /**
     * Filter which ClienteTrabajador to delete.
     */
    where: ClienteTrabajadorWhereUniqueInput
  }

  /**
   * ClienteTrabajador deleteMany
   */
  export type ClienteTrabajadorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClienteTrabajadors to delete
     */
    where?: ClienteTrabajadorWhereInput
    /**
     * Limit how many ClienteTrabajadors to delete.
     */
    limit?: number
  }

  /**
   * ClienteTrabajador without action
   */
  export type ClienteTrabajadorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteTrabajador
     */
    select?: ClienteTrabajadorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClienteTrabajador
     */
    omit?: ClienteTrabajadorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteTrabajadorInclude<ExtArgs> | null
  }


  /**
   * Model Horario
   */

  export type AggregateHorario = {
    _count: HorarioCountAggregateOutputType | null
    _min: HorarioMinAggregateOutputType | null
    _max: HorarioMaxAggregateOutputType | null
  }

  export type HorarioMinAggregateOutputType = {
    id: string | null
    fechaHoraInicio: Date | null
    fechaHoraFin: Date | null
    tipoSesion: string | null
    estado: string | null
    notas: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorId: string | null
  }

  export type HorarioMaxAggregateOutputType = {
    id: string | null
    fechaHoraInicio: Date | null
    fechaHoraFin: Date | null
    tipoSesion: string | null
    estado: string | null
    notas: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorId: string | null
  }

  export type HorarioCountAggregateOutputType = {
    id: number
    fechaHoraInicio: number
    fechaHoraFin: number
    tipoSesion: number
    estado: number
    notas: number
    createdAt: number
    updatedAt: number
    clienteId: number
    trabajadorId: number
    _all: number
  }


  export type HorarioMinAggregateInputType = {
    id?: true
    fechaHoraInicio?: true
    fechaHoraFin?: true
    tipoSesion?: true
    estado?: true
    notas?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
  }

  export type HorarioMaxAggregateInputType = {
    id?: true
    fechaHoraInicio?: true
    fechaHoraFin?: true
    tipoSesion?: true
    estado?: true
    notas?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
  }

  export type HorarioCountAggregateInputType = {
    id?: true
    fechaHoraInicio?: true
    fechaHoraFin?: true
    tipoSesion?: true
    estado?: true
    notas?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
    _all?: true
  }

  export type HorarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Horario to aggregate.
     */
    where?: HorarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Horarios to fetch.
     */
    orderBy?: HorarioOrderByWithRelationInput | HorarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: HorarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Horarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Horarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Horarios
    **/
    _count?: true | HorarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: HorarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: HorarioMaxAggregateInputType
  }

  export type GetHorarioAggregateType<T extends HorarioAggregateArgs> = {
        [P in keyof T & keyof AggregateHorario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHorario[P]>
      : GetScalarType<T[P], AggregateHorario[P]>
  }




  export type HorarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: HorarioWhereInput
    orderBy?: HorarioOrderByWithAggregationInput | HorarioOrderByWithAggregationInput[]
    by: HorarioScalarFieldEnum[] | HorarioScalarFieldEnum
    having?: HorarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: HorarioCountAggregateInputType | true
    _min?: HorarioMinAggregateInputType
    _max?: HorarioMaxAggregateInputType
  }

  export type HorarioGroupByOutputType = {
    id: string
    fechaHoraInicio: Date
    fechaHoraFin: Date
    tipoSesion: string
    estado: string
    notas: string | null
    createdAt: Date
    updatedAt: Date
    clienteId: string
    trabajadorId: string
    _count: HorarioCountAggregateOutputType | null
    _min: HorarioMinAggregateOutputType | null
    _max: HorarioMaxAggregateOutputType | null
  }

  type GetHorarioGroupByPayload<T extends HorarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<HorarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof HorarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], HorarioGroupByOutputType[P]>
            : GetScalarType<T[P], HorarioGroupByOutputType[P]>
        }
      >
    >


  export type HorarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fechaHoraInicio?: boolean
    fechaHoraFin?: boolean
    tipoSesion?: boolean
    estado?: boolean
    notas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["horario"]>

  export type HorarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fechaHoraInicio?: boolean
    fechaHoraFin?: boolean
    tipoSesion?: boolean
    estado?: boolean
    notas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["horario"]>

  export type HorarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fechaHoraInicio?: boolean
    fechaHoraFin?: boolean
    tipoSesion?: boolean
    estado?: boolean
    notas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["horario"]>

  export type HorarioSelectScalar = {
    id?: boolean
    fechaHoraInicio?: boolean
    fechaHoraFin?: boolean
    tipoSesion?: boolean
    estado?: boolean
    notas?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
  }

  export type HorarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fechaHoraInicio" | "fechaHoraFin" | "tipoSesion" | "estado" | "notas" | "createdAt" | "updatedAt" | "clienteId" | "trabajadorId", ExtArgs["result"]["horario"]>
  export type HorarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type HorarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type HorarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }

  export type $HorarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Horario"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      trabajador: Prisma.$TrabajadorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fechaHoraInicio: Date
      fechaHoraFin: Date
      tipoSesion: string
      estado: string
      notas: string | null
      createdAt: Date
      updatedAt: Date
      clienteId: string
      trabajadorId: string
    }, ExtArgs["result"]["horario"]>
    composites: {}
  }

  type HorarioGetPayload<S extends boolean | null | undefined | HorarioDefaultArgs> = $Result.GetResult<Prisma.$HorarioPayload, S>

  type HorarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<HorarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: HorarioCountAggregateInputType | true
    }

  export interface HorarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Horario'], meta: { name: 'Horario' } }
    /**
     * Find zero or one Horario that matches the filter.
     * @param {HorarioFindUniqueArgs} args - Arguments to find a Horario
     * @example
     * // Get one Horario
     * const horario = await prisma.horario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends HorarioFindUniqueArgs>(args: SelectSubset<T, HorarioFindUniqueArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Horario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {HorarioFindUniqueOrThrowArgs} args - Arguments to find a Horario
     * @example
     * // Get one Horario
     * const horario = await prisma.horario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends HorarioFindUniqueOrThrowArgs>(args: SelectSubset<T, HorarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Horario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HorarioFindFirstArgs} args - Arguments to find a Horario
     * @example
     * // Get one Horario
     * const horario = await prisma.horario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends HorarioFindFirstArgs>(args?: SelectSubset<T, HorarioFindFirstArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Horario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HorarioFindFirstOrThrowArgs} args - Arguments to find a Horario
     * @example
     * // Get one Horario
     * const horario = await prisma.horario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends HorarioFindFirstOrThrowArgs>(args?: SelectSubset<T, HorarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Horarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HorarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Horarios
     * const horarios = await prisma.horario.findMany()
     * 
     * // Get first 10 Horarios
     * const horarios = await prisma.horario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const horarioWithIdOnly = await prisma.horario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends HorarioFindManyArgs>(args?: SelectSubset<T, HorarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Horario.
     * @param {HorarioCreateArgs} args - Arguments to create a Horario.
     * @example
     * // Create one Horario
     * const Horario = await prisma.horario.create({
     *   data: {
     *     // ... data to create a Horario
     *   }
     * })
     * 
     */
    create<T extends HorarioCreateArgs>(args: SelectSubset<T, HorarioCreateArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Horarios.
     * @param {HorarioCreateManyArgs} args - Arguments to create many Horarios.
     * @example
     * // Create many Horarios
     * const horario = await prisma.horario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends HorarioCreateManyArgs>(args?: SelectSubset<T, HorarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Horarios and returns the data saved in the database.
     * @param {HorarioCreateManyAndReturnArgs} args - Arguments to create many Horarios.
     * @example
     * // Create many Horarios
     * const horario = await prisma.horario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Horarios and only return the `id`
     * const horarioWithIdOnly = await prisma.horario.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends HorarioCreateManyAndReturnArgs>(args?: SelectSubset<T, HorarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Horario.
     * @param {HorarioDeleteArgs} args - Arguments to delete one Horario.
     * @example
     * // Delete one Horario
     * const Horario = await prisma.horario.delete({
     *   where: {
     *     // ... filter to delete one Horario
     *   }
     * })
     * 
     */
    delete<T extends HorarioDeleteArgs>(args: SelectSubset<T, HorarioDeleteArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Horario.
     * @param {HorarioUpdateArgs} args - Arguments to update one Horario.
     * @example
     * // Update one Horario
     * const horario = await prisma.horario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends HorarioUpdateArgs>(args: SelectSubset<T, HorarioUpdateArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Horarios.
     * @param {HorarioDeleteManyArgs} args - Arguments to filter Horarios to delete.
     * @example
     * // Delete a few Horarios
     * const { count } = await prisma.horario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends HorarioDeleteManyArgs>(args?: SelectSubset<T, HorarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Horarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HorarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Horarios
     * const horario = await prisma.horario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends HorarioUpdateManyArgs>(args: SelectSubset<T, HorarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Horarios and returns the data updated in the database.
     * @param {HorarioUpdateManyAndReturnArgs} args - Arguments to update many Horarios.
     * @example
     * // Update many Horarios
     * const horario = await prisma.horario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Horarios and only return the `id`
     * const horarioWithIdOnly = await prisma.horario.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends HorarioUpdateManyAndReturnArgs>(args: SelectSubset<T, HorarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Horario.
     * @param {HorarioUpsertArgs} args - Arguments to update or create a Horario.
     * @example
     * // Update or create a Horario
     * const horario = await prisma.horario.upsert({
     *   create: {
     *     // ... data to create a Horario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Horario we want to update
     *   }
     * })
     */
    upsert<T extends HorarioUpsertArgs>(args: SelectSubset<T, HorarioUpsertArgs<ExtArgs>>): Prisma__HorarioClient<$Result.GetResult<Prisma.$HorarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Horarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HorarioCountArgs} args - Arguments to filter Horarios to count.
     * @example
     * // Count the number of Horarios
     * const count = await prisma.horario.count({
     *   where: {
     *     // ... the filter for the Horarios we want to count
     *   }
     * })
    **/
    count<T extends HorarioCountArgs>(
      args?: Subset<T, HorarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], HorarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Horario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HorarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends HorarioAggregateArgs>(args: Subset<T, HorarioAggregateArgs>): Prisma.PrismaPromise<GetHorarioAggregateType<T>>

    /**
     * Group by Horario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {HorarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends HorarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: HorarioGroupByArgs['orderBy'] }
        : { orderBy?: HorarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, HorarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHorarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Horario model
   */
  readonly fields: HorarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Horario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__HorarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    trabajador<T extends TrabajadorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrabajadorDefaultArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Horario model
   */
  interface HorarioFieldRefs {
    readonly id: FieldRef<"Horario", 'String'>
    readonly fechaHoraInicio: FieldRef<"Horario", 'DateTime'>
    readonly fechaHoraFin: FieldRef<"Horario", 'DateTime'>
    readonly tipoSesion: FieldRef<"Horario", 'String'>
    readonly estado: FieldRef<"Horario", 'String'>
    readonly notas: FieldRef<"Horario", 'String'>
    readonly createdAt: FieldRef<"Horario", 'DateTime'>
    readonly updatedAt: FieldRef<"Horario", 'DateTime'>
    readonly clienteId: FieldRef<"Horario", 'String'>
    readonly trabajadorId: FieldRef<"Horario", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Horario findUnique
   */
  export type HorarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * Filter, which Horario to fetch.
     */
    where: HorarioWhereUniqueInput
  }

  /**
   * Horario findUniqueOrThrow
   */
  export type HorarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * Filter, which Horario to fetch.
     */
    where: HorarioWhereUniqueInput
  }

  /**
   * Horario findFirst
   */
  export type HorarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * Filter, which Horario to fetch.
     */
    where?: HorarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Horarios to fetch.
     */
    orderBy?: HorarioOrderByWithRelationInput | HorarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Horarios.
     */
    cursor?: HorarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Horarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Horarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Horarios.
     */
    distinct?: HorarioScalarFieldEnum | HorarioScalarFieldEnum[]
  }

  /**
   * Horario findFirstOrThrow
   */
  export type HorarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * Filter, which Horario to fetch.
     */
    where?: HorarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Horarios to fetch.
     */
    orderBy?: HorarioOrderByWithRelationInput | HorarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Horarios.
     */
    cursor?: HorarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Horarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Horarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Horarios.
     */
    distinct?: HorarioScalarFieldEnum | HorarioScalarFieldEnum[]
  }

  /**
   * Horario findMany
   */
  export type HorarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * Filter, which Horarios to fetch.
     */
    where?: HorarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Horarios to fetch.
     */
    orderBy?: HorarioOrderByWithRelationInput | HorarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Horarios.
     */
    cursor?: HorarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Horarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Horarios.
     */
    skip?: number
    distinct?: HorarioScalarFieldEnum | HorarioScalarFieldEnum[]
  }

  /**
   * Horario create
   */
  export type HorarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Horario.
     */
    data: XOR<HorarioCreateInput, HorarioUncheckedCreateInput>
  }

  /**
   * Horario createMany
   */
  export type HorarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Horarios.
     */
    data: HorarioCreateManyInput | HorarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Horario createManyAndReturn
   */
  export type HorarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * The data used to create many Horarios.
     */
    data: HorarioCreateManyInput | HorarioCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Horario update
   */
  export type HorarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Horario.
     */
    data: XOR<HorarioUpdateInput, HorarioUncheckedUpdateInput>
    /**
     * Choose, which Horario to update.
     */
    where: HorarioWhereUniqueInput
  }

  /**
   * Horario updateMany
   */
  export type HorarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Horarios.
     */
    data: XOR<HorarioUpdateManyMutationInput, HorarioUncheckedUpdateManyInput>
    /**
     * Filter which Horarios to update
     */
    where?: HorarioWhereInput
    /**
     * Limit how many Horarios to update.
     */
    limit?: number
  }

  /**
   * Horario updateManyAndReturn
   */
  export type HorarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * The data used to update Horarios.
     */
    data: XOR<HorarioUpdateManyMutationInput, HorarioUncheckedUpdateManyInput>
    /**
     * Filter which Horarios to update
     */
    where?: HorarioWhereInput
    /**
     * Limit how many Horarios to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Horario upsert
   */
  export type HorarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Horario to update in case it exists.
     */
    where: HorarioWhereUniqueInput
    /**
     * In case the Horario found by the `where` argument doesn't exist, create a new Horario with this data.
     */
    create: XOR<HorarioCreateInput, HorarioUncheckedCreateInput>
    /**
     * In case the Horario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<HorarioUpdateInput, HorarioUncheckedUpdateInput>
  }

  /**
   * Horario delete
   */
  export type HorarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
    /**
     * Filter which Horario to delete.
     */
    where: HorarioWhereUniqueInput
  }

  /**
   * Horario deleteMany
   */
  export type HorarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Horarios to delete
     */
    where?: HorarioWhereInput
    /**
     * Limit how many Horarios to delete.
     */
    limit?: number
  }

  /**
   * Horario without action
   */
  export type HorarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Horario
     */
    select?: HorarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Horario
     */
    omit?: HorarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: HorarioInclude<ExtArgs> | null
  }


  /**
   * Model Informe
   */

  export type AggregateInforme = {
    _count: InformeCountAggregateOutputType | null
    _min: InformeMinAggregateOutputType | null
    _max: InformeMaxAggregateOutputType | null
  }

  export type InformeMinAggregateOutputType = {
    id: string | null
    titulo: string | null
    contenido: string | null
    fechaCreacion: Date | null
    fechaVencimiento: Date | null
    estado: string | null
    urlDocumentoFinal: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorId: string | null
  }

  export type InformeMaxAggregateOutputType = {
    id: string | null
    titulo: string | null
    contenido: string | null
    fechaCreacion: Date | null
    fechaVencimiento: Date | null
    estado: string | null
    urlDocumentoFinal: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorId: string | null
  }

  export type InformeCountAggregateOutputType = {
    id: number
    titulo: number
    contenido: number
    fechaCreacion: number
    fechaVencimiento: number
    estado: number
    urlDocumentoFinal: number
    createdAt: number
    updatedAt: number
    clienteId: number
    trabajadorId: number
    _all: number
  }


  export type InformeMinAggregateInputType = {
    id?: true
    titulo?: true
    contenido?: true
    fechaCreacion?: true
    fechaVencimiento?: true
    estado?: true
    urlDocumentoFinal?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
  }

  export type InformeMaxAggregateInputType = {
    id?: true
    titulo?: true
    contenido?: true
    fechaCreacion?: true
    fechaVencimiento?: true
    estado?: true
    urlDocumentoFinal?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
  }

  export type InformeCountAggregateInputType = {
    id?: true
    titulo?: true
    contenido?: true
    fechaCreacion?: true
    fechaVencimiento?: true
    estado?: true
    urlDocumentoFinal?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
    _all?: true
  }

  export type InformeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Informe to aggregate.
     */
    where?: InformeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Informes to fetch.
     */
    orderBy?: InformeOrderByWithRelationInput | InformeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InformeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Informes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Informes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Informes
    **/
    _count?: true | InformeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InformeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InformeMaxAggregateInputType
  }

  export type GetInformeAggregateType<T extends InformeAggregateArgs> = {
        [P in keyof T & keyof AggregateInforme]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInforme[P]>
      : GetScalarType<T[P], AggregateInforme[P]>
  }




  export type InformeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InformeWhereInput
    orderBy?: InformeOrderByWithAggregationInput | InformeOrderByWithAggregationInput[]
    by: InformeScalarFieldEnum[] | InformeScalarFieldEnum
    having?: InformeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InformeCountAggregateInputType | true
    _min?: InformeMinAggregateInputType
    _max?: InformeMaxAggregateInputType
  }

  export type InformeGroupByOutputType = {
    id: string
    titulo: string
    contenido: string
    fechaCreacion: Date
    fechaVencimiento: Date | null
    estado: string
    urlDocumentoFinal: string | null
    createdAt: Date
    updatedAt: Date
    clienteId: string
    trabajadorId: string
    _count: InformeCountAggregateOutputType | null
    _min: InformeMinAggregateOutputType | null
    _max: InformeMaxAggregateOutputType | null
  }

  type GetInformeGroupByPayload<T extends InformeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InformeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InformeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InformeGroupByOutputType[P]>
            : GetScalarType<T[P], InformeGroupByOutputType[P]>
        }
      >
    >


  export type InformeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    contenido?: boolean
    fechaCreacion?: boolean
    fechaVencimiento?: boolean
    estado?: boolean
    urlDocumentoFinal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["informe"]>

  export type InformeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    contenido?: boolean
    fechaCreacion?: boolean
    fechaVencimiento?: boolean
    estado?: boolean
    urlDocumentoFinal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["informe"]>

  export type InformeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    contenido?: boolean
    fechaCreacion?: boolean
    fechaVencimiento?: boolean
    estado?: boolean
    urlDocumentoFinal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["informe"]>

  export type InformeSelectScalar = {
    id?: boolean
    titulo?: boolean
    contenido?: boolean
    fechaCreacion?: boolean
    fechaVencimiento?: boolean
    estado?: boolean
    urlDocumentoFinal?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
  }

  export type InformeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "titulo" | "contenido" | "fechaCreacion" | "fechaVencimiento" | "estado" | "urlDocumentoFinal" | "createdAt" | "updatedAt" | "clienteId" | "trabajadorId", ExtArgs["result"]["informe"]>
  export type InformeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type InformeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type InformeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }

  export type $InformePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Informe"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      trabajador: Prisma.$TrabajadorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      titulo: string
      contenido: string
      fechaCreacion: Date
      fechaVencimiento: Date | null
      estado: string
      urlDocumentoFinal: string | null
      createdAt: Date
      updatedAt: Date
      clienteId: string
      trabajadorId: string
    }, ExtArgs["result"]["informe"]>
    composites: {}
  }

  type InformeGetPayload<S extends boolean | null | undefined | InformeDefaultArgs> = $Result.GetResult<Prisma.$InformePayload, S>

  type InformeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InformeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InformeCountAggregateInputType | true
    }

  export interface InformeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Informe'], meta: { name: 'Informe' } }
    /**
     * Find zero or one Informe that matches the filter.
     * @param {InformeFindUniqueArgs} args - Arguments to find a Informe
     * @example
     * // Get one Informe
     * const informe = await prisma.informe.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InformeFindUniqueArgs>(args: SelectSubset<T, InformeFindUniqueArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Informe that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InformeFindUniqueOrThrowArgs} args - Arguments to find a Informe
     * @example
     * // Get one Informe
     * const informe = await prisma.informe.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InformeFindUniqueOrThrowArgs>(args: SelectSubset<T, InformeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Informe that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InformeFindFirstArgs} args - Arguments to find a Informe
     * @example
     * // Get one Informe
     * const informe = await prisma.informe.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InformeFindFirstArgs>(args?: SelectSubset<T, InformeFindFirstArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Informe that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InformeFindFirstOrThrowArgs} args - Arguments to find a Informe
     * @example
     * // Get one Informe
     * const informe = await prisma.informe.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InformeFindFirstOrThrowArgs>(args?: SelectSubset<T, InformeFindFirstOrThrowArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Informes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InformeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Informes
     * const informes = await prisma.informe.findMany()
     * 
     * // Get first 10 Informes
     * const informes = await prisma.informe.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const informeWithIdOnly = await prisma.informe.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InformeFindManyArgs>(args?: SelectSubset<T, InformeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Informe.
     * @param {InformeCreateArgs} args - Arguments to create a Informe.
     * @example
     * // Create one Informe
     * const Informe = await prisma.informe.create({
     *   data: {
     *     // ... data to create a Informe
     *   }
     * })
     * 
     */
    create<T extends InformeCreateArgs>(args: SelectSubset<T, InformeCreateArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Informes.
     * @param {InformeCreateManyArgs} args - Arguments to create many Informes.
     * @example
     * // Create many Informes
     * const informe = await prisma.informe.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InformeCreateManyArgs>(args?: SelectSubset<T, InformeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Informes and returns the data saved in the database.
     * @param {InformeCreateManyAndReturnArgs} args - Arguments to create many Informes.
     * @example
     * // Create many Informes
     * const informe = await prisma.informe.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Informes and only return the `id`
     * const informeWithIdOnly = await prisma.informe.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InformeCreateManyAndReturnArgs>(args?: SelectSubset<T, InformeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Informe.
     * @param {InformeDeleteArgs} args - Arguments to delete one Informe.
     * @example
     * // Delete one Informe
     * const Informe = await prisma.informe.delete({
     *   where: {
     *     // ... filter to delete one Informe
     *   }
     * })
     * 
     */
    delete<T extends InformeDeleteArgs>(args: SelectSubset<T, InformeDeleteArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Informe.
     * @param {InformeUpdateArgs} args - Arguments to update one Informe.
     * @example
     * // Update one Informe
     * const informe = await prisma.informe.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InformeUpdateArgs>(args: SelectSubset<T, InformeUpdateArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Informes.
     * @param {InformeDeleteManyArgs} args - Arguments to filter Informes to delete.
     * @example
     * // Delete a few Informes
     * const { count } = await prisma.informe.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InformeDeleteManyArgs>(args?: SelectSubset<T, InformeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Informes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InformeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Informes
     * const informe = await prisma.informe.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InformeUpdateManyArgs>(args: SelectSubset<T, InformeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Informes and returns the data updated in the database.
     * @param {InformeUpdateManyAndReturnArgs} args - Arguments to update many Informes.
     * @example
     * // Update many Informes
     * const informe = await prisma.informe.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Informes and only return the `id`
     * const informeWithIdOnly = await prisma.informe.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InformeUpdateManyAndReturnArgs>(args: SelectSubset<T, InformeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Informe.
     * @param {InformeUpsertArgs} args - Arguments to update or create a Informe.
     * @example
     * // Update or create a Informe
     * const informe = await prisma.informe.upsert({
     *   create: {
     *     // ... data to create a Informe
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Informe we want to update
     *   }
     * })
     */
    upsert<T extends InformeUpsertArgs>(args: SelectSubset<T, InformeUpsertArgs<ExtArgs>>): Prisma__InformeClient<$Result.GetResult<Prisma.$InformePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Informes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InformeCountArgs} args - Arguments to filter Informes to count.
     * @example
     * // Count the number of Informes
     * const count = await prisma.informe.count({
     *   where: {
     *     // ... the filter for the Informes we want to count
     *   }
     * })
    **/
    count<T extends InformeCountArgs>(
      args?: Subset<T, InformeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InformeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Informe.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InformeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InformeAggregateArgs>(args: Subset<T, InformeAggregateArgs>): Prisma.PrismaPromise<GetInformeAggregateType<T>>

    /**
     * Group by Informe.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InformeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InformeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InformeGroupByArgs['orderBy'] }
        : { orderBy?: InformeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InformeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInformeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Informe model
   */
  readonly fields: InformeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Informe.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InformeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    trabajador<T extends TrabajadorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrabajadorDefaultArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Informe model
   */
  interface InformeFieldRefs {
    readonly id: FieldRef<"Informe", 'String'>
    readonly titulo: FieldRef<"Informe", 'String'>
    readonly contenido: FieldRef<"Informe", 'String'>
    readonly fechaCreacion: FieldRef<"Informe", 'DateTime'>
    readonly fechaVencimiento: FieldRef<"Informe", 'DateTime'>
    readonly estado: FieldRef<"Informe", 'String'>
    readonly urlDocumentoFinal: FieldRef<"Informe", 'String'>
    readonly createdAt: FieldRef<"Informe", 'DateTime'>
    readonly updatedAt: FieldRef<"Informe", 'DateTime'>
    readonly clienteId: FieldRef<"Informe", 'String'>
    readonly trabajadorId: FieldRef<"Informe", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Informe findUnique
   */
  export type InformeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * Filter, which Informe to fetch.
     */
    where: InformeWhereUniqueInput
  }

  /**
   * Informe findUniqueOrThrow
   */
  export type InformeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * Filter, which Informe to fetch.
     */
    where: InformeWhereUniqueInput
  }

  /**
   * Informe findFirst
   */
  export type InformeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * Filter, which Informe to fetch.
     */
    where?: InformeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Informes to fetch.
     */
    orderBy?: InformeOrderByWithRelationInput | InformeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Informes.
     */
    cursor?: InformeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Informes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Informes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Informes.
     */
    distinct?: InformeScalarFieldEnum | InformeScalarFieldEnum[]
  }

  /**
   * Informe findFirstOrThrow
   */
  export type InformeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * Filter, which Informe to fetch.
     */
    where?: InformeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Informes to fetch.
     */
    orderBy?: InformeOrderByWithRelationInput | InformeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Informes.
     */
    cursor?: InformeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Informes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Informes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Informes.
     */
    distinct?: InformeScalarFieldEnum | InformeScalarFieldEnum[]
  }

  /**
   * Informe findMany
   */
  export type InformeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * Filter, which Informes to fetch.
     */
    where?: InformeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Informes to fetch.
     */
    orderBy?: InformeOrderByWithRelationInput | InformeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Informes.
     */
    cursor?: InformeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Informes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Informes.
     */
    skip?: number
    distinct?: InformeScalarFieldEnum | InformeScalarFieldEnum[]
  }

  /**
   * Informe create
   */
  export type InformeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * The data needed to create a Informe.
     */
    data: XOR<InformeCreateInput, InformeUncheckedCreateInput>
  }

  /**
   * Informe createMany
   */
  export type InformeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Informes.
     */
    data: InformeCreateManyInput | InformeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Informe createManyAndReturn
   */
  export type InformeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * The data used to create many Informes.
     */
    data: InformeCreateManyInput | InformeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Informe update
   */
  export type InformeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * The data needed to update a Informe.
     */
    data: XOR<InformeUpdateInput, InformeUncheckedUpdateInput>
    /**
     * Choose, which Informe to update.
     */
    where: InformeWhereUniqueInput
  }

  /**
   * Informe updateMany
   */
  export type InformeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Informes.
     */
    data: XOR<InformeUpdateManyMutationInput, InformeUncheckedUpdateManyInput>
    /**
     * Filter which Informes to update
     */
    where?: InformeWhereInput
    /**
     * Limit how many Informes to update.
     */
    limit?: number
  }

  /**
   * Informe updateManyAndReturn
   */
  export type InformeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * The data used to update Informes.
     */
    data: XOR<InformeUpdateManyMutationInput, InformeUncheckedUpdateManyInput>
    /**
     * Filter which Informes to update
     */
    where?: InformeWhereInput
    /**
     * Limit how many Informes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Informe upsert
   */
  export type InformeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * The filter to search for the Informe to update in case it exists.
     */
    where: InformeWhereUniqueInput
    /**
     * In case the Informe found by the `where` argument doesn't exist, create a new Informe with this data.
     */
    create: XOR<InformeCreateInput, InformeUncheckedCreateInput>
    /**
     * In case the Informe was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InformeUpdateInput, InformeUncheckedUpdateInput>
  }

  /**
   * Informe delete
   */
  export type InformeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
    /**
     * Filter which Informe to delete.
     */
    where: InformeWhereUniqueInput
  }

  /**
   * Informe deleteMany
   */
  export type InformeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Informes to delete
     */
    where?: InformeWhereInput
    /**
     * Limit how many Informes to delete.
     */
    limit?: number
  }

  /**
   * Informe without action
   */
  export type InformeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Informe
     */
    select?: InformeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Informe
     */
    omit?: InformeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InformeInclude<ExtArgs> | null
  }


  /**
   * Model Familiar
   */

  export type AggregateFamiliar = {
    _count: FamiliarCountAggregateOutputType | null
    _min: FamiliarMinAggregateOutputType | null
    _max: FamiliarMaxAggregateOutputType | null
  }

  export type FamiliarMinAggregateOutputType = {
    id: string | null
    nombreContacto: string | null
    parentesco: string | null
    telefonoMadre: string | null
    emailMadre: string | null
    telefonoPadre: string | null
    emailPadre: string | null
    telefonoWhatsapp: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
  }

  export type FamiliarMaxAggregateOutputType = {
    id: string | null
    nombreContacto: string | null
    parentesco: string | null
    telefonoMadre: string | null
    emailMadre: string | null
    telefonoPadre: string | null
    emailPadre: string | null
    telefonoWhatsapp: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
  }

  export type FamiliarCountAggregateOutputType = {
    id: number
    nombreContacto: number
    parentesco: number
    telefonoMadre: number
    emailMadre: number
    telefonoPadre: number
    emailPadre: number
    telefonoWhatsapp: number
    createdAt: number
    updatedAt: number
    clienteId: number
    _all: number
  }


  export type FamiliarMinAggregateInputType = {
    id?: true
    nombreContacto?: true
    parentesco?: true
    telefonoMadre?: true
    emailMadre?: true
    telefonoPadre?: true
    emailPadre?: true
    telefonoWhatsapp?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
  }

  export type FamiliarMaxAggregateInputType = {
    id?: true
    nombreContacto?: true
    parentesco?: true
    telefonoMadre?: true
    emailMadre?: true
    telefonoPadre?: true
    emailPadre?: true
    telefonoWhatsapp?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
  }

  export type FamiliarCountAggregateInputType = {
    id?: true
    nombreContacto?: true
    parentesco?: true
    telefonoMadre?: true
    emailMadre?: true
    telefonoPadre?: true
    emailPadre?: true
    telefonoWhatsapp?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    _all?: true
  }

  export type FamiliarAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Familiar to aggregate.
     */
    where?: FamiliarWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Familiars to fetch.
     */
    orderBy?: FamiliarOrderByWithRelationInput | FamiliarOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FamiliarWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Familiars from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Familiars.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Familiars
    **/
    _count?: true | FamiliarCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FamiliarMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FamiliarMaxAggregateInputType
  }

  export type GetFamiliarAggregateType<T extends FamiliarAggregateArgs> = {
        [P in keyof T & keyof AggregateFamiliar]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFamiliar[P]>
      : GetScalarType<T[P], AggregateFamiliar[P]>
  }




  export type FamiliarGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FamiliarWhereInput
    orderBy?: FamiliarOrderByWithAggregationInput | FamiliarOrderByWithAggregationInput[]
    by: FamiliarScalarFieldEnum[] | FamiliarScalarFieldEnum
    having?: FamiliarScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FamiliarCountAggregateInputType | true
    _min?: FamiliarMinAggregateInputType
    _max?: FamiliarMaxAggregateInputType
  }

  export type FamiliarGroupByOutputType = {
    id: string
    nombreContacto: string
    parentesco: string | null
    telefonoMadre: string | null
    emailMadre: string | null
    telefonoPadre: string | null
    emailPadre: string | null
    telefonoWhatsapp: string | null
    createdAt: Date
    updatedAt: Date
    clienteId: string
    _count: FamiliarCountAggregateOutputType | null
    _min: FamiliarMinAggregateOutputType | null
    _max: FamiliarMaxAggregateOutputType | null
  }

  type GetFamiliarGroupByPayload<T extends FamiliarGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FamiliarGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FamiliarGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FamiliarGroupByOutputType[P]>
            : GetScalarType<T[P], FamiliarGroupByOutputType[P]>
        }
      >
    >


  export type FamiliarSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreContacto?: boolean
    parentesco?: boolean
    telefonoMadre?: boolean
    emailMadre?: boolean
    telefonoPadre?: boolean
    emailPadre?: boolean
    telefonoWhatsapp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["familiar"]>

  export type FamiliarSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreContacto?: boolean
    parentesco?: boolean
    telefonoMadre?: boolean
    emailMadre?: boolean
    telefonoPadre?: boolean
    emailPadre?: boolean
    telefonoWhatsapp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["familiar"]>

  export type FamiliarSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombreContacto?: boolean
    parentesco?: boolean
    telefonoMadre?: boolean
    emailMadre?: boolean
    telefonoPadre?: boolean
    emailPadre?: boolean
    telefonoWhatsapp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["familiar"]>

  export type FamiliarSelectScalar = {
    id?: boolean
    nombreContacto?: boolean
    parentesco?: boolean
    telefonoMadre?: boolean
    emailMadre?: boolean
    telefonoPadre?: boolean
    emailPadre?: boolean
    telefonoWhatsapp?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
  }

  export type FamiliarOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nombreContacto" | "parentesco" | "telefonoMadre" | "emailMadre" | "telefonoPadre" | "emailPadre" | "telefonoWhatsapp" | "createdAt" | "updatedAt" | "clienteId", ExtArgs["result"]["familiar"]>
  export type FamiliarInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }
  export type FamiliarIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }
  export type FamiliarIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
  }

  export type $FamiliarPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Familiar"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nombreContacto: string
      parentesco: string | null
      telefonoMadre: string | null
      emailMadre: string | null
      telefonoPadre: string | null
      emailPadre: string | null
      telefonoWhatsapp: string | null
      createdAt: Date
      updatedAt: Date
      clienteId: string
    }, ExtArgs["result"]["familiar"]>
    composites: {}
  }

  type FamiliarGetPayload<S extends boolean | null | undefined | FamiliarDefaultArgs> = $Result.GetResult<Prisma.$FamiliarPayload, S>

  type FamiliarCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FamiliarFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FamiliarCountAggregateInputType | true
    }

  export interface FamiliarDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Familiar'], meta: { name: 'Familiar' } }
    /**
     * Find zero or one Familiar that matches the filter.
     * @param {FamiliarFindUniqueArgs} args - Arguments to find a Familiar
     * @example
     * // Get one Familiar
     * const familiar = await prisma.familiar.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FamiliarFindUniqueArgs>(args: SelectSubset<T, FamiliarFindUniqueArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Familiar that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FamiliarFindUniqueOrThrowArgs} args - Arguments to find a Familiar
     * @example
     * // Get one Familiar
     * const familiar = await prisma.familiar.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FamiliarFindUniqueOrThrowArgs>(args: SelectSubset<T, FamiliarFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Familiar that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FamiliarFindFirstArgs} args - Arguments to find a Familiar
     * @example
     * // Get one Familiar
     * const familiar = await prisma.familiar.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FamiliarFindFirstArgs>(args?: SelectSubset<T, FamiliarFindFirstArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Familiar that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FamiliarFindFirstOrThrowArgs} args - Arguments to find a Familiar
     * @example
     * // Get one Familiar
     * const familiar = await prisma.familiar.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FamiliarFindFirstOrThrowArgs>(args?: SelectSubset<T, FamiliarFindFirstOrThrowArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Familiars that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FamiliarFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Familiars
     * const familiars = await prisma.familiar.findMany()
     * 
     * // Get first 10 Familiars
     * const familiars = await prisma.familiar.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const familiarWithIdOnly = await prisma.familiar.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FamiliarFindManyArgs>(args?: SelectSubset<T, FamiliarFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Familiar.
     * @param {FamiliarCreateArgs} args - Arguments to create a Familiar.
     * @example
     * // Create one Familiar
     * const Familiar = await prisma.familiar.create({
     *   data: {
     *     // ... data to create a Familiar
     *   }
     * })
     * 
     */
    create<T extends FamiliarCreateArgs>(args: SelectSubset<T, FamiliarCreateArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Familiars.
     * @param {FamiliarCreateManyArgs} args - Arguments to create many Familiars.
     * @example
     * // Create many Familiars
     * const familiar = await prisma.familiar.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FamiliarCreateManyArgs>(args?: SelectSubset<T, FamiliarCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Familiars and returns the data saved in the database.
     * @param {FamiliarCreateManyAndReturnArgs} args - Arguments to create many Familiars.
     * @example
     * // Create many Familiars
     * const familiar = await prisma.familiar.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Familiars and only return the `id`
     * const familiarWithIdOnly = await prisma.familiar.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FamiliarCreateManyAndReturnArgs>(args?: SelectSubset<T, FamiliarCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Familiar.
     * @param {FamiliarDeleteArgs} args - Arguments to delete one Familiar.
     * @example
     * // Delete one Familiar
     * const Familiar = await prisma.familiar.delete({
     *   where: {
     *     // ... filter to delete one Familiar
     *   }
     * })
     * 
     */
    delete<T extends FamiliarDeleteArgs>(args: SelectSubset<T, FamiliarDeleteArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Familiar.
     * @param {FamiliarUpdateArgs} args - Arguments to update one Familiar.
     * @example
     * // Update one Familiar
     * const familiar = await prisma.familiar.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FamiliarUpdateArgs>(args: SelectSubset<T, FamiliarUpdateArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Familiars.
     * @param {FamiliarDeleteManyArgs} args - Arguments to filter Familiars to delete.
     * @example
     * // Delete a few Familiars
     * const { count } = await prisma.familiar.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FamiliarDeleteManyArgs>(args?: SelectSubset<T, FamiliarDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Familiars.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FamiliarUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Familiars
     * const familiar = await prisma.familiar.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FamiliarUpdateManyArgs>(args: SelectSubset<T, FamiliarUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Familiars and returns the data updated in the database.
     * @param {FamiliarUpdateManyAndReturnArgs} args - Arguments to update many Familiars.
     * @example
     * // Update many Familiars
     * const familiar = await prisma.familiar.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Familiars and only return the `id`
     * const familiarWithIdOnly = await prisma.familiar.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FamiliarUpdateManyAndReturnArgs>(args: SelectSubset<T, FamiliarUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Familiar.
     * @param {FamiliarUpsertArgs} args - Arguments to update or create a Familiar.
     * @example
     * // Update or create a Familiar
     * const familiar = await prisma.familiar.upsert({
     *   create: {
     *     // ... data to create a Familiar
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Familiar we want to update
     *   }
     * })
     */
    upsert<T extends FamiliarUpsertArgs>(args: SelectSubset<T, FamiliarUpsertArgs<ExtArgs>>): Prisma__FamiliarClient<$Result.GetResult<Prisma.$FamiliarPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Familiars.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FamiliarCountArgs} args - Arguments to filter Familiars to count.
     * @example
     * // Count the number of Familiars
     * const count = await prisma.familiar.count({
     *   where: {
     *     // ... the filter for the Familiars we want to count
     *   }
     * })
    **/
    count<T extends FamiliarCountArgs>(
      args?: Subset<T, FamiliarCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FamiliarCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Familiar.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FamiliarAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FamiliarAggregateArgs>(args: Subset<T, FamiliarAggregateArgs>): Prisma.PrismaPromise<GetFamiliarAggregateType<T>>

    /**
     * Group by Familiar.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FamiliarGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FamiliarGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FamiliarGroupByArgs['orderBy'] }
        : { orderBy?: FamiliarGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FamiliarGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFamiliarGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Familiar model
   */
  readonly fields: FamiliarFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Familiar.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FamiliarClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Familiar model
   */
  interface FamiliarFieldRefs {
    readonly id: FieldRef<"Familiar", 'String'>
    readonly nombreContacto: FieldRef<"Familiar", 'String'>
    readonly parentesco: FieldRef<"Familiar", 'String'>
    readonly telefonoMadre: FieldRef<"Familiar", 'String'>
    readonly emailMadre: FieldRef<"Familiar", 'String'>
    readonly telefonoPadre: FieldRef<"Familiar", 'String'>
    readonly emailPadre: FieldRef<"Familiar", 'String'>
    readonly telefonoWhatsapp: FieldRef<"Familiar", 'String'>
    readonly createdAt: FieldRef<"Familiar", 'DateTime'>
    readonly updatedAt: FieldRef<"Familiar", 'DateTime'>
    readonly clienteId: FieldRef<"Familiar", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Familiar findUnique
   */
  export type FamiliarFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * Filter, which Familiar to fetch.
     */
    where: FamiliarWhereUniqueInput
  }

  /**
   * Familiar findUniqueOrThrow
   */
  export type FamiliarFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * Filter, which Familiar to fetch.
     */
    where: FamiliarWhereUniqueInput
  }

  /**
   * Familiar findFirst
   */
  export type FamiliarFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * Filter, which Familiar to fetch.
     */
    where?: FamiliarWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Familiars to fetch.
     */
    orderBy?: FamiliarOrderByWithRelationInput | FamiliarOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Familiars.
     */
    cursor?: FamiliarWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Familiars from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Familiars.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Familiars.
     */
    distinct?: FamiliarScalarFieldEnum | FamiliarScalarFieldEnum[]
  }

  /**
   * Familiar findFirstOrThrow
   */
  export type FamiliarFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * Filter, which Familiar to fetch.
     */
    where?: FamiliarWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Familiars to fetch.
     */
    orderBy?: FamiliarOrderByWithRelationInput | FamiliarOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Familiars.
     */
    cursor?: FamiliarWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Familiars from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Familiars.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Familiars.
     */
    distinct?: FamiliarScalarFieldEnum | FamiliarScalarFieldEnum[]
  }

  /**
   * Familiar findMany
   */
  export type FamiliarFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * Filter, which Familiars to fetch.
     */
    where?: FamiliarWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Familiars to fetch.
     */
    orderBy?: FamiliarOrderByWithRelationInput | FamiliarOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Familiars.
     */
    cursor?: FamiliarWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Familiars from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Familiars.
     */
    skip?: number
    distinct?: FamiliarScalarFieldEnum | FamiliarScalarFieldEnum[]
  }

  /**
   * Familiar create
   */
  export type FamiliarCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * The data needed to create a Familiar.
     */
    data: XOR<FamiliarCreateInput, FamiliarUncheckedCreateInput>
  }

  /**
   * Familiar createMany
   */
  export type FamiliarCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Familiars.
     */
    data: FamiliarCreateManyInput | FamiliarCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Familiar createManyAndReturn
   */
  export type FamiliarCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * The data used to create many Familiars.
     */
    data: FamiliarCreateManyInput | FamiliarCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Familiar update
   */
  export type FamiliarUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * The data needed to update a Familiar.
     */
    data: XOR<FamiliarUpdateInput, FamiliarUncheckedUpdateInput>
    /**
     * Choose, which Familiar to update.
     */
    where: FamiliarWhereUniqueInput
  }

  /**
   * Familiar updateMany
   */
  export type FamiliarUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Familiars.
     */
    data: XOR<FamiliarUpdateManyMutationInput, FamiliarUncheckedUpdateManyInput>
    /**
     * Filter which Familiars to update
     */
    where?: FamiliarWhereInput
    /**
     * Limit how many Familiars to update.
     */
    limit?: number
  }

  /**
   * Familiar updateManyAndReturn
   */
  export type FamiliarUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * The data used to update Familiars.
     */
    data: XOR<FamiliarUpdateManyMutationInput, FamiliarUncheckedUpdateManyInput>
    /**
     * Filter which Familiars to update
     */
    where?: FamiliarWhereInput
    /**
     * Limit how many Familiars to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Familiar upsert
   */
  export type FamiliarUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * The filter to search for the Familiar to update in case it exists.
     */
    where: FamiliarWhereUniqueInput
    /**
     * In case the Familiar found by the `where` argument doesn't exist, create a new Familiar with this data.
     */
    create: XOR<FamiliarCreateInput, FamiliarUncheckedCreateInput>
    /**
     * In case the Familiar was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FamiliarUpdateInput, FamiliarUncheckedUpdateInput>
  }

  /**
   * Familiar delete
   */
  export type FamiliarDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
    /**
     * Filter which Familiar to delete.
     */
    where: FamiliarWhereUniqueInput
  }

  /**
   * Familiar deleteMany
   */
  export type FamiliarDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Familiars to delete
     */
    where?: FamiliarWhereInput
    /**
     * Limit how many Familiars to delete.
     */
    limit?: number
  }

  /**
   * Familiar without action
   */
  export type FamiliarDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Familiar
     */
    select?: FamiliarSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Familiar
     */
    omit?: FamiliarOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FamiliarInclude<ExtArgs> | null
  }


  /**
   * Model RegistroDiario
   */

  export type AggregateRegistroDiario = {
    _count: RegistroDiarioCountAggregateOutputType | null
    _min: RegistroDiarioMinAggregateOutputType | null
    _max: RegistroDiarioMaxAggregateOutputType | null
  }

  export type RegistroDiarioMinAggregateOutputType = {
    id: string | null
    fechaRegistro: Date | null
    contenido: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorId: string | null
  }

  export type RegistroDiarioMaxAggregateOutputType = {
    id: string | null
    fechaRegistro: Date | null
    contenido: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorId: string | null
  }

  export type RegistroDiarioCountAggregateOutputType = {
    id: number
    fechaRegistro: number
    contenido: number
    createdAt: number
    updatedAt: number
    clienteId: number
    trabajadorId: number
    _all: number
  }


  export type RegistroDiarioMinAggregateInputType = {
    id?: true
    fechaRegistro?: true
    contenido?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
  }

  export type RegistroDiarioMaxAggregateInputType = {
    id?: true
    fechaRegistro?: true
    contenido?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
  }

  export type RegistroDiarioCountAggregateInputType = {
    id?: true
    fechaRegistro?: true
    contenido?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorId?: true
    _all?: true
  }

  export type RegistroDiarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroDiario to aggregate.
     */
    where?: RegistroDiarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroDiarios to fetch.
     */
    orderBy?: RegistroDiarioOrderByWithRelationInput | RegistroDiarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RegistroDiarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroDiarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroDiarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RegistroDiarios
    **/
    _count?: true | RegistroDiarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RegistroDiarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RegistroDiarioMaxAggregateInputType
  }

  export type GetRegistroDiarioAggregateType<T extends RegistroDiarioAggregateArgs> = {
        [P in keyof T & keyof AggregateRegistroDiario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRegistroDiario[P]>
      : GetScalarType<T[P], AggregateRegistroDiario[P]>
  }




  export type RegistroDiarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistroDiarioWhereInput
    orderBy?: RegistroDiarioOrderByWithAggregationInput | RegistroDiarioOrderByWithAggregationInput[]
    by: RegistroDiarioScalarFieldEnum[] | RegistroDiarioScalarFieldEnum
    having?: RegistroDiarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RegistroDiarioCountAggregateInputType | true
    _min?: RegistroDiarioMinAggregateInputType
    _max?: RegistroDiarioMaxAggregateInputType
  }

  export type RegistroDiarioGroupByOutputType = {
    id: string
    fechaRegistro: Date
    contenido: string
    createdAt: Date
    updatedAt: Date
    clienteId: string
    trabajadorId: string
    _count: RegistroDiarioCountAggregateOutputType | null
    _min: RegistroDiarioMinAggregateOutputType | null
    _max: RegistroDiarioMaxAggregateOutputType | null
  }

  type GetRegistroDiarioGroupByPayload<T extends RegistroDiarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RegistroDiarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RegistroDiarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RegistroDiarioGroupByOutputType[P]>
            : GetScalarType<T[P], RegistroDiarioGroupByOutputType[P]>
        }
      >
    >


  export type RegistroDiarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fechaRegistro?: boolean
    contenido?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroDiario"]>

  export type RegistroDiarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fechaRegistro?: boolean
    contenido?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroDiario"]>

  export type RegistroDiarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fechaRegistro?: boolean
    contenido?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registroDiario"]>

  export type RegistroDiarioSelectScalar = {
    id?: boolean
    fechaRegistro?: boolean
    contenido?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorId?: boolean
  }

  export type RegistroDiarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "fechaRegistro" | "contenido" | "createdAt" | "updatedAt" | "clienteId" | "trabajadorId", ExtArgs["result"]["registroDiario"]>
  export type RegistroDiarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type RegistroDiarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type RegistroDiarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajador?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }

  export type $RegistroDiarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RegistroDiario"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      trabajador: Prisma.$TrabajadorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fechaRegistro: Date
      contenido: string
      createdAt: Date
      updatedAt: Date
      clienteId: string
      trabajadorId: string
    }, ExtArgs["result"]["registroDiario"]>
    composites: {}
  }

  type RegistroDiarioGetPayload<S extends boolean | null | undefined | RegistroDiarioDefaultArgs> = $Result.GetResult<Prisma.$RegistroDiarioPayload, S>

  type RegistroDiarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RegistroDiarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RegistroDiarioCountAggregateInputType | true
    }

  export interface RegistroDiarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RegistroDiario'], meta: { name: 'RegistroDiario' } }
    /**
     * Find zero or one RegistroDiario that matches the filter.
     * @param {RegistroDiarioFindUniqueArgs} args - Arguments to find a RegistroDiario
     * @example
     * // Get one RegistroDiario
     * const registroDiario = await prisma.registroDiario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RegistroDiarioFindUniqueArgs>(args: SelectSubset<T, RegistroDiarioFindUniqueArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RegistroDiario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RegistroDiarioFindUniqueOrThrowArgs} args - Arguments to find a RegistroDiario
     * @example
     * // Get one RegistroDiario
     * const registroDiario = await prisma.registroDiario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RegistroDiarioFindUniqueOrThrowArgs>(args: SelectSubset<T, RegistroDiarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroDiario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroDiarioFindFirstArgs} args - Arguments to find a RegistroDiario
     * @example
     * // Get one RegistroDiario
     * const registroDiario = await prisma.registroDiario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RegistroDiarioFindFirstArgs>(args?: SelectSubset<T, RegistroDiarioFindFirstArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RegistroDiario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroDiarioFindFirstOrThrowArgs} args - Arguments to find a RegistroDiario
     * @example
     * // Get one RegistroDiario
     * const registroDiario = await prisma.registroDiario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RegistroDiarioFindFirstOrThrowArgs>(args?: SelectSubset<T, RegistroDiarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RegistroDiarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroDiarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RegistroDiarios
     * const registroDiarios = await prisma.registroDiario.findMany()
     * 
     * // Get first 10 RegistroDiarios
     * const registroDiarios = await prisma.registroDiario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const registroDiarioWithIdOnly = await prisma.registroDiario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RegistroDiarioFindManyArgs>(args?: SelectSubset<T, RegistroDiarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RegistroDiario.
     * @param {RegistroDiarioCreateArgs} args - Arguments to create a RegistroDiario.
     * @example
     * // Create one RegistroDiario
     * const RegistroDiario = await prisma.registroDiario.create({
     *   data: {
     *     // ... data to create a RegistroDiario
     *   }
     * })
     * 
     */
    create<T extends RegistroDiarioCreateArgs>(args: SelectSubset<T, RegistroDiarioCreateArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RegistroDiarios.
     * @param {RegistroDiarioCreateManyArgs} args - Arguments to create many RegistroDiarios.
     * @example
     * // Create many RegistroDiarios
     * const registroDiario = await prisma.registroDiario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RegistroDiarioCreateManyArgs>(args?: SelectSubset<T, RegistroDiarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RegistroDiarios and returns the data saved in the database.
     * @param {RegistroDiarioCreateManyAndReturnArgs} args - Arguments to create many RegistroDiarios.
     * @example
     * // Create many RegistroDiarios
     * const registroDiario = await prisma.registroDiario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RegistroDiarios and only return the `id`
     * const registroDiarioWithIdOnly = await prisma.registroDiario.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RegistroDiarioCreateManyAndReturnArgs>(args?: SelectSubset<T, RegistroDiarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RegistroDiario.
     * @param {RegistroDiarioDeleteArgs} args - Arguments to delete one RegistroDiario.
     * @example
     * // Delete one RegistroDiario
     * const RegistroDiario = await prisma.registroDiario.delete({
     *   where: {
     *     // ... filter to delete one RegistroDiario
     *   }
     * })
     * 
     */
    delete<T extends RegistroDiarioDeleteArgs>(args: SelectSubset<T, RegistroDiarioDeleteArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RegistroDiario.
     * @param {RegistroDiarioUpdateArgs} args - Arguments to update one RegistroDiario.
     * @example
     * // Update one RegistroDiario
     * const registroDiario = await prisma.registroDiario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RegistroDiarioUpdateArgs>(args: SelectSubset<T, RegistroDiarioUpdateArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RegistroDiarios.
     * @param {RegistroDiarioDeleteManyArgs} args - Arguments to filter RegistroDiarios to delete.
     * @example
     * // Delete a few RegistroDiarios
     * const { count } = await prisma.registroDiario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RegistroDiarioDeleteManyArgs>(args?: SelectSubset<T, RegistroDiarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroDiarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroDiarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RegistroDiarios
     * const registroDiario = await prisma.registroDiario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RegistroDiarioUpdateManyArgs>(args: SelectSubset<T, RegistroDiarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistroDiarios and returns the data updated in the database.
     * @param {RegistroDiarioUpdateManyAndReturnArgs} args - Arguments to update many RegistroDiarios.
     * @example
     * // Update many RegistroDiarios
     * const registroDiario = await prisma.registroDiario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RegistroDiarios and only return the `id`
     * const registroDiarioWithIdOnly = await prisma.registroDiario.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RegistroDiarioUpdateManyAndReturnArgs>(args: SelectSubset<T, RegistroDiarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RegistroDiario.
     * @param {RegistroDiarioUpsertArgs} args - Arguments to update or create a RegistroDiario.
     * @example
     * // Update or create a RegistroDiario
     * const registroDiario = await prisma.registroDiario.upsert({
     *   create: {
     *     // ... data to create a RegistroDiario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RegistroDiario we want to update
     *   }
     * })
     */
    upsert<T extends RegistroDiarioUpsertArgs>(args: SelectSubset<T, RegistroDiarioUpsertArgs<ExtArgs>>): Prisma__RegistroDiarioClient<$Result.GetResult<Prisma.$RegistroDiarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RegistroDiarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroDiarioCountArgs} args - Arguments to filter RegistroDiarios to count.
     * @example
     * // Count the number of RegistroDiarios
     * const count = await prisma.registroDiario.count({
     *   where: {
     *     // ... the filter for the RegistroDiarios we want to count
     *   }
     * })
    **/
    count<T extends RegistroDiarioCountArgs>(
      args?: Subset<T, RegistroDiarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RegistroDiarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RegistroDiario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroDiarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RegistroDiarioAggregateArgs>(args: Subset<T, RegistroDiarioAggregateArgs>): Prisma.PrismaPromise<GetRegistroDiarioAggregateType<T>>

    /**
     * Group by RegistroDiario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistroDiarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RegistroDiarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RegistroDiarioGroupByArgs['orderBy'] }
        : { orderBy?: RegistroDiarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RegistroDiarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegistroDiarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RegistroDiario model
   */
  readonly fields: RegistroDiarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RegistroDiario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RegistroDiarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    trabajador<T extends TrabajadorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrabajadorDefaultArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RegistroDiario model
   */
  interface RegistroDiarioFieldRefs {
    readonly id: FieldRef<"RegistroDiario", 'String'>
    readonly fechaRegistro: FieldRef<"RegistroDiario", 'DateTime'>
    readonly contenido: FieldRef<"RegistroDiario", 'String'>
    readonly createdAt: FieldRef<"RegistroDiario", 'DateTime'>
    readonly updatedAt: FieldRef<"RegistroDiario", 'DateTime'>
    readonly clienteId: FieldRef<"RegistroDiario", 'String'>
    readonly trabajadorId: FieldRef<"RegistroDiario", 'String'>
  }
    

  // Custom InputTypes
  /**
   * RegistroDiario findUnique
   */
  export type RegistroDiarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * Filter, which RegistroDiario to fetch.
     */
    where: RegistroDiarioWhereUniqueInput
  }

  /**
   * RegistroDiario findUniqueOrThrow
   */
  export type RegistroDiarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * Filter, which RegistroDiario to fetch.
     */
    where: RegistroDiarioWhereUniqueInput
  }

  /**
   * RegistroDiario findFirst
   */
  export type RegistroDiarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * Filter, which RegistroDiario to fetch.
     */
    where?: RegistroDiarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroDiarios to fetch.
     */
    orderBy?: RegistroDiarioOrderByWithRelationInput | RegistroDiarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroDiarios.
     */
    cursor?: RegistroDiarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroDiarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroDiarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroDiarios.
     */
    distinct?: RegistroDiarioScalarFieldEnum | RegistroDiarioScalarFieldEnum[]
  }

  /**
   * RegistroDiario findFirstOrThrow
   */
  export type RegistroDiarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * Filter, which RegistroDiario to fetch.
     */
    where?: RegistroDiarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroDiarios to fetch.
     */
    orderBy?: RegistroDiarioOrderByWithRelationInput | RegistroDiarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistroDiarios.
     */
    cursor?: RegistroDiarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroDiarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroDiarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistroDiarios.
     */
    distinct?: RegistroDiarioScalarFieldEnum | RegistroDiarioScalarFieldEnum[]
  }

  /**
   * RegistroDiario findMany
   */
  export type RegistroDiarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * Filter, which RegistroDiarios to fetch.
     */
    where?: RegistroDiarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistroDiarios to fetch.
     */
    orderBy?: RegistroDiarioOrderByWithRelationInput | RegistroDiarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RegistroDiarios.
     */
    cursor?: RegistroDiarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistroDiarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistroDiarios.
     */
    skip?: number
    distinct?: RegistroDiarioScalarFieldEnum | RegistroDiarioScalarFieldEnum[]
  }

  /**
   * RegistroDiario create
   */
  export type RegistroDiarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * The data needed to create a RegistroDiario.
     */
    data: XOR<RegistroDiarioCreateInput, RegistroDiarioUncheckedCreateInput>
  }

  /**
   * RegistroDiario createMany
   */
  export type RegistroDiarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RegistroDiarios.
     */
    data: RegistroDiarioCreateManyInput | RegistroDiarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RegistroDiario createManyAndReturn
   */
  export type RegistroDiarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * The data used to create many RegistroDiarios.
     */
    data: RegistroDiarioCreateManyInput | RegistroDiarioCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RegistroDiario update
   */
  export type RegistroDiarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * The data needed to update a RegistroDiario.
     */
    data: XOR<RegistroDiarioUpdateInput, RegistroDiarioUncheckedUpdateInput>
    /**
     * Choose, which RegistroDiario to update.
     */
    where: RegistroDiarioWhereUniqueInput
  }

  /**
   * RegistroDiario updateMany
   */
  export type RegistroDiarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RegistroDiarios.
     */
    data: XOR<RegistroDiarioUpdateManyMutationInput, RegistroDiarioUncheckedUpdateManyInput>
    /**
     * Filter which RegistroDiarios to update
     */
    where?: RegistroDiarioWhereInput
    /**
     * Limit how many RegistroDiarios to update.
     */
    limit?: number
  }

  /**
   * RegistroDiario updateManyAndReturn
   */
  export type RegistroDiarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * The data used to update RegistroDiarios.
     */
    data: XOR<RegistroDiarioUpdateManyMutationInput, RegistroDiarioUncheckedUpdateManyInput>
    /**
     * Filter which RegistroDiarios to update
     */
    where?: RegistroDiarioWhereInput
    /**
     * Limit how many RegistroDiarios to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RegistroDiario upsert
   */
  export type RegistroDiarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * The filter to search for the RegistroDiario to update in case it exists.
     */
    where: RegistroDiarioWhereUniqueInput
    /**
     * In case the RegistroDiario found by the `where` argument doesn't exist, create a new RegistroDiario with this data.
     */
    create: XOR<RegistroDiarioCreateInput, RegistroDiarioUncheckedCreateInput>
    /**
     * In case the RegistroDiario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RegistroDiarioUpdateInput, RegistroDiarioUncheckedUpdateInput>
  }

  /**
   * RegistroDiario delete
   */
  export type RegistroDiarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
    /**
     * Filter which RegistroDiario to delete.
     */
    where: RegistroDiarioWhereUniqueInput
  }

  /**
   * RegistroDiario deleteMany
   */
  export type RegistroDiarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistroDiarios to delete
     */
    where?: RegistroDiarioWhereInput
    /**
     * Limit how many RegistroDiarios to delete.
     */
    limit?: number
  }

  /**
   * RegistroDiario without action
   */
  export type RegistroDiarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistroDiario
     */
    select?: RegistroDiarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RegistroDiario
     */
    omit?: RegistroDiarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RegistroDiarioInclude<ExtArgs> | null
  }


  /**
   * Model Objetivo
   */

  export type AggregateObjetivo = {
    _count: ObjetivoCountAggregateOutputType | null
    _min: ObjetivoMinAggregateOutputType | null
    _max: ObjetivoMaxAggregateOutputType | null
  }

  export type ObjetivoMinAggregateOutputType = {
    id: string | null
    titulo: string | null
    descripcion: string | null
    fechaInicio: Date | null
    fechaFinPrevista: Date | null
    estado: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorResponsableId: string | null
  }

  export type ObjetivoMaxAggregateOutputType = {
    id: string | null
    titulo: string | null
    descripcion: string | null
    fechaInicio: Date | null
    fechaFinPrevista: Date | null
    estado: string | null
    createdAt: Date | null
    updatedAt: Date | null
    clienteId: string | null
    trabajadorResponsableId: string | null
  }

  export type ObjetivoCountAggregateOutputType = {
    id: number
    titulo: number
    descripcion: number
    fechaInicio: number
    fechaFinPrevista: number
    estado: number
    createdAt: number
    updatedAt: number
    clienteId: number
    trabajadorResponsableId: number
    _all: number
  }


  export type ObjetivoMinAggregateInputType = {
    id?: true
    titulo?: true
    descripcion?: true
    fechaInicio?: true
    fechaFinPrevista?: true
    estado?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorResponsableId?: true
  }

  export type ObjetivoMaxAggregateInputType = {
    id?: true
    titulo?: true
    descripcion?: true
    fechaInicio?: true
    fechaFinPrevista?: true
    estado?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorResponsableId?: true
  }

  export type ObjetivoCountAggregateInputType = {
    id?: true
    titulo?: true
    descripcion?: true
    fechaInicio?: true
    fechaFinPrevista?: true
    estado?: true
    createdAt?: true
    updatedAt?: true
    clienteId?: true
    trabajadorResponsableId?: true
    _all?: true
  }

  export type ObjetivoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Objetivo to aggregate.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Objetivos
    **/
    _count?: true | ObjetivoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ObjetivoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ObjetivoMaxAggregateInputType
  }

  export type GetObjetivoAggregateType<T extends ObjetivoAggregateArgs> = {
        [P in keyof T & keyof AggregateObjetivo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateObjetivo[P]>
      : GetScalarType<T[P], AggregateObjetivo[P]>
  }




  export type ObjetivoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ObjetivoWhereInput
    orderBy?: ObjetivoOrderByWithAggregationInput | ObjetivoOrderByWithAggregationInput[]
    by: ObjetivoScalarFieldEnum[] | ObjetivoScalarFieldEnum
    having?: ObjetivoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ObjetivoCountAggregateInputType | true
    _min?: ObjetivoMinAggregateInputType
    _max?: ObjetivoMaxAggregateInputType
  }

  export type ObjetivoGroupByOutputType = {
    id: string
    titulo: string
    descripcion: string | null
    fechaInicio: Date
    fechaFinPrevista: Date | null
    estado: string
    createdAt: Date
    updatedAt: Date
    clienteId: string
    trabajadorResponsableId: string
    _count: ObjetivoCountAggregateOutputType | null
    _min: ObjetivoMinAggregateOutputType | null
    _max: ObjetivoMaxAggregateOutputType | null
  }

  type GetObjetivoGroupByPayload<T extends ObjetivoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ObjetivoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ObjetivoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ObjetivoGroupByOutputType[P]>
            : GetScalarType<T[P], ObjetivoGroupByOutputType[P]>
        }
      >
    >


  export type ObjetivoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    descripcion?: boolean
    fechaInicio?: boolean
    fechaFinPrevista?: boolean
    estado?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorResponsableId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajadorResponsable?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivo"]>

  export type ObjetivoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    descripcion?: boolean
    fechaInicio?: boolean
    fechaFinPrevista?: boolean
    estado?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorResponsableId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajadorResponsable?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivo"]>

  export type ObjetivoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    descripcion?: boolean
    fechaInicio?: boolean
    fechaFinPrevista?: boolean
    estado?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorResponsableId?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajadorResponsable?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["objetivo"]>

  export type ObjetivoSelectScalar = {
    id?: boolean
    titulo?: boolean
    descripcion?: boolean
    fechaInicio?: boolean
    fechaFinPrevista?: boolean
    estado?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    clienteId?: boolean
    trabajadorResponsableId?: boolean
  }

  export type ObjetivoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "titulo" | "descripcion" | "fechaInicio" | "fechaFinPrevista" | "estado" | "createdAt" | "updatedAt" | "clienteId" | "trabajadorResponsableId", ExtArgs["result"]["objetivo"]>
  export type ObjetivoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajadorResponsable?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type ObjetivoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajadorResponsable?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }
  export type ObjetivoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    trabajadorResponsable?: boolean | TrabajadorDefaultArgs<ExtArgs>
  }

  export type $ObjetivoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Objetivo"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      trabajadorResponsable: Prisma.$TrabajadorPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      titulo: string
      descripcion: string | null
      fechaInicio: Date
      fechaFinPrevista: Date | null
      estado: string
      createdAt: Date
      updatedAt: Date
      clienteId: string
      trabajadorResponsableId: string
    }, ExtArgs["result"]["objetivo"]>
    composites: {}
  }

  type ObjetivoGetPayload<S extends boolean | null | undefined | ObjetivoDefaultArgs> = $Result.GetResult<Prisma.$ObjetivoPayload, S>

  type ObjetivoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ObjetivoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ObjetivoCountAggregateInputType | true
    }

  export interface ObjetivoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Objetivo'], meta: { name: 'Objetivo' } }
    /**
     * Find zero or one Objetivo that matches the filter.
     * @param {ObjetivoFindUniqueArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ObjetivoFindUniqueArgs>(args: SelectSubset<T, ObjetivoFindUniqueArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Objetivo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ObjetivoFindUniqueOrThrowArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ObjetivoFindUniqueOrThrowArgs>(args: SelectSubset<T, ObjetivoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Objetivo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoFindFirstArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ObjetivoFindFirstArgs>(args?: SelectSubset<T, ObjetivoFindFirstArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Objetivo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoFindFirstOrThrowArgs} args - Arguments to find a Objetivo
     * @example
     * // Get one Objetivo
     * const objetivo = await prisma.objetivo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ObjetivoFindFirstOrThrowArgs>(args?: SelectSubset<T, ObjetivoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Objetivos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Objetivos
     * const objetivos = await prisma.objetivo.findMany()
     * 
     * // Get first 10 Objetivos
     * const objetivos = await prisma.objetivo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const objetivoWithIdOnly = await prisma.objetivo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ObjetivoFindManyArgs>(args?: SelectSubset<T, ObjetivoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Objetivo.
     * @param {ObjetivoCreateArgs} args - Arguments to create a Objetivo.
     * @example
     * // Create one Objetivo
     * const Objetivo = await prisma.objetivo.create({
     *   data: {
     *     // ... data to create a Objetivo
     *   }
     * })
     * 
     */
    create<T extends ObjetivoCreateArgs>(args: SelectSubset<T, ObjetivoCreateArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Objetivos.
     * @param {ObjetivoCreateManyArgs} args - Arguments to create many Objetivos.
     * @example
     * // Create many Objetivos
     * const objetivo = await prisma.objetivo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ObjetivoCreateManyArgs>(args?: SelectSubset<T, ObjetivoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Objetivos and returns the data saved in the database.
     * @param {ObjetivoCreateManyAndReturnArgs} args - Arguments to create many Objetivos.
     * @example
     * // Create many Objetivos
     * const objetivo = await prisma.objetivo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Objetivos and only return the `id`
     * const objetivoWithIdOnly = await prisma.objetivo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ObjetivoCreateManyAndReturnArgs>(args?: SelectSubset<T, ObjetivoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Objetivo.
     * @param {ObjetivoDeleteArgs} args - Arguments to delete one Objetivo.
     * @example
     * // Delete one Objetivo
     * const Objetivo = await prisma.objetivo.delete({
     *   where: {
     *     // ... filter to delete one Objetivo
     *   }
     * })
     * 
     */
    delete<T extends ObjetivoDeleteArgs>(args: SelectSubset<T, ObjetivoDeleteArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Objetivo.
     * @param {ObjetivoUpdateArgs} args - Arguments to update one Objetivo.
     * @example
     * // Update one Objetivo
     * const objetivo = await prisma.objetivo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ObjetivoUpdateArgs>(args: SelectSubset<T, ObjetivoUpdateArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Objetivos.
     * @param {ObjetivoDeleteManyArgs} args - Arguments to filter Objetivos to delete.
     * @example
     * // Delete a few Objetivos
     * const { count } = await prisma.objetivo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ObjetivoDeleteManyArgs>(args?: SelectSubset<T, ObjetivoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Objetivos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Objetivos
     * const objetivo = await prisma.objetivo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ObjetivoUpdateManyArgs>(args: SelectSubset<T, ObjetivoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Objetivos and returns the data updated in the database.
     * @param {ObjetivoUpdateManyAndReturnArgs} args - Arguments to update many Objetivos.
     * @example
     * // Update many Objetivos
     * const objetivo = await prisma.objetivo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Objetivos and only return the `id`
     * const objetivoWithIdOnly = await prisma.objetivo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ObjetivoUpdateManyAndReturnArgs>(args: SelectSubset<T, ObjetivoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Objetivo.
     * @param {ObjetivoUpsertArgs} args - Arguments to update or create a Objetivo.
     * @example
     * // Update or create a Objetivo
     * const objetivo = await prisma.objetivo.upsert({
     *   create: {
     *     // ... data to create a Objetivo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Objetivo we want to update
     *   }
     * })
     */
    upsert<T extends ObjetivoUpsertArgs>(args: SelectSubset<T, ObjetivoUpsertArgs<ExtArgs>>): Prisma__ObjetivoClient<$Result.GetResult<Prisma.$ObjetivoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Objetivos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoCountArgs} args - Arguments to filter Objetivos to count.
     * @example
     * // Count the number of Objetivos
     * const count = await prisma.objetivo.count({
     *   where: {
     *     // ... the filter for the Objetivos we want to count
     *   }
     * })
    **/
    count<T extends ObjetivoCountArgs>(
      args?: Subset<T, ObjetivoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ObjetivoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Objetivo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ObjetivoAggregateArgs>(args: Subset<T, ObjetivoAggregateArgs>): Prisma.PrismaPromise<GetObjetivoAggregateType<T>>

    /**
     * Group by Objetivo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ObjetivoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ObjetivoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ObjetivoGroupByArgs['orderBy'] }
        : { orderBy?: ObjetivoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ObjetivoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetObjetivoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Objetivo model
   */
  readonly fields: ObjetivoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Objetivo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ObjetivoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    trabajadorResponsable<T extends TrabajadorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TrabajadorDefaultArgs<ExtArgs>>): Prisma__TrabajadorClient<$Result.GetResult<Prisma.$TrabajadorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Objetivo model
   */
  interface ObjetivoFieldRefs {
    readonly id: FieldRef<"Objetivo", 'String'>
    readonly titulo: FieldRef<"Objetivo", 'String'>
    readonly descripcion: FieldRef<"Objetivo", 'String'>
    readonly fechaInicio: FieldRef<"Objetivo", 'DateTime'>
    readonly fechaFinPrevista: FieldRef<"Objetivo", 'DateTime'>
    readonly estado: FieldRef<"Objetivo", 'String'>
    readonly createdAt: FieldRef<"Objetivo", 'DateTime'>
    readonly updatedAt: FieldRef<"Objetivo", 'DateTime'>
    readonly clienteId: FieldRef<"Objetivo", 'String'>
    readonly trabajadorResponsableId: FieldRef<"Objetivo", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Objetivo findUnique
   */
  export type ObjetivoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo findUniqueOrThrow
   */
  export type ObjetivoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo findFirst
   */
  export type ObjetivoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Objetivos.
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Objetivos.
     */
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Objetivo findFirstOrThrow
   */
  export type ObjetivoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivo to fetch.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Objetivos.
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Objetivos.
     */
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Objetivo findMany
   */
  export type ObjetivoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter, which Objetivos to fetch.
     */
    where?: ObjetivoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Objetivos to fetch.
     */
    orderBy?: ObjetivoOrderByWithRelationInput | ObjetivoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Objetivos.
     */
    cursor?: ObjetivoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Objetivos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Objetivos.
     */
    skip?: number
    distinct?: ObjetivoScalarFieldEnum | ObjetivoScalarFieldEnum[]
  }

  /**
   * Objetivo create
   */
  export type ObjetivoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * The data needed to create a Objetivo.
     */
    data: XOR<ObjetivoCreateInput, ObjetivoUncheckedCreateInput>
  }

  /**
   * Objetivo createMany
   */
  export type ObjetivoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Objetivos.
     */
    data: ObjetivoCreateManyInput | ObjetivoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Objetivo createManyAndReturn
   */
  export type ObjetivoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * The data used to create many Objetivos.
     */
    data: ObjetivoCreateManyInput | ObjetivoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Objetivo update
   */
  export type ObjetivoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * The data needed to update a Objetivo.
     */
    data: XOR<ObjetivoUpdateInput, ObjetivoUncheckedUpdateInput>
    /**
     * Choose, which Objetivo to update.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo updateMany
   */
  export type ObjetivoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Objetivos.
     */
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyInput>
    /**
     * Filter which Objetivos to update
     */
    where?: ObjetivoWhereInput
    /**
     * Limit how many Objetivos to update.
     */
    limit?: number
  }

  /**
   * Objetivo updateManyAndReturn
   */
  export type ObjetivoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * The data used to update Objetivos.
     */
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyInput>
    /**
     * Filter which Objetivos to update
     */
    where?: ObjetivoWhereInput
    /**
     * Limit how many Objetivos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Objetivo upsert
   */
  export type ObjetivoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * The filter to search for the Objetivo to update in case it exists.
     */
    where: ObjetivoWhereUniqueInput
    /**
     * In case the Objetivo found by the `where` argument doesn't exist, create a new Objetivo with this data.
     */
    create: XOR<ObjetivoCreateInput, ObjetivoUncheckedCreateInput>
    /**
     * In case the Objetivo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ObjetivoUpdateInput, ObjetivoUncheckedUpdateInput>
  }

  /**
   * Objetivo delete
   */
  export type ObjetivoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
    /**
     * Filter which Objetivo to delete.
     */
    where: ObjetivoWhereUniqueInput
  }

  /**
   * Objetivo deleteMany
   */
  export type ObjetivoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Objetivos to delete
     */
    where?: ObjetivoWhereInput
    /**
     * Limit how many Objetivos to delete.
     */
    limit?: number
  }

  /**
   * Objetivo without action
   */
  export type ObjetivoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Objetivo
     */
    select?: ObjetivoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Objetivo
     */
    omit?: ObjetivoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ObjetivoInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const RolScalarFieldEnum: {
    id: 'id',
    nombreRol: 'nombreRol',
    codigo: 'codigo',
    descripcion: 'descripcion',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RolScalarFieldEnum = (typeof RolScalarFieldEnum)[keyof typeof RolScalarFieldEnum]


  export const TrabajadorScalarFieldEnum: {
    id: 'id',
    username: 'username',
    passwordHash: 'passwordHash',
    nombre: 'nombre',
    apellidos: 'apellidos',
    email: 'email',
    telefono: 'telefono',
    img: 'img',
    fechaContratacion: 'fechaContratacion',
    activo: 'activo',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    rolId: 'rolId'
  };

  export type TrabajadorScalarFieldEnum = (typeof TrabajadorScalarFieldEnum)[keyof typeof TrabajadorScalarFieldEnum]


  export const ColegioScalarFieldEnum: {
    id: 'id',
    nombre: 'nombre',
    direccionColegio: 'direccionColegio',
    emailTutor: 'emailTutor',
    emailOrientador: 'emailOrientador',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ColegioScalarFieldEnum = (typeof ColegioScalarFieldEnum)[keyof typeof ColegioScalarFieldEnum]


  export const ClienteScalarFieldEnum: {
    id: 'id',
    idCarpetaDrive: 'idCarpetaDrive',
    nombre: 'nombre',
    apellidos: 'apellidos',
    fechaNacimiento: 'fechaNacimiento',
    domicilio: 'domicilio',
    curso: 'curso',
    diagnostico: 'diagnostico',
    tratamientos: 'tratamientos',
    medicacion: 'medicacion',
    alergias: 'alergias',
    activo: 'activo',
    adaptaciones: 'adaptaciones',
    apoyos: 'apoyos',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    colegioId: 'colegioId'
  };

  export type ClienteScalarFieldEnum = (typeof ClienteScalarFieldEnum)[keyof typeof ClienteScalarFieldEnum]


  export const ClienteTrabajadorScalarFieldEnum: {
    clienteId: 'clienteId',
    trabajadorId: 'trabajadorId',
    createdAt: 'createdAt',
    tipoTerapia: 'tipoTerapia'
  };

  export type ClienteTrabajadorScalarFieldEnum = (typeof ClienteTrabajadorScalarFieldEnum)[keyof typeof ClienteTrabajadorScalarFieldEnum]


  export const HorarioScalarFieldEnum: {
    id: 'id',
    fechaHoraInicio: 'fechaHoraInicio',
    fechaHoraFin: 'fechaHoraFin',
    tipoSesion: 'tipoSesion',
    estado: 'estado',
    notas: 'notas',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    clienteId: 'clienteId',
    trabajadorId: 'trabajadorId'
  };

  export type HorarioScalarFieldEnum = (typeof HorarioScalarFieldEnum)[keyof typeof HorarioScalarFieldEnum]


  export const InformeScalarFieldEnum: {
    id: 'id',
    titulo: 'titulo',
    contenido: 'contenido',
    fechaCreacion: 'fechaCreacion',
    fechaVencimiento: 'fechaVencimiento',
    estado: 'estado',
    urlDocumentoFinal: 'urlDocumentoFinal',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    clienteId: 'clienteId',
    trabajadorId: 'trabajadorId'
  };

  export type InformeScalarFieldEnum = (typeof InformeScalarFieldEnum)[keyof typeof InformeScalarFieldEnum]


  export const FamiliarScalarFieldEnum: {
    id: 'id',
    nombreContacto: 'nombreContacto',
    parentesco: 'parentesco',
    telefonoMadre: 'telefonoMadre',
    emailMadre: 'emailMadre',
    telefonoPadre: 'telefonoPadre',
    emailPadre: 'emailPadre',
    telefonoWhatsapp: 'telefonoWhatsapp',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    clienteId: 'clienteId'
  };

  export type FamiliarScalarFieldEnum = (typeof FamiliarScalarFieldEnum)[keyof typeof FamiliarScalarFieldEnum]


  export const RegistroDiarioScalarFieldEnum: {
    id: 'id',
    fechaRegistro: 'fechaRegistro',
    contenido: 'contenido',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    clienteId: 'clienteId',
    trabajadorId: 'trabajadorId'
  };

  export type RegistroDiarioScalarFieldEnum = (typeof RegistroDiarioScalarFieldEnum)[keyof typeof RegistroDiarioScalarFieldEnum]


  export const ObjetivoScalarFieldEnum: {
    id: 'id',
    titulo: 'titulo',
    descripcion: 'descripcion',
    fechaInicio: 'fechaInicio',
    fechaFinPrevista: 'fechaFinPrevista',
    estado: 'estado',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    clienteId: 'clienteId',
    trabajadorResponsableId: 'trabajadorResponsableId'
  };

  export type ObjetivoScalarFieldEnum = (typeof ObjetivoScalarFieldEnum)[keyof typeof ObjetivoScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type RolWhereInput = {
    AND?: RolWhereInput | RolWhereInput[]
    OR?: RolWhereInput[]
    NOT?: RolWhereInput | RolWhereInput[]
    id?: StringFilter<"Rol"> | string
    nombreRol?: StringFilter<"Rol"> | string
    codigo?: StringFilter<"Rol"> | string
    descripcion?: StringNullableFilter<"Rol"> | string | null
    createdAt?: DateTimeFilter<"Rol"> | Date | string
    updatedAt?: DateTimeFilter<"Rol"> | Date | string
    trabajadores?: TrabajadorListRelationFilter
  }

  export type RolOrderByWithRelationInput = {
    id?: SortOrder
    nombreRol?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    trabajadores?: TrabajadorOrderByRelationAggregateInput
  }

  export type RolWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    nombreRol?: string
    codigo?: string
    AND?: RolWhereInput | RolWhereInput[]
    OR?: RolWhereInput[]
    NOT?: RolWhereInput | RolWhereInput[]
    descripcion?: StringNullableFilter<"Rol"> | string | null
    createdAt?: DateTimeFilter<"Rol"> | Date | string
    updatedAt?: DateTimeFilter<"Rol"> | Date | string
    trabajadores?: TrabajadorListRelationFilter
  }, "id" | "nombreRol" | "codigo">

  export type RolOrderByWithAggregationInput = {
    id?: SortOrder
    nombreRol?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RolCountOrderByAggregateInput
    _max?: RolMaxOrderByAggregateInput
    _min?: RolMinOrderByAggregateInput
  }

  export type RolScalarWhereWithAggregatesInput = {
    AND?: RolScalarWhereWithAggregatesInput | RolScalarWhereWithAggregatesInput[]
    OR?: RolScalarWhereWithAggregatesInput[]
    NOT?: RolScalarWhereWithAggregatesInput | RolScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Rol"> | string
    nombreRol?: StringWithAggregatesFilter<"Rol"> | string
    codigo?: StringWithAggregatesFilter<"Rol"> | string
    descripcion?: StringNullableWithAggregatesFilter<"Rol"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Rol"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Rol"> | Date | string
  }

  export type TrabajadorWhereInput = {
    AND?: TrabajadorWhereInput | TrabajadorWhereInput[]
    OR?: TrabajadorWhereInput[]
    NOT?: TrabajadorWhereInput | TrabajadorWhereInput[]
    id?: StringFilter<"Trabajador"> | string
    username?: StringFilter<"Trabajador"> | string
    passwordHash?: StringFilter<"Trabajador"> | string
    nombre?: StringFilter<"Trabajador"> | string
    apellidos?: StringFilter<"Trabajador"> | string
    email?: StringFilter<"Trabajador"> | string
    telefono?: StringNullableFilter<"Trabajador"> | string | null
    img?: StringNullableFilter<"Trabajador"> | string | null
    fechaContratacion?: DateTimeNullableFilter<"Trabajador"> | Date | string | null
    activo?: BoolFilter<"Trabajador"> | boolean
    createdAt?: DateTimeFilter<"Trabajador"> | Date | string
    updatedAt?: DateTimeFilter<"Trabajador"> | Date | string
    rolId?: StringFilter<"Trabajador"> | string
    rol?: XOR<RolScalarRelationFilter, RolWhereInput>
    clientesAsignados?: ClienteTrabajadorListRelationFilter
    horarios?: HorarioListRelationFilter
    informes?: InformeListRelationFilter
    registrosCreados?: RegistroDiarioListRelationFilter
    objetivosAsignados?: ObjetivoListRelationFilter
  }

  export type TrabajadorOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    telefono?: SortOrderInput | SortOrder
    img?: SortOrderInput | SortOrder
    fechaContratacion?: SortOrderInput | SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rolId?: SortOrder
    rol?: RolOrderByWithRelationInput
    clientesAsignados?: ClienteTrabajadorOrderByRelationAggregateInput
    horarios?: HorarioOrderByRelationAggregateInput
    informes?: InformeOrderByRelationAggregateInput
    registrosCreados?: RegistroDiarioOrderByRelationAggregateInput
    objetivosAsignados?: ObjetivoOrderByRelationAggregateInput
  }

  export type TrabajadorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    email?: string
    AND?: TrabajadorWhereInput | TrabajadorWhereInput[]
    OR?: TrabajadorWhereInput[]
    NOT?: TrabajadorWhereInput | TrabajadorWhereInput[]
    passwordHash?: StringFilter<"Trabajador"> | string
    nombre?: StringFilter<"Trabajador"> | string
    apellidos?: StringFilter<"Trabajador"> | string
    telefono?: StringNullableFilter<"Trabajador"> | string | null
    img?: StringNullableFilter<"Trabajador"> | string | null
    fechaContratacion?: DateTimeNullableFilter<"Trabajador"> | Date | string | null
    activo?: BoolFilter<"Trabajador"> | boolean
    createdAt?: DateTimeFilter<"Trabajador"> | Date | string
    updatedAt?: DateTimeFilter<"Trabajador"> | Date | string
    rolId?: StringFilter<"Trabajador"> | string
    rol?: XOR<RolScalarRelationFilter, RolWhereInput>
    clientesAsignados?: ClienteTrabajadorListRelationFilter
    horarios?: HorarioListRelationFilter
    informes?: InformeListRelationFilter
    registrosCreados?: RegistroDiarioListRelationFilter
    objetivosAsignados?: ObjetivoListRelationFilter
  }, "id" | "username" | "email">

  export type TrabajadorOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    telefono?: SortOrderInput | SortOrder
    img?: SortOrderInput | SortOrder
    fechaContratacion?: SortOrderInput | SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rolId?: SortOrder
    _count?: TrabajadorCountOrderByAggregateInput
    _max?: TrabajadorMaxOrderByAggregateInput
    _min?: TrabajadorMinOrderByAggregateInput
  }

  export type TrabajadorScalarWhereWithAggregatesInput = {
    AND?: TrabajadorScalarWhereWithAggregatesInput | TrabajadorScalarWhereWithAggregatesInput[]
    OR?: TrabajadorScalarWhereWithAggregatesInput[]
    NOT?: TrabajadorScalarWhereWithAggregatesInput | TrabajadorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Trabajador"> | string
    username?: StringWithAggregatesFilter<"Trabajador"> | string
    passwordHash?: StringWithAggregatesFilter<"Trabajador"> | string
    nombre?: StringWithAggregatesFilter<"Trabajador"> | string
    apellidos?: StringWithAggregatesFilter<"Trabajador"> | string
    email?: StringWithAggregatesFilter<"Trabajador"> | string
    telefono?: StringNullableWithAggregatesFilter<"Trabajador"> | string | null
    img?: StringNullableWithAggregatesFilter<"Trabajador"> | string | null
    fechaContratacion?: DateTimeNullableWithAggregatesFilter<"Trabajador"> | Date | string | null
    activo?: BoolWithAggregatesFilter<"Trabajador"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Trabajador"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Trabajador"> | Date | string
    rolId?: StringWithAggregatesFilter<"Trabajador"> | string
  }

  export type ColegioWhereInput = {
    AND?: ColegioWhereInput | ColegioWhereInput[]
    OR?: ColegioWhereInput[]
    NOT?: ColegioWhereInput | ColegioWhereInput[]
    id?: StringFilter<"Colegio"> | string
    nombre?: StringFilter<"Colegio"> | string
    direccionColegio?: StringFilter<"Colegio"> | string
    emailTutor?: StringNullableFilter<"Colegio"> | string | null
    emailOrientador?: StringNullableFilter<"Colegio"> | string | null
    createdAt?: DateTimeFilter<"Colegio"> | Date | string
    updatedAt?: DateTimeFilter<"Colegio"> | Date | string
    clientes?: ClienteListRelationFilter
  }

  export type ColegioOrderByWithRelationInput = {
    id?: SortOrder
    nombre?: SortOrder
    direccionColegio?: SortOrder
    emailTutor?: SortOrderInput | SortOrder
    emailOrientador?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clientes?: ClienteOrderByRelationAggregateInput
  }

  export type ColegioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    nombre?: string
    AND?: ColegioWhereInput | ColegioWhereInput[]
    OR?: ColegioWhereInput[]
    NOT?: ColegioWhereInput | ColegioWhereInput[]
    direccionColegio?: StringFilter<"Colegio"> | string
    emailTutor?: StringNullableFilter<"Colegio"> | string | null
    emailOrientador?: StringNullableFilter<"Colegio"> | string | null
    createdAt?: DateTimeFilter<"Colegio"> | Date | string
    updatedAt?: DateTimeFilter<"Colegio"> | Date | string
    clientes?: ClienteListRelationFilter
  }, "id" | "nombre">

  export type ColegioOrderByWithAggregationInput = {
    id?: SortOrder
    nombre?: SortOrder
    direccionColegio?: SortOrder
    emailTutor?: SortOrderInput | SortOrder
    emailOrientador?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ColegioCountOrderByAggregateInput
    _max?: ColegioMaxOrderByAggregateInput
    _min?: ColegioMinOrderByAggregateInput
  }

  export type ColegioScalarWhereWithAggregatesInput = {
    AND?: ColegioScalarWhereWithAggregatesInput | ColegioScalarWhereWithAggregatesInput[]
    OR?: ColegioScalarWhereWithAggregatesInput[]
    NOT?: ColegioScalarWhereWithAggregatesInput | ColegioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Colegio"> | string
    nombre?: StringWithAggregatesFilter<"Colegio"> | string
    direccionColegio?: StringWithAggregatesFilter<"Colegio"> | string
    emailTutor?: StringNullableWithAggregatesFilter<"Colegio"> | string | null
    emailOrientador?: StringNullableWithAggregatesFilter<"Colegio"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Colegio"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Colegio"> | Date | string
  }

  export type ClienteWhereInput = {
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    id?: StringFilter<"Cliente"> | string
    idCarpetaDrive?: StringNullableFilter<"Cliente"> | string | null
    nombre?: StringFilter<"Cliente"> | string
    apellidos?: StringFilter<"Cliente"> | string
    fechaNacimiento?: DateTimeNullableFilter<"Cliente"> | Date | string | null
    domicilio?: StringFilter<"Cliente"> | string
    curso?: StringFilter<"Cliente"> | string
    diagnostico?: StringFilter<"Cliente"> | string
    tratamientos?: StringFilter<"Cliente"> | string
    medicacion?: StringFilter<"Cliente"> | string
    alergias?: StringNullableFilter<"Cliente"> | string | null
    activo?: BoolFilter<"Cliente"> | boolean
    adaptaciones?: BoolFilter<"Cliente"> | boolean
    apoyos?: BoolFilter<"Cliente"> | boolean
    createdAt?: DateTimeFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeFilter<"Cliente"> | Date | string
    colegioId?: StringNullableFilter<"Cliente"> | string | null
    trabajadoresAsignados?: ClienteTrabajadorListRelationFilter
    colegio?: XOR<ColegioNullableScalarRelationFilter, ColegioWhereInput> | null
    horarios?: HorarioListRelationFilter
    informes?: InformeListRelationFilter
    contactosFamiliares?: FamiliarListRelationFilter
    registrosDiarios?: RegistroDiarioListRelationFilter
    objetivos?: ObjetivoListRelationFilter
  }

  export type ClienteOrderByWithRelationInput = {
    id?: SortOrder
    idCarpetaDrive?: SortOrderInput | SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    fechaNacimiento?: SortOrderInput | SortOrder
    domicilio?: SortOrder
    curso?: SortOrder
    diagnostico?: SortOrder
    tratamientos?: SortOrder
    medicacion?: SortOrder
    alergias?: SortOrderInput | SortOrder
    activo?: SortOrder
    adaptaciones?: SortOrder
    apoyos?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    colegioId?: SortOrderInput | SortOrder
    trabajadoresAsignados?: ClienteTrabajadorOrderByRelationAggregateInput
    colegio?: ColegioOrderByWithRelationInput
    horarios?: HorarioOrderByRelationAggregateInput
    informes?: InformeOrderByRelationAggregateInput
    contactosFamiliares?: FamiliarOrderByRelationAggregateInput
    registrosDiarios?: RegistroDiarioOrderByRelationAggregateInput
    objetivos?: ObjetivoOrderByRelationAggregateInput
  }

  export type ClienteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    idCarpetaDrive?: StringNullableFilter<"Cliente"> | string | null
    nombre?: StringFilter<"Cliente"> | string
    apellidos?: StringFilter<"Cliente"> | string
    fechaNacimiento?: DateTimeNullableFilter<"Cliente"> | Date | string | null
    domicilio?: StringFilter<"Cliente"> | string
    curso?: StringFilter<"Cliente"> | string
    diagnostico?: StringFilter<"Cliente"> | string
    tratamientos?: StringFilter<"Cliente"> | string
    medicacion?: StringFilter<"Cliente"> | string
    alergias?: StringNullableFilter<"Cliente"> | string | null
    activo?: BoolFilter<"Cliente"> | boolean
    adaptaciones?: BoolFilter<"Cliente"> | boolean
    apoyos?: BoolFilter<"Cliente"> | boolean
    createdAt?: DateTimeFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeFilter<"Cliente"> | Date | string
    colegioId?: StringNullableFilter<"Cliente"> | string | null
    trabajadoresAsignados?: ClienteTrabajadorListRelationFilter
    colegio?: XOR<ColegioNullableScalarRelationFilter, ColegioWhereInput> | null
    horarios?: HorarioListRelationFilter
    informes?: InformeListRelationFilter
    contactosFamiliares?: FamiliarListRelationFilter
    registrosDiarios?: RegistroDiarioListRelationFilter
    objetivos?: ObjetivoListRelationFilter
  }, "id">

  export type ClienteOrderByWithAggregationInput = {
    id?: SortOrder
    idCarpetaDrive?: SortOrderInput | SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    fechaNacimiento?: SortOrderInput | SortOrder
    domicilio?: SortOrder
    curso?: SortOrder
    diagnostico?: SortOrder
    tratamientos?: SortOrder
    medicacion?: SortOrder
    alergias?: SortOrderInput | SortOrder
    activo?: SortOrder
    adaptaciones?: SortOrder
    apoyos?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    colegioId?: SortOrderInput | SortOrder
    _count?: ClienteCountOrderByAggregateInput
    _max?: ClienteMaxOrderByAggregateInput
    _min?: ClienteMinOrderByAggregateInput
  }

  export type ClienteScalarWhereWithAggregatesInput = {
    AND?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    OR?: ClienteScalarWhereWithAggregatesInput[]
    NOT?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Cliente"> | string
    idCarpetaDrive?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    nombre?: StringWithAggregatesFilter<"Cliente"> | string
    apellidos?: StringWithAggregatesFilter<"Cliente"> | string
    fechaNacimiento?: DateTimeNullableWithAggregatesFilter<"Cliente"> | Date | string | null
    domicilio?: StringWithAggregatesFilter<"Cliente"> | string
    curso?: StringWithAggregatesFilter<"Cliente"> | string
    diagnostico?: StringWithAggregatesFilter<"Cliente"> | string
    tratamientos?: StringWithAggregatesFilter<"Cliente"> | string
    medicacion?: StringWithAggregatesFilter<"Cliente"> | string
    alergias?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    activo?: BoolWithAggregatesFilter<"Cliente"> | boolean
    adaptaciones?: BoolWithAggregatesFilter<"Cliente"> | boolean
    apoyos?: BoolWithAggregatesFilter<"Cliente"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Cliente"> | Date | string
    colegioId?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
  }

  export type ClienteTrabajadorWhereInput = {
    AND?: ClienteTrabajadorWhereInput | ClienteTrabajadorWhereInput[]
    OR?: ClienteTrabajadorWhereInput[]
    NOT?: ClienteTrabajadorWhereInput | ClienteTrabajadorWhereInput[]
    clienteId?: StringFilter<"ClienteTrabajador"> | string
    trabajadorId?: StringFilter<"ClienteTrabajador"> | string
    createdAt?: DateTimeFilter<"ClienteTrabajador"> | Date | string
    tipoTerapia?: StringNullableFilter<"ClienteTrabajador"> | string | null
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }

  export type ClienteTrabajadorOrderByWithRelationInput = {
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    createdAt?: SortOrder
    tipoTerapia?: SortOrderInput | SortOrder
    cliente?: ClienteOrderByWithRelationInput
    trabajador?: TrabajadorOrderByWithRelationInput
  }

  export type ClienteTrabajadorWhereUniqueInput = Prisma.AtLeast<{
    clienteId_trabajadorId?: ClienteTrabajadorClienteIdTrabajadorIdCompoundUniqueInput
    AND?: ClienteTrabajadorWhereInput | ClienteTrabajadorWhereInput[]
    OR?: ClienteTrabajadorWhereInput[]
    NOT?: ClienteTrabajadorWhereInput | ClienteTrabajadorWhereInput[]
    clienteId?: StringFilter<"ClienteTrabajador"> | string
    trabajadorId?: StringFilter<"ClienteTrabajador"> | string
    createdAt?: DateTimeFilter<"ClienteTrabajador"> | Date | string
    tipoTerapia?: StringNullableFilter<"ClienteTrabajador"> | string | null
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }, "clienteId_trabajadorId">

  export type ClienteTrabajadorOrderByWithAggregationInput = {
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    createdAt?: SortOrder
    tipoTerapia?: SortOrderInput | SortOrder
    _count?: ClienteTrabajadorCountOrderByAggregateInput
    _max?: ClienteTrabajadorMaxOrderByAggregateInput
    _min?: ClienteTrabajadorMinOrderByAggregateInput
  }

  export type ClienteTrabajadorScalarWhereWithAggregatesInput = {
    AND?: ClienteTrabajadorScalarWhereWithAggregatesInput | ClienteTrabajadorScalarWhereWithAggregatesInput[]
    OR?: ClienteTrabajadorScalarWhereWithAggregatesInput[]
    NOT?: ClienteTrabajadorScalarWhereWithAggregatesInput | ClienteTrabajadorScalarWhereWithAggregatesInput[]
    clienteId?: StringWithAggregatesFilter<"ClienteTrabajador"> | string
    trabajadorId?: StringWithAggregatesFilter<"ClienteTrabajador"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ClienteTrabajador"> | Date | string
    tipoTerapia?: StringNullableWithAggregatesFilter<"ClienteTrabajador"> | string | null
  }

  export type HorarioWhereInput = {
    AND?: HorarioWhereInput | HorarioWhereInput[]
    OR?: HorarioWhereInput[]
    NOT?: HorarioWhereInput | HorarioWhereInput[]
    id?: StringFilter<"Horario"> | string
    fechaHoraInicio?: DateTimeFilter<"Horario"> | Date | string
    fechaHoraFin?: DateTimeFilter<"Horario"> | Date | string
    tipoSesion?: StringFilter<"Horario"> | string
    estado?: StringFilter<"Horario"> | string
    notas?: StringNullableFilter<"Horario"> | string | null
    createdAt?: DateTimeFilter<"Horario"> | Date | string
    updatedAt?: DateTimeFilter<"Horario"> | Date | string
    clienteId?: StringFilter<"Horario"> | string
    trabajadorId?: StringFilter<"Horario"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }

  export type HorarioOrderByWithRelationInput = {
    id?: SortOrder
    fechaHoraInicio?: SortOrder
    fechaHoraFin?: SortOrder
    tipoSesion?: SortOrder
    estado?: SortOrder
    notas?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
    trabajador?: TrabajadorOrderByWithRelationInput
  }

  export type HorarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: HorarioWhereInput | HorarioWhereInput[]
    OR?: HorarioWhereInput[]
    NOT?: HorarioWhereInput | HorarioWhereInput[]
    fechaHoraInicio?: DateTimeFilter<"Horario"> | Date | string
    fechaHoraFin?: DateTimeFilter<"Horario"> | Date | string
    tipoSesion?: StringFilter<"Horario"> | string
    estado?: StringFilter<"Horario"> | string
    notas?: StringNullableFilter<"Horario"> | string | null
    createdAt?: DateTimeFilter<"Horario"> | Date | string
    updatedAt?: DateTimeFilter<"Horario"> | Date | string
    clienteId?: StringFilter<"Horario"> | string
    trabajadorId?: StringFilter<"Horario"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }, "id">

  export type HorarioOrderByWithAggregationInput = {
    id?: SortOrder
    fechaHoraInicio?: SortOrder
    fechaHoraFin?: SortOrder
    tipoSesion?: SortOrder
    estado?: SortOrder
    notas?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    _count?: HorarioCountOrderByAggregateInput
    _max?: HorarioMaxOrderByAggregateInput
    _min?: HorarioMinOrderByAggregateInput
  }

  export type HorarioScalarWhereWithAggregatesInput = {
    AND?: HorarioScalarWhereWithAggregatesInput | HorarioScalarWhereWithAggregatesInput[]
    OR?: HorarioScalarWhereWithAggregatesInput[]
    NOT?: HorarioScalarWhereWithAggregatesInput | HorarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Horario"> | string
    fechaHoraInicio?: DateTimeWithAggregatesFilter<"Horario"> | Date | string
    fechaHoraFin?: DateTimeWithAggregatesFilter<"Horario"> | Date | string
    tipoSesion?: StringWithAggregatesFilter<"Horario"> | string
    estado?: StringWithAggregatesFilter<"Horario"> | string
    notas?: StringNullableWithAggregatesFilter<"Horario"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Horario"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Horario"> | Date | string
    clienteId?: StringWithAggregatesFilter<"Horario"> | string
    trabajadorId?: StringWithAggregatesFilter<"Horario"> | string
  }

  export type InformeWhereInput = {
    AND?: InformeWhereInput | InformeWhereInput[]
    OR?: InformeWhereInput[]
    NOT?: InformeWhereInput | InformeWhereInput[]
    id?: StringFilter<"Informe"> | string
    titulo?: StringFilter<"Informe"> | string
    contenido?: StringFilter<"Informe"> | string
    fechaCreacion?: DateTimeFilter<"Informe"> | Date | string
    fechaVencimiento?: DateTimeNullableFilter<"Informe"> | Date | string | null
    estado?: StringFilter<"Informe"> | string
    urlDocumentoFinal?: StringNullableFilter<"Informe"> | string | null
    createdAt?: DateTimeFilter<"Informe"> | Date | string
    updatedAt?: DateTimeFilter<"Informe"> | Date | string
    clienteId?: StringFilter<"Informe"> | string
    trabajadorId?: StringFilter<"Informe"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }

  export type InformeOrderByWithRelationInput = {
    id?: SortOrder
    titulo?: SortOrder
    contenido?: SortOrder
    fechaCreacion?: SortOrder
    fechaVencimiento?: SortOrderInput | SortOrder
    estado?: SortOrder
    urlDocumentoFinal?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
    trabajador?: TrabajadorOrderByWithRelationInput
  }

  export type InformeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InformeWhereInput | InformeWhereInput[]
    OR?: InformeWhereInput[]
    NOT?: InformeWhereInput | InformeWhereInput[]
    titulo?: StringFilter<"Informe"> | string
    contenido?: StringFilter<"Informe"> | string
    fechaCreacion?: DateTimeFilter<"Informe"> | Date | string
    fechaVencimiento?: DateTimeNullableFilter<"Informe"> | Date | string | null
    estado?: StringFilter<"Informe"> | string
    urlDocumentoFinal?: StringNullableFilter<"Informe"> | string | null
    createdAt?: DateTimeFilter<"Informe"> | Date | string
    updatedAt?: DateTimeFilter<"Informe"> | Date | string
    clienteId?: StringFilter<"Informe"> | string
    trabajadorId?: StringFilter<"Informe"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }, "id">

  export type InformeOrderByWithAggregationInput = {
    id?: SortOrder
    titulo?: SortOrder
    contenido?: SortOrder
    fechaCreacion?: SortOrder
    fechaVencimiento?: SortOrderInput | SortOrder
    estado?: SortOrder
    urlDocumentoFinal?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    _count?: InformeCountOrderByAggregateInput
    _max?: InformeMaxOrderByAggregateInput
    _min?: InformeMinOrderByAggregateInput
  }

  export type InformeScalarWhereWithAggregatesInput = {
    AND?: InformeScalarWhereWithAggregatesInput | InformeScalarWhereWithAggregatesInput[]
    OR?: InformeScalarWhereWithAggregatesInput[]
    NOT?: InformeScalarWhereWithAggregatesInput | InformeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Informe"> | string
    titulo?: StringWithAggregatesFilter<"Informe"> | string
    contenido?: StringWithAggregatesFilter<"Informe"> | string
    fechaCreacion?: DateTimeWithAggregatesFilter<"Informe"> | Date | string
    fechaVencimiento?: DateTimeNullableWithAggregatesFilter<"Informe"> | Date | string | null
    estado?: StringWithAggregatesFilter<"Informe"> | string
    urlDocumentoFinal?: StringNullableWithAggregatesFilter<"Informe"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Informe"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Informe"> | Date | string
    clienteId?: StringWithAggregatesFilter<"Informe"> | string
    trabajadorId?: StringWithAggregatesFilter<"Informe"> | string
  }

  export type FamiliarWhereInput = {
    AND?: FamiliarWhereInput | FamiliarWhereInput[]
    OR?: FamiliarWhereInput[]
    NOT?: FamiliarWhereInput | FamiliarWhereInput[]
    id?: StringFilter<"Familiar"> | string
    nombreContacto?: StringFilter<"Familiar"> | string
    parentesco?: StringNullableFilter<"Familiar"> | string | null
    telefonoMadre?: StringNullableFilter<"Familiar"> | string | null
    emailMadre?: StringNullableFilter<"Familiar"> | string | null
    telefonoPadre?: StringNullableFilter<"Familiar"> | string | null
    emailPadre?: StringNullableFilter<"Familiar"> | string | null
    telefonoWhatsapp?: StringNullableFilter<"Familiar"> | string | null
    createdAt?: DateTimeFilter<"Familiar"> | Date | string
    updatedAt?: DateTimeFilter<"Familiar"> | Date | string
    clienteId?: StringFilter<"Familiar"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
  }

  export type FamiliarOrderByWithRelationInput = {
    id?: SortOrder
    nombreContacto?: SortOrder
    parentesco?: SortOrderInput | SortOrder
    telefonoMadre?: SortOrderInput | SortOrder
    emailMadre?: SortOrderInput | SortOrder
    telefonoPadre?: SortOrderInput | SortOrder
    emailPadre?: SortOrderInput | SortOrder
    telefonoWhatsapp?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
  }

  export type FamiliarWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FamiliarWhereInput | FamiliarWhereInput[]
    OR?: FamiliarWhereInput[]
    NOT?: FamiliarWhereInput | FamiliarWhereInput[]
    nombreContacto?: StringFilter<"Familiar"> | string
    parentesco?: StringNullableFilter<"Familiar"> | string | null
    telefonoMadre?: StringNullableFilter<"Familiar"> | string | null
    emailMadre?: StringNullableFilter<"Familiar"> | string | null
    telefonoPadre?: StringNullableFilter<"Familiar"> | string | null
    emailPadre?: StringNullableFilter<"Familiar"> | string | null
    telefonoWhatsapp?: StringNullableFilter<"Familiar"> | string | null
    createdAt?: DateTimeFilter<"Familiar"> | Date | string
    updatedAt?: DateTimeFilter<"Familiar"> | Date | string
    clienteId?: StringFilter<"Familiar"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
  }, "id">

  export type FamiliarOrderByWithAggregationInput = {
    id?: SortOrder
    nombreContacto?: SortOrder
    parentesco?: SortOrderInput | SortOrder
    telefonoMadre?: SortOrderInput | SortOrder
    emailMadre?: SortOrderInput | SortOrder
    telefonoPadre?: SortOrderInput | SortOrder
    emailPadre?: SortOrderInput | SortOrder
    telefonoWhatsapp?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    _count?: FamiliarCountOrderByAggregateInput
    _max?: FamiliarMaxOrderByAggregateInput
    _min?: FamiliarMinOrderByAggregateInput
  }

  export type FamiliarScalarWhereWithAggregatesInput = {
    AND?: FamiliarScalarWhereWithAggregatesInput | FamiliarScalarWhereWithAggregatesInput[]
    OR?: FamiliarScalarWhereWithAggregatesInput[]
    NOT?: FamiliarScalarWhereWithAggregatesInput | FamiliarScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Familiar"> | string
    nombreContacto?: StringWithAggregatesFilter<"Familiar"> | string
    parentesco?: StringNullableWithAggregatesFilter<"Familiar"> | string | null
    telefonoMadre?: StringNullableWithAggregatesFilter<"Familiar"> | string | null
    emailMadre?: StringNullableWithAggregatesFilter<"Familiar"> | string | null
    telefonoPadre?: StringNullableWithAggregatesFilter<"Familiar"> | string | null
    emailPadre?: StringNullableWithAggregatesFilter<"Familiar"> | string | null
    telefonoWhatsapp?: StringNullableWithAggregatesFilter<"Familiar"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Familiar"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Familiar"> | Date | string
    clienteId?: StringWithAggregatesFilter<"Familiar"> | string
  }

  export type RegistroDiarioWhereInput = {
    AND?: RegistroDiarioWhereInput | RegistroDiarioWhereInput[]
    OR?: RegistroDiarioWhereInput[]
    NOT?: RegistroDiarioWhereInput | RegistroDiarioWhereInput[]
    id?: StringFilter<"RegistroDiario"> | string
    fechaRegistro?: DateTimeFilter<"RegistroDiario"> | Date | string
    contenido?: StringFilter<"RegistroDiario"> | string
    createdAt?: DateTimeFilter<"RegistroDiario"> | Date | string
    updatedAt?: DateTimeFilter<"RegistroDiario"> | Date | string
    clienteId?: StringFilter<"RegistroDiario"> | string
    trabajadorId?: StringFilter<"RegistroDiario"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }

  export type RegistroDiarioOrderByWithRelationInput = {
    id?: SortOrder
    fechaRegistro?: SortOrder
    contenido?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
    trabajador?: TrabajadorOrderByWithRelationInput
  }

  export type RegistroDiarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RegistroDiarioWhereInput | RegistroDiarioWhereInput[]
    OR?: RegistroDiarioWhereInput[]
    NOT?: RegistroDiarioWhereInput | RegistroDiarioWhereInput[]
    fechaRegistro?: DateTimeFilter<"RegistroDiario"> | Date | string
    contenido?: StringFilter<"RegistroDiario"> | string
    createdAt?: DateTimeFilter<"RegistroDiario"> | Date | string
    updatedAt?: DateTimeFilter<"RegistroDiario"> | Date | string
    clienteId?: StringFilter<"RegistroDiario"> | string
    trabajadorId?: StringFilter<"RegistroDiario"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajador?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }, "id">

  export type RegistroDiarioOrderByWithAggregationInput = {
    id?: SortOrder
    fechaRegistro?: SortOrder
    contenido?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    _count?: RegistroDiarioCountOrderByAggregateInput
    _max?: RegistroDiarioMaxOrderByAggregateInput
    _min?: RegistroDiarioMinOrderByAggregateInput
  }

  export type RegistroDiarioScalarWhereWithAggregatesInput = {
    AND?: RegistroDiarioScalarWhereWithAggregatesInput | RegistroDiarioScalarWhereWithAggregatesInput[]
    OR?: RegistroDiarioScalarWhereWithAggregatesInput[]
    NOT?: RegistroDiarioScalarWhereWithAggregatesInput | RegistroDiarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RegistroDiario"> | string
    fechaRegistro?: DateTimeWithAggregatesFilter<"RegistroDiario"> | Date | string
    contenido?: StringWithAggregatesFilter<"RegistroDiario"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RegistroDiario"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RegistroDiario"> | Date | string
    clienteId?: StringWithAggregatesFilter<"RegistroDiario"> | string
    trabajadorId?: StringWithAggregatesFilter<"RegistroDiario"> | string
  }

  export type ObjetivoWhereInput = {
    AND?: ObjetivoWhereInput | ObjetivoWhereInput[]
    OR?: ObjetivoWhereInput[]
    NOT?: ObjetivoWhereInput | ObjetivoWhereInput[]
    id?: StringFilter<"Objetivo"> | string
    titulo?: StringFilter<"Objetivo"> | string
    descripcion?: StringNullableFilter<"Objetivo"> | string | null
    fechaInicio?: DateTimeFilter<"Objetivo"> | Date | string
    fechaFinPrevista?: DateTimeNullableFilter<"Objetivo"> | Date | string | null
    estado?: StringFilter<"Objetivo"> | string
    createdAt?: DateTimeFilter<"Objetivo"> | Date | string
    updatedAt?: DateTimeFilter<"Objetivo"> | Date | string
    clienteId?: StringFilter<"Objetivo"> | string
    trabajadorResponsableId?: StringFilter<"Objetivo"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajadorResponsable?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }

  export type ObjetivoOrderByWithRelationInput = {
    id?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    fechaInicio?: SortOrder
    fechaFinPrevista?: SortOrderInput | SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorResponsableId?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
    trabajadorResponsable?: TrabajadorOrderByWithRelationInput
  }

  export type ObjetivoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ObjetivoWhereInput | ObjetivoWhereInput[]
    OR?: ObjetivoWhereInput[]
    NOT?: ObjetivoWhereInput | ObjetivoWhereInput[]
    titulo?: StringFilter<"Objetivo"> | string
    descripcion?: StringNullableFilter<"Objetivo"> | string | null
    fechaInicio?: DateTimeFilter<"Objetivo"> | Date | string
    fechaFinPrevista?: DateTimeNullableFilter<"Objetivo"> | Date | string | null
    estado?: StringFilter<"Objetivo"> | string
    createdAt?: DateTimeFilter<"Objetivo"> | Date | string
    updatedAt?: DateTimeFilter<"Objetivo"> | Date | string
    clienteId?: StringFilter<"Objetivo"> | string
    trabajadorResponsableId?: StringFilter<"Objetivo"> | string
    cliente?: XOR<ClienteScalarRelationFilter, ClienteWhereInput>
    trabajadorResponsable?: XOR<TrabajadorScalarRelationFilter, TrabajadorWhereInput>
  }, "id">

  export type ObjetivoOrderByWithAggregationInput = {
    id?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    fechaInicio?: SortOrder
    fechaFinPrevista?: SortOrderInput | SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorResponsableId?: SortOrder
    _count?: ObjetivoCountOrderByAggregateInput
    _max?: ObjetivoMaxOrderByAggregateInput
    _min?: ObjetivoMinOrderByAggregateInput
  }

  export type ObjetivoScalarWhereWithAggregatesInput = {
    AND?: ObjetivoScalarWhereWithAggregatesInput | ObjetivoScalarWhereWithAggregatesInput[]
    OR?: ObjetivoScalarWhereWithAggregatesInput[]
    NOT?: ObjetivoScalarWhereWithAggregatesInput | ObjetivoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Objetivo"> | string
    titulo?: StringWithAggregatesFilter<"Objetivo"> | string
    descripcion?: StringNullableWithAggregatesFilter<"Objetivo"> | string | null
    fechaInicio?: DateTimeWithAggregatesFilter<"Objetivo"> | Date | string
    fechaFinPrevista?: DateTimeNullableWithAggregatesFilter<"Objetivo"> | Date | string | null
    estado?: StringWithAggregatesFilter<"Objetivo"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Objetivo"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Objetivo"> | Date | string
    clienteId?: StringWithAggregatesFilter<"Objetivo"> | string
    trabajadorResponsableId?: StringWithAggregatesFilter<"Objetivo"> | string
  }

  export type RolCreateInput = {
    id?: string
    nombreRol: string
    codigo: string
    descripcion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadores?: TrabajadorCreateNestedManyWithoutRolInput
  }

  export type RolUncheckedCreateInput = {
    id?: string
    nombreRol: string
    codigo: string
    descripcion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadores?: TrabajadorUncheckedCreateNestedManyWithoutRolInput
  }

  export type RolUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreRol?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadores?: TrabajadorUpdateManyWithoutRolNestedInput
  }

  export type RolUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreRol?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadores?: TrabajadorUncheckedUpdateManyWithoutRolNestedInput
  }

  export type RolCreateManyInput = {
    id?: string
    nombreRol: string
    codigo: string
    descripcion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RolUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreRol?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreRol?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrabajadorCreateInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rol: RolCreateNestedOneWithoutTrabajadoresInput
    clientesAsignados?: ClienteTrabajadorCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioCreateNestedManyWithoutTrabajadorInput
    informes?: InformeCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorUncheckedCreateInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rolId: string
    clientesAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutTrabajadorInput
    informes?: InformeUncheckedCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioUncheckedCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoUncheckedCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rol?: RolUpdateOneRequiredWithoutTrabajadoresNestedInput
    clientesAsignados?: ClienteTrabajadorUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rolId?: StringFieldUpdateOperationsInput | string
    clientesAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUncheckedUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorCreateManyInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rolId: string
  }

  export type TrabajadorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrabajadorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rolId?: StringFieldUpdateOperationsInput | string
  }

  export type ColegioCreateInput = {
    id?: string
    nombre: string
    direccionColegio: string
    emailTutor?: string | null
    emailOrientador?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clientes?: ClienteCreateNestedManyWithoutColegioInput
  }

  export type ColegioUncheckedCreateInput = {
    id?: string
    nombre: string
    direccionColegio: string
    emailTutor?: string | null
    emailOrientador?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clientes?: ClienteUncheckedCreateNestedManyWithoutColegioInput
  }

  export type ColegioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    direccionColegio?: StringFieldUpdateOperationsInput | string
    emailTutor?: NullableStringFieldUpdateOperationsInput | string | null
    emailOrientador?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientes?: ClienteUpdateManyWithoutColegioNestedInput
  }

  export type ColegioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    direccionColegio?: StringFieldUpdateOperationsInput | string
    emailTutor?: NullableStringFieldUpdateOperationsInput | string | null
    emailOrientador?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientes?: ClienteUncheckedUpdateManyWithoutColegioNestedInput
  }

  export type ColegioCreateManyInput = {
    id?: string
    nombre: string
    direccionColegio: string
    emailTutor?: string | null
    emailOrientador?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ColegioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    direccionColegio?: StringFieldUpdateOperationsInput | string
    emailTutor?: NullableStringFieldUpdateOperationsInput | string | null
    emailOrientador?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColegioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    direccionColegio?: StringFieldUpdateOperationsInput | string
    emailTutor?: NullableStringFieldUpdateOperationsInput | string | null
    emailOrientador?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteCreateInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorCreateNestedManyWithoutClienteInput
    colegio?: ColegioCreateNestedOneWithoutClientesInput
    horarios?: HorarioCreateNestedManyWithoutClienteInput
    informes?: InformeCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutClienteInput
    informes?: InformeUncheckedCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarUncheckedCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUpdateManyWithoutClienteNestedInput
    colegio?: ColegioUpdateOneWithoutClientesNestedInput
    horarios?: HorarioUpdateManyWithoutClienteNestedInput
    informes?: InformeUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutClienteNestedInput
    informes?: InformeUncheckedUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUncheckedUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteCreateManyInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
  }

  export type ClienteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClienteTrabajadorCreateInput = {
    createdAt?: Date | string
    tipoTerapia?: string | null
    cliente: ClienteCreateNestedOneWithoutTrabajadoresAsignadosInput
    trabajador: TrabajadorCreateNestedOneWithoutClientesAsignadosInput
  }

  export type ClienteTrabajadorUncheckedCreateInput = {
    clienteId: string
    trabajadorId: string
    createdAt?: Date | string
    tipoTerapia?: string | null
  }

  export type ClienteTrabajadorUpdateInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
    cliente?: ClienteUpdateOneRequiredWithoutTrabajadoresAsignadosNestedInput
    trabajador?: TrabajadorUpdateOneRequiredWithoutClientesAsignadosNestedInput
  }

  export type ClienteTrabajadorUncheckedUpdateInput = {
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClienteTrabajadorCreateManyInput = {
    clienteId: string
    trabajadorId: string
    createdAt?: Date | string
    tipoTerapia?: string | null
  }

  export type ClienteTrabajadorUpdateManyMutationInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClienteTrabajadorUncheckedUpdateManyInput = {
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HorarioCreateInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutHorariosInput
    trabajador: TrabajadorCreateNestedOneWithoutHorariosInput
  }

  export type HorarioUncheckedCreateInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorId: string
  }

  export type HorarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutHorariosNestedInput
    trabajador?: TrabajadorUpdateOneRequiredWithoutHorariosNestedInput
  }

  export type HorarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type HorarioCreateManyInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorId: string
  }

  export type HorarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HorarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type InformeCreateInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutInformesInput
    trabajador: TrabajadorCreateNestedOneWithoutInformesInput
  }

  export type InformeUncheckedCreateInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorId: string
  }

  export type InformeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutInformesNestedInput
    trabajador?: TrabajadorUpdateOneRequiredWithoutInformesNestedInput
  }

  export type InformeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type InformeCreateManyInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorId: string
  }

  export type InformeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InformeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type FamiliarCreateInput = {
    id?: string
    nombreContacto: string
    parentesco?: string | null
    telefonoMadre?: string | null
    emailMadre?: string | null
    telefonoPadre?: string | null
    emailPadre?: string | null
    telefonoWhatsapp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutContactosFamiliaresInput
  }

  export type FamiliarUncheckedCreateInput = {
    id?: string
    nombreContacto: string
    parentesco?: string | null
    telefonoMadre?: string | null
    emailMadre?: string | null
    telefonoPadre?: string | null
    emailPadre?: string | null
    telefonoWhatsapp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type FamiliarUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreContacto?: StringFieldUpdateOperationsInput | string
    parentesco?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoMadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailMadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoPadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailPadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoWhatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutContactosFamiliaresNestedInput
  }

  export type FamiliarUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreContacto?: StringFieldUpdateOperationsInput | string
    parentesco?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoMadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailMadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoPadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailPadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoWhatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type FamiliarCreateManyInput = {
    id?: string
    nombreContacto: string
    parentesco?: string | null
    telefonoMadre?: string | null
    emailMadre?: string | null
    telefonoPadre?: string | null
    emailPadre?: string | null
    telefonoWhatsapp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type FamiliarUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreContacto?: StringFieldUpdateOperationsInput | string
    parentesco?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoMadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailMadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoPadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailPadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoWhatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FamiliarUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreContacto?: StringFieldUpdateOperationsInput | string
    parentesco?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoMadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailMadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoPadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailPadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoWhatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroDiarioCreateInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutRegistrosDiariosInput
    trabajador: TrabajadorCreateNestedOneWithoutRegistrosCreadosInput
  }

  export type RegistroDiarioUncheckedCreateInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorId: string
  }

  export type RegistroDiarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutRegistrosDiariosNestedInput
    trabajador?: TrabajadorUpdateOneRequiredWithoutRegistrosCreadosNestedInput
  }

  export type RegistroDiarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroDiarioCreateManyInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorId: string
  }

  export type RegistroDiarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RegistroDiarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type ObjetivoCreateInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutObjetivosInput
    trabajadorResponsable: TrabajadorCreateNestedOneWithoutObjetivosAsignadosInput
  }

  export type ObjetivoUncheckedCreateInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorResponsableId: string
  }

  export type ObjetivoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutObjetivosNestedInput
    trabajadorResponsable?: TrabajadorUpdateOneRequiredWithoutObjetivosAsignadosNestedInput
  }

  export type ObjetivoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorResponsableId?: StringFieldUpdateOperationsInput | string
  }

  export type ObjetivoCreateManyInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
    trabajadorResponsableId: string
  }

  export type ObjetivoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ObjetivoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
    trabajadorResponsableId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TrabajadorListRelationFilter = {
    every?: TrabajadorWhereInput
    some?: TrabajadorWhereInput
    none?: TrabajadorWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TrabajadorOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RolCountOrderByAggregateInput = {
    id?: SortOrder
    nombreRol?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RolMaxOrderByAggregateInput = {
    id?: SortOrder
    nombreRol?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RolMinOrderByAggregateInput = {
    id?: SortOrder
    nombreRol?: SortOrder
    codigo?: SortOrder
    descripcion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type RolScalarRelationFilter = {
    is?: RolWhereInput
    isNot?: RolWhereInput
  }

  export type ClienteTrabajadorListRelationFilter = {
    every?: ClienteTrabajadorWhereInput
    some?: ClienteTrabajadorWhereInput
    none?: ClienteTrabajadorWhereInput
  }

  export type HorarioListRelationFilter = {
    every?: HorarioWhereInput
    some?: HorarioWhereInput
    none?: HorarioWhereInput
  }

  export type InformeListRelationFilter = {
    every?: InformeWhereInput
    some?: InformeWhereInput
    none?: InformeWhereInput
  }

  export type RegistroDiarioListRelationFilter = {
    every?: RegistroDiarioWhereInput
    some?: RegistroDiarioWhereInput
    none?: RegistroDiarioWhereInput
  }

  export type ObjetivoListRelationFilter = {
    every?: ObjetivoWhereInput
    some?: ObjetivoWhereInput
    none?: ObjetivoWhereInput
  }

  export type ClienteTrabajadorOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type HorarioOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InformeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RegistroDiarioOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ObjetivoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TrabajadorCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    img?: SortOrder
    fechaContratacion?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rolId?: SortOrder
  }

  export type TrabajadorMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    img?: SortOrder
    fechaContratacion?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rolId?: SortOrder
  }

  export type TrabajadorMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    email?: SortOrder
    telefono?: SortOrder
    img?: SortOrder
    fechaContratacion?: SortOrder
    activo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    rolId?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ClienteListRelationFilter = {
    every?: ClienteWhereInput
    some?: ClienteWhereInput
    none?: ClienteWhereInput
  }

  export type ClienteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ColegioCountOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    direccionColegio?: SortOrder
    emailTutor?: SortOrder
    emailOrientador?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ColegioMaxOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    direccionColegio?: SortOrder
    emailTutor?: SortOrder
    emailOrientador?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ColegioMinOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    direccionColegio?: SortOrder
    emailTutor?: SortOrder
    emailOrientador?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ColegioNullableScalarRelationFilter = {
    is?: ColegioWhereInput | null
    isNot?: ColegioWhereInput | null
  }

  export type FamiliarListRelationFilter = {
    every?: FamiliarWhereInput
    some?: FamiliarWhereInput
    none?: FamiliarWhereInput
  }

  export type FamiliarOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClienteCountOrderByAggregateInput = {
    id?: SortOrder
    idCarpetaDrive?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    fechaNacimiento?: SortOrder
    domicilio?: SortOrder
    curso?: SortOrder
    diagnostico?: SortOrder
    tratamientos?: SortOrder
    medicacion?: SortOrder
    alergias?: SortOrder
    activo?: SortOrder
    adaptaciones?: SortOrder
    apoyos?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    colegioId?: SortOrder
  }

  export type ClienteMaxOrderByAggregateInput = {
    id?: SortOrder
    idCarpetaDrive?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    fechaNacimiento?: SortOrder
    domicilio?: SortOrder
    curso?: SortOrder
    diagnostico?: SortOrder
    tratamientos?: SortOrder
    medicacion?: SortOrder
    alergias?: SortOrder
    activo?: SortOrder
    adaptaciones?: SortOrder
    apoyos?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    colegioId?: SortOrder
  }

  export type ClienteMinOrderByAggregateInput = {
    id?: SortOrder
    idCarpetaDrive?: SortOrder
    nombre?: SortOrder
    apellidos?: SortOrder
    fechaNacimiento?: SortOrder
    domicilio?: SortOrder
    curso?: SortOrder
    diagnostico?: SortOrder
    tratamientos?: SortOrder
    medicacion?: SortOrder
    alergias?: SortOrder
    activo?: SortOrder
    adaptaciones?: SortOrder
    apoyos?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    colegioId?: SortOrder
  }

  export type ClienteScalarRelationFilter = {
    is?: ClienteWhereInput
    isNot?: ClienteWhereInput
  }

  export type TrabajadorScalarRelationFilter = {
    is?: TrabajadorWhereInput
    isNot?: TrabajadorWhereInput
  }

  export type ClienteTrabajadorClienteIdTrabajadorIdCompoundUniqueInput = {
    clienteId: string
    trabajadorId: string
  }

  export type ClienteTrabajadorCountOrderByAggregateInput = {
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    createdAt?: SortOrder
    tipoTerapia?: SortOrder
  }

  export type ClienteTrabajadorMaxOrderByAggregateInput = {
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    createdAt?: SortOrder
    tipoTerapia?: SortOrder
  }

  export type ClienteTrabajadorMinOrderByAggregateInput = {
    clienteId?: SortOrder
    trabajadorId?: SortOrder
    createdAt?: SortOrder
    tipoTerapia?: SortOrder
  }

  export type HorarioCountOrderByAggregateInput = {
    id?: SortOrder
    fechaHoraInicio?: SortOrder
    fechaHoraFin?: SortOrder
    tipoSesion?: SortOrder
    estado?: SortOrder
    notas?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type HorarioMaxOrderByAggregateInput = {
    id?: SortOrder
    fechaHoraInicio?: SortOrder
    fechaHoraFin?: SortOrder
    tipoSesion?: SortOrder
    estado?: SortOrder
    notas?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type HorarioMinOrderByAggregateInput = {
    id?: SortOrder
    fechaHoraInicio?: SortOrder
    fechaHoraFin?: SortOrder
    tipoSesion?: SortOrder
    estado?: SortOrder
    notas?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type InformeCountOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    contenido?: SortOrder
    fechaCreacion?: SortOrder
    fechaVencimiento?: SortOrder
    estado?: SortOrder
    urlDocumentoFinal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type InformeMaxOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    contenido?: SortOrder
    fechaCreacion?: SortOrder
    fechaVencimiento?: SortOrder
    estado?: SortOrder
    urlDocumentoFinal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type InformeMinOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    contenido?: SortOrder
    fechaCreacion?: SortOrder
    fechaVencimiento?: SortOrder
    estado?: SortOrder
    urlDocumentoFinal?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type FamiliarCountOrderByAggregateInput = {
    id?: SortOrder
    nombreContacto?: SortOrder
    parentesco?: SortOrder
    telefonoMadre?: SortOrder
    emailMadre?: SortOrder
    telefonoPadre?: SortOrder
    emailPadre?: SortOrder
    telefonoWhatsapp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
  }

  export type FamiliarMaxOrderByAggregateInput = {
    id?: SortOrder
    nombreContacto?: SortOrder
    parentesco?: SortOrder
    telefonoMadre?: SortOrder
    emailMadre?: SortOrder
    telefonoPadre?: SortOrder
    emailPadre?: SortOrder
    telefonoWhatsapp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
  }

  export type FamiliarMinOrderByAggregateInput = {
    id?: SortOrder
    nombreContacto?: SortOrder
    parentesco?: SortOrder
    telefonoMadre?: SortOrder
    emailMadre?: SortOrder
    telefonoPadre?: SortOrder
    emailPadre?: SortOrder
    telefonoWhatsapp?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
  }

  export type RegistroDiarioCountOrderByAggregateInput = {
    id?: SortOrder
    fechaRegistro?: SortOrder
    contenido?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type RegistroDiarioMaxOrderByAggregateInput = {
    id?: SortOrder
    fechaRegistro?: SortOrder
    contenido?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type RegistroDiarioMinOrderByAggregateInput = {
    id?: SortOrder
    fechaRegistro?: SortOrder
    contenido?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorId?: SortOrder
  }

  export type ObjetivoCountOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    fechaInicio?: SortOrder
    fechaFinPrevista?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorResponsableId?: SortOrder
  }

  export type ObjetivoMaxOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    fechaInicio?: SortOrder
    fechaFinPrevista?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorResponsableId?: SortOrder
  }

  export type ObjetivoMinOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    descripcion?: SortOrder
    fechaInicio?: SortOrder
    fechaFinPrevista?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    clienteId?: SortOrder
    trabajadorResponsableId?: SortOrder
  }

  export type TrabajadorCreateNestedManyWithoutRolInput = {
    create?: XOR<TrabajadorCreateWithoutRolInput, TrabajadorUncheckedCreateWithoutRolInput> | TrabajadorCreateWithoutRolInput[] | TrabajadorUncheckedCreateWithoutRolInput[]
    connectOrCreate?: TrabajadorCreateOrConnectWithoutRolInput | TrabajadorCreateOrConnectWithoutRolInput[]
    createMany?: TrabajadorCreateManyRolInputEnvelope
    connect?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
  }

  export type TrabajadorUncheckedCreateNestedManyWithoutRolInput = {
    create?: XOR<TrabajadorCreateWithoutRolInput, TrabajadorUncheckedCreateWithoutRolInput> | TrabajadorCreateWithoutRolInput[] | TrabajadorUncheckedCreateWithoutRolInput[]
    connectOrCreate?: TrabajadorCreateOrConnectWithoutRolInput | TrabajadorCreateOrConnectWithoutRolInput[]
    createMany?: TrabajadorCreateManyRolInputEnvelope
    connect?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TrabajadorUpdateManyWithoutRolNestedInput = {
    create?: XOR<TrabajadorCreateWithoutRolInput, TrabajadorUncheckedCreateWithoutRolInput> | TrabajadorCreateWithoutRolInput[] | TrabajadorUncheckedCreateWithoutRolInput[]
    connectOrCreate?: TrabajadorCreateOrConnectWithoutRolInput | TrabajadorCreateOrConnectWithoutRolInput[]
    upsert?: TrabajadorUpsertWithWhereUniqueWithoutRolInput | TrabajadorUpsertWithWhereUniqueWithoutRolInput[]
    createMany?: TrabajadorCreateManyRolInputEnvelope
    set?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    disconnect?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    delete?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    connect?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    update?: TrabajadorUpdateWithWhereUniqueWithoutRolInput | TrabajadorUpdateWithWhereUniqueWithoutRolInput[]
    updateMany?: TrabajadorUpdateManyWithWhereWithoutRolInput | TrabajadorUpdateManyWithWhereWithoutRolInput[]
    deleteMany?: TrabajadorScalarWhereInput | TrabajadorScalarWhereInput[]
  }

  export type TrabajadorUncheckedUpdateManyWithoutRolNestedInput = {
    create?: XOR<TrabajadorCreateWithoutRolInput, TrabajadorUncheckedCreateWithoutRolInput> | TrabajadorCreateWithoutRolInput[] | TrabajadorUncheckedCreateWithoutRolInput[]
    connectOrCreate?: TrabajadorCreateOrConnectWithoutRolInput | TrabajadorCreateOrConnectWithoutRolInput[]
    upsert?: TrabajadorUpsertWithWhereUniqueWithoutRolInput | TrabajadorUpsertWithWhereUniqueWithoutRolInput[]
    createMany?: TrabajadorCreateManyRolInputEnvelope
    set?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    disconnect?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    delete?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    connect?: TrabajadorWhereUniqueInput | TrabajadorWhereUniqueInput[]
    update?: TrabajadorUpdateWithWhereUniqueWithoutRolInput | TrabajadorUpdateWithWhereUniqueWithoutRolInput[]
    updateMany?: TrabajadorUpdateManyWithWhereWithoutRolInput | TrabajadorUpdateManyWithWhereWithoutRolInput[]
    deleteMany?: TrabajadorScalarWhereInput | TrabajadorScalarWhereInput[]
  }

  export type RolCreateNestedOneWithoutTrabajadoresInput = {
    create?: XOR<RolCreateWithoutTrabajadoresInput, RolUncheckedCreateWithoutTrabajadoresInput>
    connectOrCreate?: RolCreateOrConnectWithoutTrabajadoresInput
    connect?: RolWhereUniqueInput
  }

  export type ClienteTrabajadorCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutTrabajadorInput, ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput> | ClienteTrabajadorCreateWithoutTrabajadorInput[] | ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput | ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput[]
    createMany?: ClienteTrabajadorCreateManyTrabajadorInputEnvelope
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
  }

  export type HorarioCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<HorarioCreateWithoutTrabajadorInput, HorarioUncheckedCreateWithoutTrabajadorInput> | HorarioCreateWithoutTrabajadorInput[] | HorarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutTrabajadorInput | HorarioCreateOrConnectWithoutTrabajadorInput[]
    createMany?: HorarioCreateManyTrabajadorInputEnvelope
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
  }

  export type InformeCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<InformeCreateWithoutTrabajadorInput, InformeUncheckedCreateWithoutTrabajadorInput> | InformeCreateWithoutTrabajadorInput[] | InformeUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutTrabajadorInput | InformeCreateOrConnectWithoutTrabajadorInput[]
    createMany?: InformeCreateManyTrabajadorInputEnvelope
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
  }

  export type RegistroDiarioCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<RegistroDiarioCreateWithoutTrabajadorInput, RegistroDiarioUncheckedCreateWithoutTrabajadorInput> | RegistroDiarioCreateWithoutTrabajadorInput[] | RegistroDiarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutTrabajadorInput | RegistroDiarioCreateOrConnectWithoutTrabajadorInput[]
    createMany?: RegistroDiarioCreateManyTrabajadorInputEnvelope
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
  }

  export type ObjetivoCreateNestedManyWithoutTrabajadorResponsableInput = {
    create?: XOR<ObjetivoCreateWithoutTrabajadorResponsableInput, ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput> | ObjetivoCreateWithoutTrabajadorResponsableInput[] | ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput | ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput[]
    createMany?: ObjetivoCreateManyTrabajadorResponsableInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type ClienteTrabajadorUncheckedCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutTrabajadorInput, ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput> | ClienteTrabajadorCreateWithoutTrabajadorInput[] | ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput | ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput[]
    createMany?: ClienteTrabajadorCreateManyTrabajadorInputEnvelope
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
  }

  export type HorarioUncheckedCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<HorarioCreateWithoutTrabajadorInput, HorarioUncheckedCreateWithoutTrabajadorInput> | HorarioCreateWithoutTrabajadorInput[] | HorarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutTrabajadorInput | HorarioCreateOrConnectWithoutTrabajadorInput[]
    createMany?: HorarioCreateManyTrabajadorInputEnvelope
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
  }

  export type InformeUncheckedCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<InformeCreateWithoutTrabajadorInput, InformeUncheckedCreateWithoutTrabajadorInput> | InformeCreateWithoutTrabajadorInput[] | InformeUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutTrabajadorInput | InformeCreateOrConnectWithoutTrabajadorInput[]
    createMany?: InformeCreateManyTrabajadorInputEnvelope
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
  }

  export type RegistroDiarioUncheckedCreateNestedManyWithoutTrabajadorInput = {
    create?: XOR<RegistroDiarioCreateWithoutTrabajadorInput, RegistroDiarioUncheckedCreateWithoutTrabajadorInput> | RegistroDiarioCreateWithoutTrabajadorInput[] | RegistroDiarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutTrabajadorInput | RegistroDiarioCreateOrConnectWithoutTrabajadorInput[]
    createMany?: RegistroDiarioCreateManyTrabajadorInputEnvelope
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
  }

  export type ObjetivoUncheckedCreateNestedManyWithoutTrabajadorResponsableInput = {
    create?: XOR<ObjetivoCreateWithoutTrabajadorResponsableInput, ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput> | ObjetivoCreateWithoutTrabajadorResponsableInput[] | ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput | ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput[]
    createMany?: ObjetivoCreateManyTrabajadorResponsableInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type RolUpdateOneRequiredWithoutTrabajadoresNestedInput = {
    create?: XOR<RolCreateWithoutTrabajadoresInput, RolUncheckedCreateWithoutTrabajadoresInput>
    connectOrCreate?: RolCreateOrConnectWithoutTrabajadoresInput
    upsert?: RolUpsertWithoutTrabajadoresInput
    connect?: RolWhereUniqueInput
    update?: XOR<XOR<RolUpdateToOneWithWhereWithoutTrabajadoresInput, RolUpdateWithoutTrabajadoresInput>, RolUncheckedUpdateWithoutTrabajadoresInput>
  }

  export type ClienteTrabajadorUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutTrabajadorInput, ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput> | ClienteTrabajadorCreateWithoutTrabajadorInput[] | ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput | ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput[]
    upsert?: ClienteTrabajadorUpsertWithWhereUniqueWithoutTrabajadorInput | ClienteTrabajadorUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: ClienteTrabajadorCreateManyTrabajadorInputEnvelope
    set?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    disconnect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    delete?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    update?: ClienteTrabajadorUpdateWithWhereUniqueWithoutTrabajadorInput | ClienteTrabajadorUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: ClienteTrabajadorUpdateManyWithWhereWithoutTrabajadorInput | ClienteTrabajadorUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: ClienteTrabajadorScalarWhereInput | ClienteTrabajadorScalarWhereInput[]
  }

  export type HorarioUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<HorarioCreateWithoutTrabajadorInput, HorarioUncheckedCreateWithoutTrabajadorInput> | HorarioCreateWithoutTrabajadorInput[] | HorarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutTrabajadorInput | HorarioCreateOrConnectWithoutTrabajadorInput[]
    upsert?: HorarioUpsertWithWhereUniqueWithoutTrabajadorInput | HorarioUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: HorarioCreateManyTrabajadorInputEnvelope
    set?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    disconnect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    delete?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    update?: HorarioUpdateWithWhereUniqueWithoutTrabajadorInput | HorarioUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: HorarioUpdateManyWithWhereWithoutTrabajadorInput | HorarioUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: HorarioScalarWhereInput | HorarioScalarWhereInput[]
  }

  export type InformeUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<InformeCreateWithoutTrabajadorInput, InformeUncheckedCreateWithoutTrabajadorInput> | InformeCreateWithoutTrabajadorInput[] | InformeUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutTrabajadorInput | InformeCreateOrConnectWithoutTrabajadorInput[]
    upsert?: InformeUpsertWithWhereUniqueWithoutTrabajadorInput | InformeUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: InformeCreateManyTrabajadorInputEnvelope
    set?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    disconnect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    delete?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    update?: InformeUpdateWithWhereUniqueWithoutTrabajadorInput | InformeUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: InformeUpdateManyWithWhereWithoutTrabajadorInput | InformeUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: InformeScalarWhereInput | InformeScalarWhereInput[]
  }

  export type RegistroDiarioUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<RegistroDiarioCreateWithoutTrabajadorInput, RegistroDiarioUncheckedCreateWithoutTrabajadorInput> | RegistroDiarioCreateWithoutTrabajadorInput[] | RegistroDiarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutTrabajadorInput | RegistroDiarioCreateOrConnectWithoutTrabajadorInput[]
    upsert?: RegistroDiarioUpsertWithWhereUniqueWithoutTrabajadorInput | RegistroDiarioUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: RegistroDiarioCreateManyTrabajadorInputEnvelope
    set?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    disconnect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    delete?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    update?: RegistroDiarioUpdateWithWhereUniqueWithoutTrabajadorInput | RegistroDiarioUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: RegistroDiarioUpdateManyWithWhereWithoutTrabajadorInput | RegistroDiarioUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: RegistroDiarioScalarWhereInput | RegistroDiarioScalarWhereInput[]
  }

  export type ObjetivoUpdateManyWithoutTrabajadorResponsableNestedInput = {
    create?: XOR<ObjetivoCreateWithoutTrabajadorResponsableInput, ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput> | ObjetivoCreateWithoutTrabajadorResponsableInput[] | ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput | ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutTrabajadorResponsableInput | ObjetivoUpsertWithWhereUniqueWithoutTrabajadorResponsableInput[]
    createMany?: ObjetivoCreateManyTrabajadorResponsableInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutTrabajadorResponsableInput | ObjetivoUpdateWithWhereUniqueWithoutTrabajadorResponsableInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutTrabajadorResponsableInput | ObjetivoUpdateManyWithWhereWithoutTrabajadorResponsableInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutTrabajadorInput, ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput> | ClienteTrabajadorCreateWithoutTrabajadorInput[] | ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput | ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput[]
    upsert?: ClienteTrabajadorUpsertWithWhereUniqueWithoutTrabajadorInput | ClienteTrabajadorUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: ClienteTrabajadorCreateManyTrabajadorInputEnvelope
    set?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    disconnect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    delete?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    update?: ClienteTrabajadorUpdateWithWhereUniqueWithoutTrabajadorInput | ClienteTrabajadorUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: ClienteTrabajadorUpdateManyWithWhereWithoutTrabajadorInput | ClienteTrabajadorUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: ClienteTrabajadorScalarWhereInput | ClienteTrabajadorScalarWhereInput[]
  }

  export type HorarioUncheckedUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<HorarioCreateWithoutTrabajadorInput, HorarioUncheckedCreateWithoutTrabajadorInput> | HorarioCreateWithoutTrabajadorInput[] | HorarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutTrabajadorInput | HorarioCreateOrConnectWithoutTrabajadorInput[]
    upsert?: HorarioUpsertWithWhereUniqueWithoutTrabajadorInput | HorarioUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: HorarioCreateManyTrabajadorInputEnvelope
    set?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    disconnect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    delete?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    update?: HorarioUpdateWithWhereUniqueWithoutTrabajadorInput | HorarioUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: HorarioUpdateManyWithWhereWithoutTrabajadorInput | HorarioUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: HorarioScalarWhereInput | HorarioScalarWhereInput[]
  }

  export type InformeUncheckedUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<InformeCreateWithoutTrabajadorInput, InformeUncheckedCreateWithoutTrabajadorInput> | InformeCreateWithoutTrabajadorInput[] | InformeUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutTrabajadorInput | InformeCreateOrConnectWithoutTrabajadorInput[]
    upsert?: InformeUpsertWithWhereUniqueWithoutTrabajadorInput | InformeUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: InformeCreateManyTrabajadorInputEnvelope
    set?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    disconnect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    delete?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    update?: InformeUpdateWithWhereUniqueWithoutTrabajadorInput | InformeUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: InformeUpdateManyWithWhereWithoutTrabajadorInput | InformeUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: InformeScalarWhereInput | InformeScalarWhereInput[]
  }

  export type RegistroDiarioUncheckedUpdateManyWithoutTrabajadorNestedInput = {
    create?: XOR<RegistroDiarioCreateWithoutTrabajadorInput, RegistroDiarioUncheckedCreateWithoutTrabajadorInput> | RegistroDiarioCreateWithoutTrabajadorInput[] | RegistroDiarioUncheckedCreateWithoutTrabajadorInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutTrabajadorInput | RegistroDiarioCreateOrConnectWithoutTrabajadorInput[]
    upsert?: RegistroDiarioUpsertWithWhereUniqueWithoutTrabajadorInput | RegistroDiarioUpsertWithWhereUniqueWithoutTrabajadorInput[]
    createMany?: RegistroDiarioCreateManyTrabajadorInputEnvelope
    set?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    disconnect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    delete?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    update?: RegistroDiarioUpdateWithWhereUniqueWithoutTrabajadorInput | RegistroDiarioUpdateWithWhereUniqueWithoutTrabajadorInput[]
    updateMany?: RegistroDiarioUpdateManyWithWhereWithoutTrabajadorInput | RegistroDiarioUpdateManyWithWhereWithoutTrabajadorInput[]
    deleteMany?: RegistroDiarioScalarWhereInput | RegistroDiarioScalarWhereInput[]
  }

  export type ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableNestedInput = {
    create?: XOR<ObjetivoCreateWithoutTrabajadorResponsableInput, ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput> | ObjetivoCreateWithoutTrabajadorResponsableInput[] | ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput | ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutTrabajadorResponsableInput | ObjetivoUpsertWithWhereUniqueWithoutTrabajadorResponsableInput[]
    createMany?: ObjetivoCreateManyTrabajadorResponsableInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutTrabajadorResponsableInput | ObjetivoUpdateWithWhereUniqueWithoutTrabajadorResponsableInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutTrabajadorResponsableInput | ObjetivoUpdateManyWithWhereWithoutTrabajadorResponsableInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type ClienteCreateNestedManyWithoutColegioInput = {
    create?: XOR<ClienteCreateWithoutColegioInput, ClienteUncheckedCreateWithoutColegioInput> | ClienteCreateWithoutColegioInput[] | ClienteUncheckedCreateWithoutColegioInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutColegioInput | ClienteCreateOrConnectWithoutColegioInput[]
    createMany?: ClienteCreateManyColegioInputEnvelope
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
  }

  export type ClienteUncheckedCreateNestedManyWithoutColegioInput = {
    create?: XOR<ClienteCreateWithoutColegioInput, ClienteUncheckedCreateWithoutColegioInput> | ClienteCreateWithoutColegioInput[] | ClienteUncheckedCreateWithoutColegioInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutColegioInput | ClienteCreateOrConnectWithoutColegioInput[]
    createMany?: ClienteCreateManyColegioInputEnvelope
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
  }

  export type ClienteUpdateManyWithoutColegioNestedInput = {
    create?: XOR<ClienteCreateWithoutColegioInput, ClienteUncheckedCreateWithoutColegioInput> | ClienteCreateWithoutColegioInput[] | ClienteUncheckedCreateWithoutColegioInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutColegioInput | ClienteCreateOrConnectWithoutColegioInput[]
    upsert?: ClienteUpsertWithWhereUniqueWithoutColegioInput | ClienteUpsertWithWhereUniqueWithoutColegioInput[]
    createMany?: ClienteCreateManyColegioInputEnvelope
    set?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    disconnect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    delete?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    update?: ClienteUpdateWithWhereUniqueWithoutColegioInput | ClienteUpdateWithWhereUniqueWithoutColegioInput[]
    updateMany?: ClienteUpdateManyWithWhereWithoutColegioInput | ClienteUpdateManyWithWhereWithoutColegioInput[]
    deleteMany?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
  }

  export type ClienteUncheckedUpdateManyWithoutColegioNestedInput = {
    create?: XOR<ClienteCreateWithoutColegioInput, ClienteUncheckedCreateWithoutColegioInput> | ClienteCreateWithoutColegioInput[] | ClienteUncheckedCreateWithoutColegioInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutColegioInput | ClienteCreateOrConnectWithoutColegioInput[]
    upsert?: ClienteUpsertWithWhereUniqueWithoutColegioInput | ClienteUpsertWithWhereUniqueWithoutColegioInput[]
    createMany?: ClienteCreateManyColegioInputEnvelope
    set?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    disconnect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    delete?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    update?: ClienteUpdateWithWhereUniqueWithoutColegioInput | ClienteUpdateWithWhereUniqueWithoutColegioInput[]
    updateMany?: ClienteUpdateManyWithWhereWithoutColegioInput | ClienteUpdateManyWithWhereWithoutColegioInput[]
    deleteMany?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
  }

  export type ClienteTrabajadorCreateNestedManyWithoutClienteInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutClienteInput, ClienteTrabajadorUncheckedCreateWithoutClienteInput> | ClienteTrabajadorCreateWithoutClienteInput[] | ClienteTrabajadorUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutClienteInput | ClienteTrabajadorCreateOrConnectWithoutClienteInput[]
    createMany?: ClienteTrabajadorCreateManyClienteInputEnvelope
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
  }

  export type ColegioCreateNestedOneWithoutClientesInput = {
    create?: XOR<ColegioCreateWithoutClientesInput, ColegioUncheckedCreateWithoutClientesInput>
    connectOrCreate?: ColegioCreateOrConnectWithoutClientesInput
    connect?: ColegioWhereUniqueInput
  }

  export type HorarioCreateNestedManyWithoutClienteInput = {
    create?: XOR<HorarioCreateWithoutClienteInput, HorarioUncheckedCreateWithoutClienteInput> | HorarioCreateWithoutClienteInput[] | HorarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutClienteInput | HorarioCreateOrConnectWithoutClienteInput[]
    createMany?: HorarioCreateManyClienteInputEnvelope
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
  }

  export type InformeCreateNestedManyWithoutClienteInput = {
    create?: XOR<InformeCreateWithoutClienteInput, InformeUncheckedCreateWithoutClienteInput> | InformeCreateWithoutClienteInput[] | InformeUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutClienteInput | InformeCreateOrConnectWithoutClienteInput[]
    createMany?: InformeCreateManyClienteInputEnvelope
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
  }

  export type FamiliarCreateNestedManyWithoutClienteInput = {
    create?: XOR<FamiliarCreateWithoutClienteInput, FamiliarUncheckedCreateWithoutClienteInput> | FamiliarCreateWithoutClienteInput[] | FamiliarUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FamiliarCreateOrConnectWithoutClienteInput | FamiliarCreateOrConnectWithoutClienteInput[]
    createMany?: FamiliarCreateManyClienteInputEnvelope
    connect?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
  }

  export type RegistroDiarioCreateNestedManyWithoutClienteInput = {
    create?: XOR<RegistroDiarioCreateWithoutClienteInput, RegistroDiarioUncheckedCreateWithoutClienteInput> | RegistroDiarioCreateWithoutClienteInput[] | RegistroDiarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutClienteInput | RegistroDiarioCreateOrConnectWithoutClienteInput[]
    createMany?: RegistroDiarioCreateManyClienteInputEnvelope
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
  }

  export type ObjetivoCreateNestedManyWithoutClienteInput = {
    create?: XOR<ObjetivoCreateWithoutClienteInput, ObjetivoUncheckedCreateWithoutClienteInput> | ObjetivoCreateWithoutClienteInput[] | ObjetivoUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutClienteInput | ObjetivoCreateOrConnectWithoutClienteInput[]
    createMany?: ObjetivoCreateManyClienteInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutClienteInput, ClienteTrabajadorUncheckedCreateWithoutClienteInput> | ClienteTrabajadorCreateWithoutClienteInput[] | ClienteTrabajadorUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutClienteInput | ClienteTrabajadorCreateOrConnectWithoutClienteInput[]
    createMany?: ClienteTrabajadorCreateManyClienteInputEnvelope
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
  }

  export type HorarioUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<HorarioCreateWithoutClienteInput, HorarioUncheckedCreateWithoutClienteInput> | HorarioCreateWithoutClienteInput[] | HorarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutClienteInput | HorarioCreateOrConnectWithoutClienteInput[]
    createMany?: HorarioCreateManyClienteInputEnvelope
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
  }

  export type InformeUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<InformeCreateWithoutClienteInput, InformeUncheckedCreateWithoutClienteInput> | InformeCreateWithoutClienteInput[] | InformeUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutClienteInput | InformeCreateOrConnectWithoutClienteInput[]
    createMany?: InformeCreateManyClienteInputEnvelope
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
  }

  export type FamiliarUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<FamiliarCreateWithoutClienteInput, FamiliarUncheckedCreateWithoutClienteInput> | FamiliarCreateWithoutClienteInput[] | FamiliarUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FamiliarCreateOrConnectWithoutClienteInput | FamiliarCreateOrConnectWithoutClienteInput[]
    createMany?: FamiliarCreateManyClienteInputEnvelope
    connect?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
  }

  export type RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<RegistroDiarioCreateWithoutClienteInput, RegistroDiarioUncheckedCreateWithoutClienteInput> | RegistroDiarioCreateWithoutClienteInput[] | RegistroDiarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutClienteInput | RegistroDiarioCreateOrConnectWithoutClienteInput[]
    createMany?: RegistroDiarioCreateManyClienteInputEnvelope
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
  }

  export type ObjetivoUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<ObjetivoCreateWithoutClienteInput, ObjetivoUncheckedCreateWithoutClienteInput> | ObjetivoCreateWithoutClienteInput[] | ObjetivoUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutClienteInput | ObjetivoCreateOrConnectWithoutClienteInput[]
    createMany?: ObjetivoCreateManyClienteInputEnvelope
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
  }

  export type ClienteTrabajadorUpdateManyWithoutClienteNestedInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutClienteInput, ClienteTrabajadorUncheckedCreateWithoutClienteInput> | ClienteTrabajadorCreateWithoutClienteInput[] | ClienteTrabajadorUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutClienteInput | ClienteTrabajadorCreateOrConnectWithoutClienteInput[]
    upsert?: ClienteTrabajadorUpsertWithWhereUniqueWithoutClienteInput | ClienteTrabajadorUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: ClienteTrabajadorCreateManyClienteInputEnvelope
    set?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    disconnect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    delete?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    update?: ClienteTrabajadorUpdateWithWhereUniqueWithoutClienteInput | ClienteTrabajadorUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: ClienteTrabajadorUpdateManyWithWhereWithoutClienteInput | ClienteTrabajadorUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: ClienteTrabajadorScalarWhereInput | ClienteTrabajadorScalarWhereInput[]
  }

  export type ColegioUpdateOneWithoutClientesNestedInput = {
    create?: XOR<ColegioCreateWithoutClientesInput, ColegioUncheckedCreateWithoutClientesInput>
    connectOrCreate?: ColegioCreateOrConnectWithoutClientesInput
    upsert?: ColegioUpsertWithoutClientesInput
    disconnect?: ColegioWhereInput | boolean
    delete?: ColegioWhereInput | boolean
    connect?: ColegioWhereUniqueInput
    update?: XOR<XOR<ColegioUpdateToOneWithWhereWithoutClientesInput, ColegioUpdateWithoutClientesInput>, ColegioUncheckedUpdateWithoutClientesInput>
  }

  export type HorarioUpdateManyWithoutClienteNestedInput = {
    create?: XOR<HorarioCreateWithoutClienteInput, HorarioUncheckedCreateWithoutClienteInput> | HorarioCreateWithoutClienteInput[] | HorarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutClienteInput | HorarioCreateOrConnectWithoutClienteInput[]
    upsert?: HorarioUpsertWithWhereUniqueWithoutClienteInput | HorarioUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: HorarioCreateManyClienteInputEnvelope
    set?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    disconnect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    delete?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    update?: HorarioUpdateWithWhereUniqueWithoutClienteInput | HorarioUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: HorarioUpdateManyWithWhereWithoutClienteInput | HorarioUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: HorarioScalarWhereInput | HorarioScalarWhereInput[]
  }

  export type InformeUpdateManyWithoutClienteNestedInput = {
    create?: XOR<InformeCreateWithoutClienteInput, InformeUncheckedCreateWithoutClienteInput> | InformeCreateWithoutClienteInput[] | InformeUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutClienteInput | InformeCreateOrConnectWithoutClienteInput[]
    upsert?: InformeUpsertWithWhereUniqueWithoutClienteInput | InformeUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: InformeCreateManyClienteInputEnvelope
    set?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    disconnect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    delete?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    update?: InformeUpdateWithWhereUniqueWithoutClienteInput | InformeUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: InformeUpdateManyWithWhereWithoutClienteInput | InformeUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: InformeScalarWhereInput | InformeScalarWhereInput[]
  }

  export type FamiliarUpdateManyWithoutClienteNestedInput = {
    create?: XOR<FamiliarCreateWithoutClienteInput, FamiliarUncheckedCreateWithoutClienteInput> | FamiliarCreateWithoutClienteInput[] | FamiliarUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FamiliarCreateOrConnectWithoutClienteInput | FamiliarCreateOrConnectWithoutClienteInput[]
    upsert?: FamiliarUpsertWithWhereUniqueWithoutClienteInput | FamiliarUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: FamiliarCreateManyClienteInputEnvelope
    set?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    disconnect?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    delete?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    connect?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    update?: FamiliarUpdateWithWhereUniqueWithoutClienteInput | FamiliarUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: FamiliarUpdateManyWithWhereWithoutClienteInput | FamiliarUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: FamiliarScalarWhereInput | FamiliarScalarWhereInput[]
  }

  export type RegistroDiarioUpdateManyWithoutClienteNestedInput = {
    create?: XOR<RegistroDiarioCreateWithoutClienteInput, RegistroDiarioUncheckedCreateWithoutClienteInput> | RegistroDiarioCreateWithoutClienteInput[] | RegistroDiarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutClienteInput | RegistroDiarioCreateOrConnectWithoutClienteInput[]
    upsert?: RegistroDiarioUpsertWithWhereUniqueWithoutClienteInput | RegistroDiarioUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: RegistroDiarioCreateManyClienteInputEnvelope
    set?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    disconnect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    delete?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    update?: RegistroDiarioUpdateWithWhereUniqueWithoutClienteInput | RegistroDiarioUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: RegistroDiarioUpdateManyWithWhereWithoutClienteInput | RegistroDiarioUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: RegistroDiarioScalarWhereInput | RegistroDiarioScalarWhereInput[]
  }

  export type ObjetivoUpdateManyWithoutClienteNestedInput = {
    create?: XOR<ObjetivoCreateWithoutClienteInput, ObjetivoUncheckedCreateWithoutClienteInput> | ObjetivoCreateWithoutClienteInput[] | ObjetivoUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutClienteInput | ObjetivoCreateOrConnectWithoutClienteInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutClienteInput | ObjetivoUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: ObjetivoCreateManyClienteInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutClienteInput | ObjetivoUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutClienteInput | ObjetivoUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<ClienteTrabajadorCreateWithoutClienteInput, ClienteTrabajadorUncheckedCreateWithoutClienteInput> | ClienteTrabajadorCreateWithoutClienteInput[] | ClienteTrabajadorUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ClienteTrabajadorCreateOrConnectWithoutClienteInput | ClienteTrabajadorCreateOrConnectWithoutClienteInput[]
    upsert?: ClienteTrabajadorUpsertWithWhereUniqueWithoutClienteInput | ClienteTrabajadorUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: ClienteTrabajadorCreateManyClienteInputEnvelope
    set?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    disconnect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    delete?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    connect?: ClienteTrabajadorWhereUniqueInput | ClienteTrabajadorWhereUniqueInput[]
    update?: ClienteTrabajadorUpdateWithWhereUniqueWithoutClienteInput | ClienteTrabajadorUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: ClienteTrabajadorUpdateManyWithWhereWithoutClienteInput | ClienteTrabajadorUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: ClienteTrabajadorScalarWhereInput | ClienteTrabajadorScalarWhereInput[]
  }

  export type HorarioUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<HorarioCreateWithoutClienteInput, HorarioUncheckedCreateWithoutClienteInput> | HorarioCreateWithoutClienteInput[] | HorarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: HorarioCreateOrConnectWithoutClienteInput | HorarioCreateOrConnectWithoutClienteInput[]
    upsert?: HorarioUpsertWithWhereUniqueWithoutClienteInput | HorarioUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: HorarioCreateManyClienteInputEnvelope
    set?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    disconnect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    delete?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    connect?: HorarioWhereUniqueInput | HorarioWhereUniqueInput[]
    update?: HorarioUpdateWithWhereUniqueWithoutClienteInput | HorarioUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: HorarioUpdateManyWithWhereWithoutClienteInput | HorarioUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: HorarioScalarWhereInput | HorarioScalarWhereInput[]
  }

  export type InformeUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<InformeCreateWithoutClienteInput, InformeUncheckedCreateWithoutClienteInput> | InformeCreateWithoutClienteInput[] | InformeUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: InformeCreateOrConnectWithoutClienteInput | InformeCreateOrConnectWithoutClienteInput[]
    upsert?: InformeUpsertWithWhereUniqueWithoutClienteInput | InformeUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: InformeCreateManyClienteInputEnvelope
    set?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    disconnect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    delete?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    connect?: InformeWhereUniqueInput | InformeWhereUniqueInput[]
    update?: InformeUpdateWithWhereUniqueWithoutClienteInput | InformeUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: InformeUpdateManyWithWhereWithoutClienteInput | InformeUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: InformeScalarWhereInput | InformeScalarWhereInput[]
  }

  export type FamiliarUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<FamiliarCreateWithoutClienteInput, FamiliarUncheckedCreateWithoutClienteInput> | FamiliarCreateWithoutClienteInput[] | FamiliarUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FamiliarCreateOrConnectWithoutClienteInput | FamiliarCreateOrConnectWithoutClienteInput[]
    upsert?: FamiliarUpsertWithWhereUniqueWithoutClienteInput | FamiliarUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: FamiliarCreateManyClienteInputEnvelope
    set?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    disconnect?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    delete?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    connect?: FamiliarWhereUniqueInput | FamiliarWhereUniqueInput[]
    update?: FamiliarUpdateWithWhereUniqueWithoutClienteInput | FamiliarUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: FamiliarUpdateManyWithWhereWithoutClienteInput | FamiliarUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: FamiliarScalarWhereInput | FamiliarScalarWhereInput[]
  }

  export type RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<RegistroDiarioCreateWithoutClienteInput, RegistroDiarioUncheckedCreateWithoutClienteInput> | RegistroDiarioCreateWithoutClienteInput[] | RegistroDiarioUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: RegistroDiarioCreateOrConnectWithoutClienteInput | RegistroDiarioCreateOrConnectWithoutClienteInput[]
    upsert?: RegistroDiarioUpsertWithWhereUniqueWithoutClienteInput | RegistroDiarioUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: RegistroDiarioCreateManyClienteInputEnvelope
    set?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    disconnect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    delete?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    connect?: RegistroDiarioWhereUniqueInput | RegistroDiarioWhereUniqueInput[]
    update?: RegistroDiarioUpdateWithWhereUniqueWithoutClienteInput | RegistroDiarioUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: RegistroDiarioUpdateManyWithWhereWithoutClienteInput | RegistroDiarioUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: RegistroDiarioScalarWhereInput | RegistroDiarioScalarWhereInput[]
  }

  export type ObjetivoUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<ObjetivoCreateWithoutClienteInput, ObjetivoUncheckedCreateWithoutClienteInput> | ObjetivoCreateWithoutClienteInput[] | ObjetivoUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: ObjetivoCreateOrConnectWithoutClienteInput | ObjetivoCreateOrConnectWithoutClienteInput[]
    upsert?: ObjetivoUpsertWithWhereUniqueWithoutClienteInput | ObjetivoUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: ObjetivoCreateManyClienteInputEnvelope
    set?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    disconnect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    delete?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    connect?: ObjetivoWhereUniqueInput | ObjetivoWhereUniqueInput[]
    update?: ObjetivoUpdateWithWhereUniqueWithoutClienteInput | ObjetivoUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: ObjetivoUpdateManyWithWhereWithoutClienteInput | ObjetivoUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
  }

  export type ClienteCreateNestedOneWithoutTrabajadoresAsignadosInput = {
    create?: XOR<ClienteCreateWithoutTrabajadoresAsignadosInput, ClienteUncheckedCreateWithoutTrabajadoresAsignadosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutTrabajadoresAsignadosInput
    connect?: ClienteWhereUniqueInput
  }

  export type TrabajadorCreateNestedOneWithoutClientesAsignadosInput = {
    create?: XOR<TrabajadorCreateWithoutClientesAsignadosInput, TrabajadorUncheckedCreateWithoutClientesAsignadosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutClientesAsignadosInput
    connect?: TrabajadorWhereUniqueInput
  }

  export type ClienteUpdateOneRequiredWithoutTrabajadoresAsignadosNestedInput = {
    create?: XOR<ClienteCreateWithoutTrabajadoresAsignadosInput, ClienteUncheckedCreateWithoutTrabajadoresAsignadosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutTrabajadoresAsignadosInput
    upsert?: ClienteUpsertWithoutTrabajadoresAsignadosInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutTrabajadoresAsignadosInput, ClienteUpdateWithoutTrabajadoresAsignadosInput>, ClienteUncheckedUpdateWithoutTrabajadoresAsignadosInput>
  }

  export type TrabajadorUpdateOneRequiredWithoutClientesAsignadosNestedInput = {
    create?: XOR<TrabajadorCreateWithoutClientesAsignadosInput, TrabajadorUncheckedCreateWithoutClientesAsignadosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutClientesAsignadosInput
    upsert?: TrabajadorUpsertWithoutClientesAsignadosInput
    connect?: TrabajadorWhereUniqueInput
    update?: XOR<XOR<TrabajadorUpdateToOneWithWhereWithoutClientesAsignadosInput, TrabajadorUpdateWithoutClientesAsignadosInput>, TrabajadorUncheckedUpdateWithoutClientesAsignadosInput>
  }

  export type ClienteCreateNestedOneWithoutHorariosInput = {
    create?: XOR<ClienteCreateWithoutHorariosInput, ClienteUncheckedCreateWithoutHorariosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutHorariosInput
    connect?: ClienteWhereUniqueInput
  }

  export type TrabajadorCreateNestedOneWithoutHorariosInput = {
    create?: XOR<TrabajadorCreateWithoutHorariosInput, TrabajadorUncheckedCreateWithoutHorariosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutHorariosInput
    connect?: TrabajadorWhereUniqueInput
  }

  export type ClienteUpdateOneRequiredWithoutHorariosNestedInput = {
    create?: XOR<ClienteCreateWithoutHorariosInput, ClienteUncheckedCreateWithoutHorariosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutHorariosInput
    upsert?: ClienteUpsertWithoutHorariosInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutHorariosInput, ClienteUpdateWithoutHorariosInput>, ClienteUncheckedUpdateWithoutHorariosInput>
  }

  export type TrabajadorUpdateOneRequiredWithoutHorariosNestedInput = {
    create?: XOR<TrabajadorCreateWithoutHorariosInput, TrabajadorUncheckedCreateWithoutHorariosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutHorariosInput
    upsert?: TrabajadorUpsertWithoutHorariosInput
    connect?: TrabajadorWhereUniqueInput
    update?: XOR<XOR<TrabajadorUpdateToOneWithWhereWithoutHorariosInput, TrabajadorUpdateWithoutHorariosInput>, TrabajadorUncheckedUpdateWithoutHorariosInput>
  }

  export type ClienteCreateNestedOneWithoutInformesInput = {
    create?: XOR<ClienteCreateWithoutInformesInput, ClienteUncheckedCreateWithoutInformesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutInformesInput
    connect?: ClienteWhereUniqueInput
  }

  export type TrabajadorCreateNestedOneWithoutInformesInput = {
    create?: XOR<TrabajadorCreateWithoutInformesInput, TrabajadorUncheckedCreateWithoutInformesInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutInformesInput
    connect?: TrabajadorWhereUniqueInput
  }

  export type ClienteUpdateOneRequiredWithoutInformesNestedInput = {
    create?: XOR<ClienteCreateWithoutInformesInput, ClienteUncheckedCreateWithoutInformesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutInformesInput
    upsert?: ClienteUpsertWithoutInformesInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutInformesInput, ClienteUpdateWithoutInformesInput>, ClienteUncheckedUpdateWithoutInformesInput>
  }

  export type TrabajadorUpdateOneRequiredWithoutInformesNestedInput = {
    create?: XOR<TrabajadorCreateWithoutInformesInput, TrabajadorUncheckedCreateWithoutInformesInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutInformesInput
    upsert?: TrabajadorUpsertWithoutInformesInput
    connect?: TrabajadorWhereUniqueInput
    update?: XOR<XOR<TrabajadorUpdateToOneWithWhereWithoutInformesInput, TrabajadorUpdateWithoutInformesInput>, TrabajadorUncheckedUpdateWithoutInformesInput>
  }

  export type ClienteCreateNestedOneWithoutContactosFamiliaresInput = {
    create?: XOR<ClienteCreateWithoutContactosFamiliaresInput, ClienteUncheckedCreateWithoutContactosFamiliaresInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutContactosFamiliaresInput
    connect?: ClienteWhereUniqueInput
  }

  export type ClienteUpdateOneRequiredWithoutContactosFamiliaresNestedInput = {
    create?: XOR<ClienteCreateWithoutContactosFamiliaresInput, ClienteUncheckedCreateWithoutContactosFamiliaresInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutContactosFamiliaresInput
    upsert?: ClienteUpsertWithoutContactosFamiliaresInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutContactosFamiliaresInput, ClienteUpdateWithoutContactosFamiliaresInput>, ClienteUncheckedUpdateWithoutContactosFamiliaresInput>
  }

  export type ClienteCreateNestedOneWithoutRegistrosDiariosInput = {
    create?: XOR<ClienteCreateWithoutRegistrosDiariosInput, ClienteUncheckedCreateWithoutRegistrosDiariosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutRegistrosDiariosInput
    connect?: ClienteWhereUniqueInput
  }

  export type TrabajadorCreateNestedOneWithoutRegistrosCreadosInput = {
    create?: XOR<TrabajadorCreateWithoutRegistrosCreadosInput, TrabajadorUncheckedCreateWithoutRegistrosCreadosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutRegistrosCreadosInput
    connect?: TrabajadorWhereUniqueInput
  }

  export type ClienteUpdateOneRequiredWithoutRegistrosDiariosNestedInput = {
    create?: XOR<ClienteCreateWithoutRegistrosDiariosInput, ClienteUncheckedCreateWithoutRegistrosDiariosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutRegistrosDiariosInput
    upsert?: ClienteUpsertWithoutRegistrosDiariosInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutRegistrosDiariosInput, ClienteUpdateWithoutRegistrosDiariosInput>, ClienteUncheckedUpdateWithoutRegistrosDiariosInput>
  }

  export type TrabajadorUpdateOneRequiredWithoutRegistrosCreadosNestedInput = {
    create?: XOR<TrabajadorCreateWithoutRegistrosCreadosInput, TrabajadorUncheckedCreateWithoutRegistrosCreadosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutRegistrosCreadosInput
    upsert?: TrabajadorUpsertWithoutRegistrosCreadosInput
    connect?: TrabajadorWhereUniqueInput
    update?: XOR<XOR<TrabajadorUpdateToOneWithWhereWithoutRegistrosCreadosInput, TrabajadorUpdateWithoutRegistrosCreadosInput>, TrabajadorUncheckedUpdateWithoutRegistrosCreadosInput>
  }

  export type ClienteCreateNestedOneWithoutObjetivosInput = {
    create?: XOR<ClienteCreateWithoutObjetivosInput, ClienteUncheckedCreateWithoutObjetivosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutObjetivosInput
    connect?: ClienteWhereUniqueInput
  }

  export type TrabajadorCreateNestedOneWithoutObjetivosAsignadosInput = {
    create?: XOR<TrabajadorCreateWithoutObjetivosAsignadosInput, TrabajadorUncheckedCreateWithoutObjetivosAsignadosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutObjetivosAsignadosInput
    connect?: TrabajadorWhereUniqueInput
  }

  export type ClienteUpdateOneRequiredWithoutObjetivosNestedInput = {
    create?: XOR<ClienteCreateWithoutObjetivosInput, ClienteUncheckedCreateWithoutObjetivosInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutObjetivosInput
    upsert?: ClienteUpsertWithoutObjetivosInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutObjetivosInput, ClienteUpdateWithoutObjetivosInput>, ClienteUncheckedUpdateWithoutObjetivosInput>
  }

  export type TrabajadorUpdateOneRequiredWithoutObjetivosAsignadosNestedInput = {
    create?: XOR<TrabajadorCreateWithoutObjetivosAsignadosInput, TrabajadorUncheckedCreateWithoutObjetivosAsignadosInput>
    connectOrCreate?: TrabajadorCreateOrConnectWithoutObjetivosAsignadosInput
    upsert?: TrabajadorUpsertWithoutObjetivosAsignadosInput
    connect?: TrabajadorWhereUniqueInput
    update?: XOR<XOR<TrabajadorUpdateToOneWithWhereWithoutObjetivosAsignadosInput, TrabajadorUpdateWithoutObjetivosAsignadosInput>, TrabajadorUncheckedUpdateWithoutObjetivosAsignadosInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TrabajadorCreateWithoutRolInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    clientesAsignados?: ClienteTrabajadorCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioCreateNestedManyWithoutTrabajadorInput
    informes?: InformeCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorUncheckedCreateWithoutRolInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    clientesAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutTrabajadorInput
    informes?: InformeUncheckedCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioUncheckedCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoUncheckedCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorCreateOrConnectWithoutRolInput = {
    where: TrabajadorWhereUniqueInput
    create: XOR<TrabajadorCreateWithoutRolInput, TrabajadorUncheckedCreateWithoutRolInput>
  }

  export type TrabajadorCreateManyRolInputEnvelope = {
    data: TrabajadorCreateManyRolInput | TrabajadorCreateManyRolInput[]
    skipDuplicates?: boolean
  }

  export type TrabajadorUpsertWithWhereUniqueWithoutRolInput = {
    where: TrabajadorWhereUniqueInput
    update: XOR<TrabajadorUpdateWithoutRolInput, TrabajadorUncheckedUpdateWithoutRolInput>
    create: XOR<TrabajadorCreateWithoutRolInput, TrabajadorUncheckedCreateWithoutRolInput>
  }

  export type TrabajadorUpdateWithWhereUniqueWithoutRolInput = {
    where: TrabajadorWhereUniqueInput
    data: XOR<TrabajadorUpdateWithoutRolInput, TrabajadorUncheckedUpdateWithoutRolInput>
  }

  export type TrabajadorUpdateManyWithWhereWithoutRolInput = {
    where: TrabajadorScalarWhereInput
    data: XOR<TrabajadorUpdateManyMutationInput, TrabajadorUncheckedUpdateManyWithoutRolInput>
  }

  export type TrabajadorScalarWhereInput = {
    AND?: TrabajadorScalarWhereInput | TrabajadorScalarWhereInput[]
    OR?: TrabajadorScalarWhereInput[]
    NOT?: TrabajadorScalarWhereInput | TrabajadorScalarWhereInput[]
    id?: StringFilter<"Trabajador"> | string
    username?: StringFilter<"Trabajador"> | string
    passwordHash?: StringFilter<"Trabajador"> | string
    nombre?: StringFilter<"Trabajador"> | string
    apellidos?: StringFilter<"Trabajador"> | string
    email?: StringFilter<"Trabajador"> | string
    telefono?: StringNullableFilter<"Trabajador"> | string | null
    img?: StringNullableFilter<"Trabajador"> | string | null
    fechaContratacion?: DateTimeNullableFilter<"Trabajador"> | Date | string | null
    activo?: BoolFilter<"Trabajador"> | boolean
    createdAt?: DateTimeFilter<"Trabajador"> | Date | string
    updatedAt?: DateTimeFilter<"Trabajador"> | Date | string
    rolId?: StringFilter<"Trabajador"> | string
  }

  export type RolCreateWithoutTrabajadoresInput = {
    id?: string
    nombreRol: string
    codigo: string
    descripcion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RolUncheckedCreateWithoutTrabajadoresInput = {
    id?: string
    nombreRol: string
    codigo: string
    descripcion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RolCreateOrConnectWithoutTrabajadoresInput = {
    where: RolWhereUniqueInput
    create: XOR<RolCreateWithoutTrabajadoresInput, RolUncheckedCreateWithoutTrabajadoresInput>
  }

  export type ClienteTrabajadorCreateWithoutTrabajadorInput = {
    createdAt?: Date | string
    tipoTerapia?: string | null
    cliente: ClienteCreateNestedOneWithoutTrabajadoresAsignadosInput
  }

  export type ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput = {
    clienteId: string
    createdAt?: Date | string
    tipoTerapia?: string | null
  }

  export type ClienteTrabajadorCreateOrConnectWithoutTrabajadorInput = {
    where: ClienteTrabajadorWhereUniqueInput
    create: XOR<ClienteTrabajadorCreateWithoutTrabajadorInput, ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput>
  }

  export type ClienteTrabajadorCreateManyTrabajadorInputEnvelope = {
    data: ClienteTrabajadorCreateManyTrabajadorInput | ClienteTrabajadorCreateManyTrabajadorInput[]
    skipDuplicates?: boolean
  }

  export type HorarioCreateWithoutTrabajadorInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutHorariosInput
  }

  export type HorarioUncheckedCreateWithoutTrabajadorInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type HorarioCreateOrConnectWithoutTrabajadorInput = {
    where: HorarioWhereUniqueInput
    create: XOR<HorarioCreateWithoutTrabajadorInput, HorarioUncheckedCreateWithoutTrabajadorInput>
  }

  export type HorarioCreateManyTrabajadorInputEnvelope = {
    data: HorarioCreateManyTrabajadorInput | HorarioCreateManyTrabajadorInput[]
    skipDuplicates?: boolean
  }

  export type InformeCreateWithoutTrabajadorInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutInformesInput
  }

  export type InformeUncheckedCreateWithoutTrabajadorInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type InformeCreateOrConnectWithoutTrabajadorInput = {
    where: InformeWhereUniqueInput
    create: XOR<InformeCreateWithoutTrabajadorInput, InformeUncheckedCreateWithoutTrabajadorInput>
  }

  export type InformeCreateManyTrabajadorInputEnvelope = {
    data: InformeCreateManyTrabajadorInput | InformeCreateManyTrabajadorInput[]
    skipDuplicates?: boolean
  }

  export type RegistroDiarioCreateWithoutTrabajadorInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutRegistrosDiariosInput
  }

  export type RegistroDiarioUncheckedCreateWithoutTrabajadorInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type RegistroDiarioCreateOrConnectWithoutTrabajadorInput = {
    where: RegistroDiarioWhereUniqueInput
    create: XOR<RegistroDiarioCreateWithoutTrabajadorInput, RegistroDiarioUncheckedCreateWithoutTrabajadorInput>
  }

  export type RegistroDiarioCreateManyTrabajadorInputEnvelope = {
    data: RegistroDiarioCreateManyTrabajadorInput | RegistroDiarioCreateManyTrabajadorInput[]
    skipDuplicates?: boolean
  }

  export type ObjetivoCreateWithoutTrabajadorResponsableInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutObjetivosInput
  }

  export type ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type ObjetivoCreateOrConnectWithoutTrabajadorResponsableInput = {
    where: ObjetivoWhereUniqueInput
    create: XOR<ObjetivoCreateWithoutTrabajadorResponsableInput, ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput>
  }

  export type ObjetivoCreateManyTrabajadorResponsableInputEnvelope = {
    data: ObjetivoCreateManyTrabajadorResponsableInput | ObjetivoCreateManyTrabajadorResponsableInput[]
    skipDuplicates?: boolean
  }

  export type RolUpsertWithoutTrabajadoresInput = {
    update: XOR<RolUpdateWithoutTrabajadoresInput, RolUncheckedUpdateWithoutTrabajadoresInput>
    create: XOR<RolCreateWithoutTrabajadoresInput, RolUncheckedCreateWithoutTrabajadoresInput>
    where?: RolWhereInput
  }

  export type RolUpdateToOneWithWhereWithoutTrabajadoresInput = {
    where?: RolWhereInput
    data: XOR<RolUpdateWithoutTrabajadoresInput, RolUncheckedUpdateWithoutTrabajadoresInput>
  }

  export type RolUpdateWithoutTrabajadoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreRol?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolUncheckedUpdateWithoutTrabajadoresInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreRol?: StringFieldUpdateOperationsInput | string
    codigo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteTrabajadorUpsertWithWhereUniqueWithoutTrabajadorInput = {
    where: ClienteTrabajadorWhereUniqueInput
    update: XOR<ClienteTrabajadorUpdateWithoutTrabajadorInput, ClienteTrabajadorUncheckedUpdateWithoutTrabajadorInput>
    create: XOR<ClienteTrabajadorCreateWithoutTrabajadorInput, ClienteTrabajadorUncheckedCreateWithoutTrabajadorInput>
  }

  export type ClienteTrabajadorUpdateWithWhereUniqueWithoutTrabajadorInput = {
    where: ClienteTrabajadorWhereUniqueInput
    data: XOR<ClienteTrabajadorUpdateWithoutTrabajadorInput, ClienteTrabajadorUncheckedUpdateWithoutTrabajadorInput>
  }

  export type ClienteTrabajadorUpdateManyWithWhereWithoutTrabajadorInput = {
    where: ClienteTrabajadorScalarWhereInput
    data: XOR<ClienteTrabajadorUpdateManyMutationInput, ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorInput>
  }

  export type ClienteTrabajadorScalarWhereInput = {
    AND?: ClienteTrabajadorScalarWhereInput | ClienteTrabajadorScalarWhereInput[]
    OR?: ClienteTrabajadorScalarWhereInput[]
    NOT?: ClienteTrabajadorScalarWhereInput | ClienteTrabajadorScalarWhereInput[]
    clienteId?: StringFilter<"ClienteTrabajador"> | string
    trabajadorId?: StringFilter<"ClienteTrabajador"> | string
    createdAt?: DateTimeFilter<"ClienteTrabajador"> | Date | string
    tipoTerapia?: StringNullableFilter<"ClienteTrabajador"> | string | null
  }

  export type HorarioUpsertWithWhereUniqueWithoutTrabajadorInput = {
    where: HorarioWhereUniqueInput
    update: XOR<HorarioUpdateWithoutTrabajadorInput, HorarioUncheckedUpdateWithoutTrabajadorInput>
    create: XOR<HorarioCreateWithoutTrabajadorInput, HorarioUncheckedCreateWithoutTrabajadorInput>
  }

  export type HorarioUpdateWithWhereUniqueWithoutTrabajadorInput = {
    where: HorarioWhereUniqueInput
    data: XOR<HorarioUpdateWithoutTrabajadorInput, HorarioUncheckedUpdateWithoutTrabajadorInput>
  }

  export type HorarioUpdateManyWithWhereWithoutTrabajadorInput = {
    where: HorarioScalarWhereInput
    data: XOR<HorarioUpdateManyMutationInput, HorarioUncheckedUpdateManyWithoutTrabajadorInput>
  }

  export type HorarioScalarWhereInput = {
    AND?: HorarioScalarWhereInput | HorarioScalarWhereInput[]
    OR?: HorarioScalarWhereInput[]
    NOT?: HorarioScalarWhereInput | HorarioScalarWhereInput[]
    id?: StringFilter<"Horario"> | string
    fechaHoraInicio?: DateTimeFilter<"Horario"> | Date | string
    fechaHoraFin?: DateTimeFilter<"Horario"> | Date | string
    tipoSesion?: StringFilter<"Horario"> | string
    estado?: StringFilter<"Horario"> | string
    notas?: StringNullableFilter<"Horario"> | string | null
    createdAt?: DateTimeFilter<"Horario"> | Date | string
    updatedAt?: DateTimeFilter<"Horario"> | Date | string
    clienteId?: StringFilter<"Horario"> | string
    trabajadorId?: StringFilter<"Horario"> | string
  }

  export type InformeUpsertWithWhereUniqueWithoutTrabajadorInput = {
    where: InformeWhereUniqueInput
    update: XOR<InformeUpdateWithoutTrabajadorInput, InformeUncheckedUpdateWithoutTrabajadorInput>
    create: XOR<InformeCreateWithoutTrabajadorInput, InformeUncheckedCreateWithoutTrabajadorInput>
  }

  export type InformeUpdateWithWhereUniqueWithoutTrabajadorInput = {
    where: InformeWhereUniqueInput
    data: XOR<InformeUpdateWithoutTrabajadorInput, InformeUncheckedUpdateWithoutTrabajadorInput>
  }

  export type InformeUpdateManyWithWhereWithoutTrabajadorInput = {
    where: InformeScalarWhereInput
    data: XOR<InformeUpdateManyMutationInput, InformeUncheckedUpdateManyWithoutTrabajadorInput>
  }

  export type InformeScalarWhereInput = {
    AND?: InformeScalarWhereInput | InformeScalarWhereInput[]
    OR?: InformeScalarWhereInput[]
    NOT?: InformeScalarWhereInput | InformeScalarWhereInput[]
    id?: StringFilter<"Informe"> | string
    titulo?: StringFilter<"Informe"> | string
    contenido?: StringFilter<"Informe"> | string
    fechaCreacion?: DateTimeFilter<"Informe"> | Date | string
    fechaVencimiento?: DateTimeNullableFilter<"Informe"> | Date | string | null
    estado?: StringFilter<"Informe"> | string
    urlDocumentoFinal?: StringNullableFilter<"Informe"> | string | null
    createdAt?: DateTimeFilter<"Informe"> | Date | string
    updatedAt?: DateTimeFilter<"Informe"> | Date | string
    clienteId?: StringFilter<"Informe"> | string
    trabajadorId?: StringFilter<"Informe"> | string
  }

  export type RegistroDiarioUpsertWithWhereUniqueWithoutTrabajadorInput = {
    where: RegistroDiarioWhereUniqueInput
    update: XOR<RegistroDiarioUpdateWithoutTrabajadorInput, RegistroDiarioUncheckedUpdateWithoutTrabajadorInput>
    create: XOR<RegistroDiarioCreateWithoutTrabajadorInput, RegistroDiarioUncheckedCreateWithoutTrabajadorInput>
  }

  export type RegistroDiarioUpdateWithWhereUniqueWithoutTrabajadorInput = {
    where: RegistroDiarioWhereUniqueInput
    data: XOR<RegistroDiarioUpdateWithoutTrabajadorInput, RegistroDiarioUncheckedUpdateWithoutTrabajadorInput>
  }

  export type RegistroDiarioUpdateManyWithWhereWithoutTrabajadorInput = {
    where: RegistroDiarioScalarWhereInput
    data: XOR<RegistroDiarioUpdateManyMutationInput, RegistroDiarioUncheckedUpdateManyWithoutTrabajadorInput>
  }

  export type RegistroDiarioScalarWhereInput = {
    AND?: RegistroDiarioScalarWhereInput | RegistroDiarioScalarWhereInput[]
    OR?: RegistroDiarioScalarWhereInput[]
    NOT?: RegistroDiarioScalarWhereInput | RegistroDiarioScalarWhereInput[]
    id?: StringFilter<"RegistroDiario"> | string
    fechaRegistro?: DateTimeFilter<"RegistroDiario"> | Date | string
    contenido?: StringFilter<"RegistroDiario"> | string
    createdAt?: DateTimeFilter<"RegistroDiario"> | Date | string
    updatedAt?: DateTimeFilter<"RegistroDiario"> | Date | string
    clienteId?: StringFilter<"RegistroDiario"> | string
    trabajadorId?: StringFilter<"RegistroDiario"> | string
  }

  export type ObjetivoUpsertWithWhereUniqueWithoutTrabajadorResponsableInput = {
    where: ObjetivoWhereUniqueInput
    update: XOR<ObjetivoUpdateWithoutTrabajadorResponsableInput, ObjetivoUncheckedUpdateWithoutTrabajadorResponsableInput>
    create: XOR<ObjetivoCreateWithoutTrabajadorResponsableInput, ObjetivoUncheckedCreateWithoutTrabajadorResponsableInput>
  }

  export type ObjetivoUpdateWithWhereUniqueWithoutTrabajadorResponsableInput = {
    where: ObjetivoWhereUniqueInput
    data: XOR<ObjetivoUpdateWithoutTrabajadorResponsableInput, ObjetivoUncheckedUpdateWithoutTrabajadorResponsableInput>
  }

  export type ObjetivoUpdateManyWithWhereWithoutTrabajadorResponsableInput = {
    where: ObjetivoScalarWhereInput
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableInput>
  }

  export type ObjetivoScalarWhereInput = {
    AND?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
    OR?: ObjetivoScalarWhereInput[]
    NOT?: ObjetivoScalarWhereInput | ObjetivoScalarWhereInput[]
    id?: StringFilter<"Objetivo"> | string
    titulo?: StringFilter<"Objetivo"> | string
    descripcion?: StringNullableFilter<"Objetivo"> | string | null
    fechaInicio?: DateTimeFilter<"Objetivo"> | Date | string
    fechaFinPrevista?: DateTimeNullableFilter<"Objetivo"> | Date | string | null
    estado?: StringFilter<"Objetivo"> | string
    createdAt?: DateTimeFilter<"Objetivo"> | Date | string
    updatedAt?: DateTimeFilter<"Objetivo"> | Date | string
    clienteId?: StringFilter<"Objetivo"> | string
    trabajadorResponsableId?: StringFilter<"Objetivo"> | string
  }

  export type ClienteCreateWithoutColegioInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorCreateNestedManyWithoutClienteInput
    horarios?: HorarioCreateNestedManyWithoutClienteInput
    informes?: InformeCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutColegioInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutClienteInput
    informes?: InformeUncheckedCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarUncheckedCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutColegioInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutColegioInput, ClienteUncheckedCreateWithoutColegioInput>
  }

  export type ClienteCreateManyColegioInputEnvelope = {
    data: ClienteCreateManyColegioInput | ClienteCreateManyColegioInput[]
    skipDuplicates?: boolean
  }

  export type ClienteUpsertWithWhereUniqueWithoutColegioInput = {
    where: ClienteWhereUniqueInput
    update: XOR<ClienteUpdateWithoutColegioInput, ClienteUncheckedUpdateWithoutColegioInput>
    create: XOR<ClienteCreateWithoutColegioInput, ClienteUncheckedCreateWithoutColegioInput>
  }

  export type ClienteUpdateWithWhereUniqueWithoutColegioInput = {
    where: ClienteWhereUniqueInput
    data: XOR<ClienteUpdateWithoutColegioInput, ClienteUncheckedUpdateWithoutColegioInput>
  }

  export type ClienteUpdateManyWithWhereWithoutColegioInput = {
    where: ClienteScalarWhereInput
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyWithoutColegioInput>
  }

  export type ClienteScalarWhereInput = {
    AND?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
    OR?: ClienteScalarWhereInput[]
    NOT?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
    id?: StringFilter<"Cliente"> | string
    idCarpetaDrive?: StringNullableFilter<"Cliente"> | string | null
    nombre?: StringFilter<"Cliente"> | string
    apellidos?: StringFilter<"Cliente"> | string
    fechaNacimiento?: DateTimeNullableFilter<"Cliente"> | Date | string | null
    domicilio?: StringFilter<"Cliente"> | string
    curso?: StringFilter<"Cliente"> | string
    diagnostico?: StringFilter<"Cliente"> | string
    tratamientos?: StringFilter<"Cliente"> | string
    medicacion?: StringFilter<"Cliente"> | string
    alergias?: StringNullableFilter<"Cliente"> | string | null
    activo?: BoolFilter<"Cliente"> | boolean
    adaptaciones?: BoolFilter<"Cliente"> | boolean
    apoyos?: BoolFilter<"Cliente"> | boolean
    createdAt?: DateTimeFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeFilter<"Cliente"> | Date | string
    colegioId?: StringNullableFilter<"Cliente"> | string | null
  }

  export type ClienteTrabajadorCreateWithoutClienteInput = {
    createdAt?: Date | string
    tipoTerapia?: string | null
    trabajador: TrabajadorCreateNestedOneWithoutClientesAsignadosInput
  }

  export type ClienteTrabajadorUncheckedCreateWithoutClienteInput = {
    trabajadorId: string
    createdAt?: Date | string
    tipoTerapia?: string | null
  }

  export type ClienteTrabajadorCreateOrConnectWithoutClienteInput = {
    where: ClienteTrabajadorWhereUniqueInput
    create: XOR<ClienteTrabajadorCreateWithoutClienteInput, ClienteTrabajadorUncheckedCreateWithoutClienteInput>
  }

  export type ClienteTrabajadorCreateManyClienteInputEnvelope = {
    data: ClienteTrabajadorCreateManyClienteInput | ClienteTrabajadorCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type ColegioCreateWithoutClientesInput = {
    id?: string
    nombre: string
    direccionColegio: string
    emailTutor?: string | null
    emailOrientador?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ColegioUncheckedCreateWithoutClientesInput = {
    id?: string
    nombre: string
    direccionColegio: string
    emailTutor?: string | null
    emailOrientador?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ColegioCreateOrConnectWithoutClientesInput = {
    where: ColegioWhereUniqueInput
    create: XOR<ColegioCreateWithoutClientesInput, ColegioUncheckedCreateWithoutClientesInput>
  }

  export type HorarioCreateWithoutClienteInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajador: TrabajadorCreateNestedOneWithoutHorariosInput
  }

  export type HorarioUncheckedCreateWithoutClienteInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorId: string
  }

  export type HorarioCreateOrConnectWithoutClienteInput = {
    where: HorarioWhereUniqueInput
    create: XOR<HorarioCreateWithoutClienteInput, HorarioUncheckedCreateWithoutClienteInput>
  }

  export type HorarioCreateManyClienteInputEnvelope = {
    data: HorarioCreateManyClienteInput | HorarioCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type InformeCreateWithoutClienteInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajador: TrabajadorCreateNestedOneWithoutInformesInput
  }

  export type InformeUncheckedCreateWithoutClienteInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorId: string
  }

  export type InformeCreateOrConnectWithoutClienteInput = {
    where: InformeWhereUniqueInput
    create: XOR<InformeCreateWithoutClienteInput, InformeUncheckedCreateWithoutClienteInput>
  }

  export type InformeCreateManyClienteInputEnvelope = {
    data: InformeCreateManyClienteInput | InformeCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type FamiliarCreateWithoutClienteInput = {
    id?: string
    nombreContacto: string
    parentesco?: string | null
    telefonoMadre?: string | null
    emailMadre?: string | null
    telefonoPadre?: string | null
    emailPadre?: string | null
    telefonoWhatsapp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FamiliarUncheckedCreateWithoutClienteInput = {
    id?: string
    nombreContacto: string
    parentesco?: string | null
    telefonoMadre?: string | null
    emailMadre?: string | null
    telefonoPadre?: string | null
    emailPadre?: string | null
    telefonoWhatsapp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FamiliarCreateOrConnectWithoutClienteInput = {
    where: FamiliarWhereUniqueInput
    create: XOR<FamiliarCreateWithoutClienteInput, FamiliarUncheckedCreateWithoutClienteInput>
  }

  export type FamiliarCreateManyClienteInputEnvelope = {
    data: FamiliarCreateManyClienteInput | FamiliarCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type RegistroDiarioCreateWithoutClienteInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajador: TrabajadorCreateNestedOneWithoutRegistrosCreadosInput
  }

  export type RegistroDiarioUncheckedCreateWithoutClienteInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorId: string
  }

  export type RegistroDiarioCreateOrConnectWithoutClienteInput = {
    where: RegistroDiarioWhereUniqueInput
    create: XOR<RegistroDiarioCreateWithoutClienteInput, RegistroDiarioUncheckedCreateWithoutClienteInput>
  }

  export type RegistroDiarioCreateManyClienteInputEnvelope = {
    data: RegistroDiarioCreateManyClienteInput | RegistroDiarioCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type ObjetivoCreateWithoutClienteInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorResponsable: TrabajadorCreateNestedOneWithoutObjetivosAsignadosInput
  }

  export type ObjetivoUncheckedCreateWithoutClienteInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorResponsableId: string
  }

  export type ObjetivoCreateOrConnectWithoutClienteInput = {
    where: ObjetivoWhereUniqueInput
    create: XOR<ObjetivoCreateWithoutClienteInput, ObjetivoUncheckedCreateWithoutClienteInput>
  }

  export type ObjetivoCreateManyClienteInputEnvelope = {
    data: ObjetivoCreateManyClienteInput | ObjetivoCreateManyClienteInput[]
    skipDuplicates?: boolean
  }

  export type ClienteTrabajadorUpsertWithWhereUniqueWithoutClienteInput = {
    where: ClienteTrabajadorWhereUniqueInput
    update: XOR<ClienteTrabajadorUpdateWithoutClienteInput, ClienteTrabajadorUncheckedUpdateWithoutClienteInput>
    create: XOR<ClienteTrabajadorCreateWithoutClienteInput, ClienteTrabajadorUncheckedCreateWithoutClienteInput>
  }

  export type ClienteTrabajadorUpdateWithWhereUniqueWithoutClienteInput = {
    where: ClienteTrabajadorWhereUniqueInput
    data: XOR<ClienteTrabajadorUpdateWithoutClienteInput, ClienteTrabajadorUncheckedUpdateWithoutClienteInput>
  }

  export type ClienteTrabajadorUpdateManyWithWhereWithoutClienteInput = {
    where: ClienteTrabajadorScalarWhereInput
    data: XOR<ClienteTrabajadorUpdateManyMutationInput, ClienteTrabajadorUncheckedUpdateManyWithoutClienteInput>
  }

  export type ColegioUpsertWithoutClientesInput = {
    update: XOR<ColegioUpdateWithoutClientesInput, ColegioUncheckedUpdateWithoutClientesInput>
    create: XOR<ColegioCreateWithoutClientesInput, ColegioUncheckedCreateWithoutClientesInput>
    where?: ColegioWhereInput
  }

  export type ColegioUpdateToOneWithWhereWithoutClientesInput = {
    where?: ColegioWhereInput
    data: XOR<ColegioUpdateWithoutClientesInput, ColegioUncheckedUpdateWithoutClientesInput>
  }

  export type ColegioUpdateWithoutClientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    direccionColegio?: StringFieldUpdateOperationsInput | string
    emailTutor?: NullableStringFieldUpdateOperationsInput | string | null
    emailOrientador?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ColegioUncheckedUpdateWithoutClientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    direccionColegio?: StringFieldUpdateOperationsInput | string
    emailTutor?: NullableStringFieldUpdateOperationsInput | string | null
    emailOrientador?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type HorarioUpsertWithWhereUniqueWithoutClienteInput = {
    where: HorarioWhereUniqueInput
    update: XOR<HorarioUpdateWithoutClienteInput, HorarioUncheckedUpdateWithoutClienteInput>
    create: XOR<HorarioCreateWithoutClienteInput, HorarioUncheckedCreateWithoutClienteInput>
  }

  export type HorarioUpdateWithWhereUniqueWithoutClienteInput = {
    where: HorarioWhereUniqueInput
    data: XOR<HorarioUpdateWithoutClienteInput, HorarioUncheckedUpdateWithoutClienteInput>
  }

  export type HorarioUpdateManyWithWhereWithoutClienteInput = {
    where: HorarioScalarWhereInput
    data: XOR<HorarioUpdateManyMutationInput, HorarioUncheckedUpdateManyWithoutClienteInput>
  }

  export type InformeUpsertWithWhereUniqueWithoutClienteInput = {
    where: InformeWhereUniqueInput
    update: XOR<InformeUpdateWithoutClienteInput, InformeUncheckedUpdateWithoutClienteInput>
    create: XOR<InformeCreateWithoutClienteInput, InformeUncheckedCreateWithoutClienteInput>
  }

  export type InformeUpdateWithWhereUniqueWithoutClienteInput = {
    where: InformeWhereUniqueInput
    data: XOR<InformeUpdateWithoutClienteInput, InformeUncheckedUpdateWithoutClienteInput>
  }

  export type InformeUpdateManyWithWhereWithoutClienteInput = {
    where: InformeScalarWhereInput
    data: XOR<InformeUpdateManyMutationInput, InformeUncheckedUpdateManyWithoutClienteInput>
  }

  export type FamiliarUpsertWithWhereUniqueWithoutClienteInput = {
    where: FamiliarWhereUniqueInput
    update: XOR<FamiliarUpdateWithoutClienteInput, FamiliarUncheckedUpdateWithoutClienteInput>
    create: XOR<FamiliarCreateWithoutClienteInput, FamiliarUncheckedCreateWithoutClienteInput>
  }

  export type FamiliarUpdateWithWhereUniqueWithoutClienteInput = {
    where: FamiliarWhereUniqueInput
    data: XOR<FamiliarUpdateWithoutClienteInput, FamiliarUncheckedUpdateWithoutClienteInput>
  }

  export type FamiliarUpdateManyWithWhereWithoutClienteInput = {
    where: FamiliarScalarWhereInput
    data: XOR<FamiliarUpdateManyMutationInput, FamiliarUncheckedUpdateManyWithoutClienteInput>
  }

  export type FamiliarScalarWhereInput = {
    AND?: FamiliarScalarWhereInput | FamiliarScalarWhereInput[]
    OR?: FamiliarScalarWhereInput[]
    NOT?: FamiliarScalarWhereInput | FamiliarScalarWhereInput[]
    id?: StringFilter<"Familiar"> | string
    nombreContacto?: StringFilter<"Familiar"> | string
    parentesco?: StringNullableFilter<"Familiar"> | string | null
    telefonoMadre?: StringNullableFilter<"Familiar"> | string | null
    emailMadre?: StringNullableFilter<"Familiar"> | string | null
    telefonoPadre?: StringNullableFilter<"Familiar"> | string | null
    emailPadre?: StringNullableFilter<"Familiar"> | string | null
    telefonoWhatsapp?: StringNullableFilter<"Familiar"> | string | null
    createdAt?: DateTimeFilter<"Familiar"> | Date | string
    updatedAt?: DateTimeFilter<"Familiar"> | Date | string
    clienteId?: StringFilter<"Familiar"> | string
  }

  export type RegistroDiarioUpsertWithWhereUniqueWithoutClienteInput = {
    where: RegistroDiarioWhereUniqueInput
    update: XOR<RegistroDiarioUpdateWithoutClienteInput, RegistroDiarioUncheckedUpdateWithoutClienteInput>
    create: XOR<RegistroDiarioCreateWithoutClienteInput, RegistroDiarioUncheckedCreateWithoutClienteInput>
  }

  export type RegistroDiarioUpdateWithWhereUniqueWithoutClienteInput = {
    where: RegistroDiarioWhereUniqueInput
    data: XOR<RegistroDiarioUpdateWithoutClienteInput, RegistroDiarioUncheckedUpdateWithoutClienteInput>
  }

  export type RegistroDiarioUpdateManyWithWhereWithoutClienteInput = {
    where: RegistroDiarioScalarWhereInput
    data: XOR<RegistroDiarioUpdateManyMutationInput, RegistroDiarioUncheckedUpdateManyWithoutClienteInput>
  }

  export type ObjetivoUpsertWithWhereUniqueWithoutClienteInput = {
    where: ObjetivoWhereUniqueInput
    update: XOR<ObjetivoUpdateWithoutClienteInput, ObjetivoUncheckedUpdateWithoutClienteInput>
    create: XOR<ObjetivoCreateWithoutClienteInput, ObjetivoUncheckedCreateWithoutClienteInput>
  }

  export type ObjetivoUpdateWithWhereUniqueWithoutClienteInput = {
    where: ObjetivoWhereUniqueInput
    data: XOR<ObjetivoUpdateWithoutClienteInput, ObjetivoUncheckedUpdateWithoutClienteInput>
  }

  export type ObjetivoUpdateManyWithWhereWithoutClienteInput = {
    where: ObjetivoScalarWhereInput
    data: XOR<ObjetivoUpdateManyMutationInput, ObjetivoUncheckedUpdateManyWithoutClienteInput>
  }

  export type ClienteCreateWithoutTrabajadoresAsignadosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegio?: ColegioCreateNestedOneWithoutClientesInput
    horarios?: HorarioCreateNestedManyWithoutClienteInput
    informes?: InformeCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutTrabajadoresAsignadosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
    horarios?: HorarioUncheckedCreateNestedManyWithoutClienteInput
    informes?: InformeUncheckedCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarUncheckedCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutTrabajadoresAsignadosInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutTrabajadoresAsignadosInput, ClienteUncheckedCreateWithoutTrabajadoresAsignadosInput>
  }

  export type TrabajadorCreateWithoutClientesAsignadosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rol: RolCreateNestedOneWithoutTrabajadoresInput
    horarios?: HorarioCreateNestedManyWithoutTrabajadorInput
    informes?: InformeCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorUncheckedCreateWithoutClientesAsignadosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rolId: string
    horarios?: HorarioUncheckedCreateNestedManyWithoutTrabajadorInput
    informes?: InformeUncheckedCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioUncheckedCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoUncheckedCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorCreateOrConnectWithoutClientesAsignadosInput = {
    where: TrabajadorWhereUniqueInput
    create: XOR<TrabajadorCreateWithoutClientesAsignadosInput, TrabajadorUncheckedCreateWithoutClientesAsignadosInput>
  }

  export type ClienteUpsertWithoutTrabajadoresAsignadosInput = {
    update: XOR<ClienteUpdateWithoutTrabajadoresAsignadosInput, ClienteUncheckedUpdateWithoutTrabajadoresAsignadosInput>
    create: XOR<ClienteCreateWithoutTrabajadoresAsignadosInput, ClienteUncheckedCreateWithoutTrabajadoresAsignadosInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutTrabajadoresAsignadosInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutTrabajadoresAsignadosInput, ClienteUncheckedUpdateWithoutTrabajadoresAsignadosInput>
  }

  export type ClienteUpdateWithoutTrabajadoresAsignadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegio?: ColegioUpdateOneWithoutClientesNestedInput
    horarios?: HorarioUpdateManyWithoutClienteNestedInput
    informes?: InformeUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutTrabajadoresAsignadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
    horarios?: HorarioUncheckedUpdateManyWithoutClienteNestedInput
    informes?: InformeUncheckedUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUncheckedUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type TrabajadorUpsertWithoutClientesAsignadosInput = {
    update: XOR<TrabajadorUpdateWithoutClientesAsignadosInput, TrabajadorUncheckedUpdateWithoutClientesAsignadosInput>
    create: XOR<TrabajadorCreateWithoutClientesAsignadosInput, TrabajadorUncheckedCreateWithoutClientesAsignadosInput>
    where?: TrabajadorWhereInput
  }

  export type TrabajadorUpdateToOneWithWhereWithoutClientesAsignadosInput = {
    where?: TrabajadorWhereInput
    data: XOR<TrabajadorUpdateWithoutClientesAsignadosInput, TrabajadorUncheckedUpdateWithoutClientesAsignadosInput>
  }

  export type TrabajadorUpdateWithoutClientesAsignadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rol?: RolUpdateOneRequiredWithoutTrabajadoresNestedInput
    horarios?: HorarioUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorUncheckedUpdateWithoutClientesAsignadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rolId?: StringFieldUpdateOperationsInput | string
    horarios?: HorarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUncheckedUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type ClienteCreateWithoutHorariosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorCreateNestedManyWithoutClienteInput
    colegio?: ColegioCreateNestedOneWithoutClientesInput
    informes?: InformeCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutHorariosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput
    informes?: InformeUncheckedCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarUncheckedCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutHorariosInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutHorariosInput, ClienteUncheckedCreateWithoutHorariosInput>
  }

  export type TrabajadorCreateWithoutHorariosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rol: RolCreateNestedOneWithoutTrabajadoresInput
    clientesAsignados?: ClienteTrabajadorCreateNestedManyWithoutTrabajadorInput
    informes?: InformeCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorUncheckedCreateWithoutHorariosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rolId: string
    clientesAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutTrabajadorInput
    informes?: InformeUncheckedCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioUncheckedCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoUncheckedCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorCreateOrConnectWithoutHorariosInput = {
    where: TrabajadorWhereUniqueInput
    create: XOR<TrabajadorCreateWithoutHorariosInput, TrabajadorUncheckedCreateWithoutHorariosInput>
  }

  export type ClienteUpsertWithoutHorariosInput = {
    update: XOR<ClienteUpdateWithoutHorariosInput, ClienteUncheckedUpdateWithoutHorariosInput>
    create: XOR<ClienteCreateWithoutHorariosInput, ClienteUncheckedCreateWithoutHorariosInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutHorariosInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutHorariosInput, ClienteUncheckedUpdateWithoutHorariosInput>
  }

  export type ClienteUpdateWithoutHorariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUpdateManyWithoutClienteNestedInput
    colegio?: ColegioUpdateOneWithoutClientesNestedInput
    informes?: InformeUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutHorariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput
    informes?: InformeUncheckedUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUncheckedUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type TrabajadorUpsertWithoutHorariosInput = {
    update: XOR<TrabajadorUpdateWithoutHorariosInput, TrabajadorUncheckedUpdateWithoutHorariosInput>
    create: XOR<TrabajadorCreateWithoutHorariosInput, TrabajadorUncheckedCreateWithoutHorariosInput>
    where?: TrabajadorWhereInput
  }

  export type TrabajadorUpdateToOneWithWhereWithoutHorariosInput = {
    where?: TrabajadorWhereInput
    data: XOR<TrabajadorUpdateWithoutHorariosInput, TrabajadorUncheckedUpdateWithoutHorariosInput>
  }

  export type TrabajadorUpdateWithoutHorariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rol?: RolUpdateOneRequiredWithoutTrabajadoresNestedInput
    clientesAsignados?: ClienteTrabajadorUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorUncheckedUpdateWithoutHorariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rolId?: StringFieldUpdateOperationsInput | string
    clientesAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUncheckedUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type ClienteCreateWithoutInformesInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorCreateNestedManyWithoutClienteInput
    colegio?: ColegioCreateNestedOneWithoutClientesInput
    horarios?: HorarioCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutInformesInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarUncheckedCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutInformesInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutInformesInput, ClienteUncheckedCreateWithoutInformesInput>
  }

  export type TrabajadorCreateWithoutInformesInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rol: RolCreateNestedOneWithoutTrabajadoresInput
    clientesAsignados?: ClienteTrabajadorCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorUncheckedCreateWithoutInformesInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rolId: string
    clientesAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioUncheckedCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoUncheckedCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorCreateOrConnectWithoutInformesInput = {
    where: TrabajadorWhereUniqueInput
    create: XOR<TrabajadorCreateWithoutInformesInput, TrabajadorUncheckedCreateWithoutInformesInput>
  }

  export type ClienteUpsertWithoutInformesInput = {
    update: XOR<ClienteUpdateWithoutInformesInput, ClienteUncheckedUpdateWithoutInformesInput>
    create: XOR<ClienteCreateWithoutInformesInput, ClienteUncheckedCreateWithoutInformesInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutInformesInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutInformesInput, ClienteUncheckedUpdateWithoutInformesInput>
  }

  export type ClienteUpdateWithoutInformesInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUpdateManyWithoutClienteNestedInput
    colegio?: ColegioUpdateOneWithoutClientesNestedInput
    horarios?: HorarioUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutInformesInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUncheckedUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type TrabajadorUpsertWithoutInformesInput = {
    update: XOR<TrabajadorUpdateWithoutInformesInput, TrabajadorUncheckedUpdateWithoutInformesInput>
    create: XOR<TrabajadorCreateWithoutInformesInput, TrabajadorUncheckedCreateWithoutInformesInput>
    where?: TrabajadorWhereInput
  }

  export type TrabajadorUpdateToOneWithWhereWithoutInformesInput = {
    where?: TrabajadorWhereInput
    data: XOR<TrabajadorUpdateWithoutInformesInput, TrabajadorUncheckedUpdateWithoutInformesInput>
  }

  export type TrabajadorUpdateWithoutInformesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rol?: RolUpdateOneRequiredWithoutTrabajadoresNestedInput
    clientesAsignados?: ClienteTrabajadorUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorUncheckedUpdateWithoutInformesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rolId?: StringFieldUpdateOperationsInput | string
    clientesAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type ClienteCreateWithoutContactosFamiliaresInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorCreateNestedManyWithoutClienteInput
    colegio?: ColegioCreateNestedOneWithoutClientesInput
    horarios?: HorarioCreateNestedManyWithoutClienteInput
    informes?: InformeCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutContactosFamiliaresInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutClienteInput
    informes?: InformeUncheckedCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutContactosFamiliaresInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutContactosFamiliaresInput, ClienteUncheckedCreateWithoutContactosFamiliaresInput>
  }

  export type ClienteUpsertWithoutContactosFamiliaresInput = {
    update: XOR<ClienteUpdateWithoutContactosFamiliaresInput, ClienteUncheckedUpdateWithoutContactosFamiliaresInput>
    create: XOR<ClienteCreateWithoutContactosFamiliaresInput, ClienteUncheckedCreateWithoutContactosFamiliaresInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutContactosFamiliaresInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutContactosFamiliaresInput, ClienteUncheckedUpdateWithoutContactosFamiliaresInput>
  }

  export type ClienteUpdateWithoutContactosFamiliaresInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUpdateManyWithoutClienteNestedInput
    colegio?: ColegioUpdateOneWithoutClientesNestedInput
    horarios?: HorarioUpdateManyWithoutClienteNestedInput
    informes?: InformeUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutContactosFamiliaresInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutClienteNestedInput
    informes?: InformeUncheckedUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteCreateWithoutRegistrosDiariosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorCreateNestedManyWithoutClienteInput
    colegio?: ColegioCreateNestedOneWithoutClientesInput
    horarios?: HorarioCreateNestedManyWithoutClienteInput
    informes?: InformeCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutRegistrosDiariosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutClienteInput
    informes?: InformeUncheckedCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarUncheckedCreateNestedManyWithoutClienteInput
    objetivos?: ObjetivoUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutRegistrosDiariosInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutRegistrosDiariosInput, ClienteUncheckedCreateWithoutRegistrosDiariosInput>
  }

  export type TrabajadorCreateWithoutRegistrosCreadosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rol: RolCreateNestedOneWithoutTrabajadoresInput
    clientesAsignados?: ClienteTrabajadorCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioCreateNestedManyWithoutTrabajadorInput
    informes?: InformeCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorUncheckedCreateWithoutRegistrosCreadosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rolId: string
    clientesAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutTrabajadorInput
    informes?: InformeUncheckedCreateNestedManyWithoutTrabajadorInput
    objetivosAsignados?: ObjetivoUncheckedCreateNestedManyWithoutTrabajadorResponsableInput
  }

  export type TrabajadorCreateOrConnectWithoutRegistrosCreadosInput = {
    where: TrabajadorWhereUniqueInput
    create: XOR<TrabajadorCreateWithoutRegistrosCreadosInput, TrabajadorUncheckedCreateWithoutRegistrosCreadosInput>
  }

  export type ClienteUpsertWithoutRegistrosDiariosInput = {
    update: XOR<ClienteUpdateWithoutRegistrosDiariosInput, ClienteUncheckedUpdateWithoutRegistrosDiariosInput>
    create: XOR<ClienteCreateWithoutRegistrosDiariosInput, ClienteUncheckedCreateWithoutRegistrosDiariosInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutRegistrosDiariosInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutRegistrosDiariosInput, ClienteUncheckedUpdateWithoutRegistrosDiariosInput>
  }

  export type ClienteUpdateWithoutRegistrosDiariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUpdateManyWithoutClienteNestedInput
    colegio?: ColegioUpdateOneWithoutClientesNestedInput
    horarios?: HorarioUpdateManyWithoutClienteNestedInput
    informes?: InformeUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutRegistrosDiariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutClienteNestedInput
    informes?: InformeUncheckedUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUncheckedUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type TrabajadorUpsertWithoutRegistrosCreadosInput = {
    update: XOR<TrabajadorUpdateWithoutRegistrosCreadosInput, TrabajadorUncheckedUpdateWithoutRegistrosCreadosInput>
    create: XOR<TrabajadorCreateWithoutRegistrosCreadosInput, TrabajadorUncheckedCreateWithoutRegistrosCreadosInput>
    where?: TrabajadorWhereInput
  }

  export type TrabajadorUpdateToOneWithWhereWithoutRegistrosCreadosInput = {
    where?: TrabajadorWhereInput
    data: XOR<TrabajadorUpdateWithoutRegistrosCreadosInput, TrabajadorUncheckedUpdateWithoutRegistrosCreadosInput>
  }

  export type TrabajadorUpdateWithoutRegistrosCreadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rol?: RolUpdateOneRequiredWithoutTrabajadoresNestedInput
    clientesAsignados?: ClienteTrabajadorUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorUncheckedUpdateWithoutRegistrosCreadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rolId?: StringFieldUpdateOperationsInput | string
    clientesAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUncheckedUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type ClienteCreateWithoutObjetivosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadoresAsignados?: ClienteTrabajadorCreateNestedManyWithoutClienteInput
    colegio?: ColegioCreateNestedOneWithoutClientesInput
    horarios?: HorarioCreateNestedManyWithoutClienteInput
    informes?: InformeCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutObjetivosInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    colegioId?: string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutClienteInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutClienteInput
    informes?: InformeUncheckedCreateNestedManyWithoutClienteInput
    contactosFamiliares?: FamiliarUncheckedCreateNestedManyWithoutClienteInput
    registrosDiarios?: RegistroDiarioUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutObjetivosInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutObjetivosInput, ClienteUncheckedCreateWithoutObjetivosInput>
  }

  export type TrabajadorCreateWithoutObjetivosAsignadosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rol: RolCreateNestedOneWithoutTrabajadoresInput
    clientesAsignados?: ClienteTrabajadorCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioCreateNestedManyWithoutTrabajadorInput
    informes?: InformeCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioCreateNestedManyWithoutTrabajadorInput
  }

  export type TrabajadorUncheckedCreateWithoutObjetivosAsignadosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    rolId: string
    clientesAsignados?: ClienteTrabajadorUncheckedCreateNestedManyWithoutTrabajadorInput
    horarios?: HorarioUncheckedCreateNestedManyWithoutTrabajadorInput
    informes?: InformeUncheckedCreateNestedManyWithoutTrabajadorInput
    registrosCreados?: RegistroDiarioUncheckedCreateNestedManyWithoutTrabajadorInput
  }

  export type TrabajadorCreateOrConnectWithoutObjetivosAsignadosInput = {
    where: TrabajadorWhereUniqueInput
    create: XOR<TrabajadorCreateWithoutObjetivosAsignadosInput, TrabajadorUncheckedCreateWithoutObjetivosAsignadosInput>
  }

  export type ClienteUpsertWithoutObjetivosInput = {
    update: XOR<ClienteUpdateWithoutObjetivosInput, ClienteUncheckedUpdateWithoutObjetivosInput>
    create: XOR<ClienteCreateWithoutObjetivosInput, ClienteUncheckedCreateWithoutObjetivosInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutObjetivosInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutObjetivosInput, ClienteUncheckedUpdateWithoutObjetivosInput>
  }

  export type ClienteUpdateWithoutObjetivosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUpdateManyWithoutClienteNestedInput
    colegio?: ColegioUpdateOneWithoutClientesNestedInput
    horarios?: HorarioUpdateManyWithoutClienteNestedInput
    informes?: InformeUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutObjetivosInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    colegioId?: NullableStringFieldUpdateOperationsInput | string | null
    trabajadoresAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutClienteNestedInput
    informes?: InformeUncheckedUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUncheckedUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type TrabajadorUpsertWithoutObjetivosAsignadosInput = {
    update: XOR<TrabajadorUpdateWithoutObjetivosAsignadosInput, TrabajadorUncheckedUpdateWithoutObjetivosAsignadosInput>
    create: XOR<TrabajadorCreateWithoutObjetivosAsignadosInput, TrabajadorUncheckedCreateWithoutObjetivosAsignadosInput>
    where?: TrabajadorWhereInput
  }

  export type TrabajadorUpdateToOneWithWhereWithoutObjetivosAsignadosInput = {
    where?: TrabajadorWhereInput
    data: XOR<TrabajadorUpdateWithoutObjetivosAsignadosInput, TrabajadorUncheckedUpdateWithoutObjetivosAsignadosInput>
  }

  export type TrabajadorUpdateWithoutObjetivosAsignadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rol?: RolUpdateOneRequiredWithoutTrabajadoresNestedInput
    clientesAsignados?: ClienteTrabajadorUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUpdateManyWithoutTrabajadorNestedInput
  }

  export type TrabajadorUncheckedUpdateWithoutObjetivosAsignadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rolId?: StringFieldUpdateOperationsInput | string
    clientesAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUncheckedUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUncheckedUpdateManyWithoutTrabajadorNestedInput
  }

  export type TrabajadorCreateManyRolInput = {
    id?: string
    username: string
    passwordHash: string
    nombre: string
    apellidos: string
    email: string
    telefono?: string | null
    img?: string | null
    fechaContratacion?: Date | string | null
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrabajadorUpdateWithoutRolInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientesAsignados?: ClienteTrabajadorUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorUncheckedUpdateWithoutRolInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clientesAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    informes?: InformeUncheckedUpdateManyWithoutTrabajadorNestedInput
    registrosCreados?: RegistroDiarioUncheckedUpdateManyWithoutTrabajadorNestedInput
    objetivosAsignados?: ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableNestedInput
  }

  export type TrabajadorUncheckedUpdateManyWithoutRolInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    img?: NullableStringFieldUpdateOperationsInput | string | null
    fechaContratacion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteTrabajadorCreateManyTrabajadorInput = {
    clienteId: string
    createdAt?: Date | string
    tipoTerapia?: string | null
  }

  export type HorarioCreateManyTrabajadorInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type InformeCreateManyTrabajadorInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type RegistroDiarioCreateManyTrabajadorInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type ObjetivoCreateManyTrabajadorResponsableInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    clienteId: string
  }

  export type ClienteTrabajadorUpdateWithoutTrabajadorInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
    cliente?: ClienteUpdateOneRequiredWithoutTrabajadoresAsignadosNestedInput
  }

  export type ClienteTrabajadorUncheckedUpdateWithoutTrabajadorInput = {
    clienteId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClienteTrabajadorUncheckedUpdateManyWithoutTrabajadorInput = {
    clienteId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HorarioUpdateWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutHorariosNestedInput
  }

  export type HorarioUncheckedUpdateWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type HorarioUncheckedUpdateManyWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type InformeUpdateWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutInformesNestedInput
  }

  export type InformeUncheckedUpdateWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type InformeUncheckedUpdateManyWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroDiarioUpdateWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutRegistrosDiariosNestedInput
  }

  export type RegistroDiarioUncheckedUpdateWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroDiarioUncheckedUpdateManyWithoutTrabajadorInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type ObjetivoUpdateWithoutTrabajadorResponsableInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutObjetivosNestedInput
  }

  export type ObjetivoUncheckedUpdateWithoutTrabajadorResponsableInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type ObjetivoUncheckedUpdateManyWithoutTrabajadorResponsableInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: StringFieldUpdateOperationsInput | string
  }

  export type ClienteCreateManyColegioInput = {
    id?: string
    idCarpetaDrive?: string | null
    nombre: string
    apellidos: string
    fechaNacimiento?: Date | string | null
    domicilio: string
    curso: string
    diagnostico: string
    tratamientos: string
    medicacion: string
    alergias?: string | null
    activo?: boolean
    adaptaciones?: boolean
    apoyos?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClienteUpdateWithoutColegioInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUpdateManyWithoutClienteNestedInput
    horarios?: HorarioUpdateManyWithoutClienteNestedInput
    informes?: InformeUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutColegioInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadoresAsignados?: ClienteTrabajadorUncheckedUpdateManyWithoutClienteNestedInput
    horarios?: HorarioUncheckedUpdateManyWithoutClienteNestedInput
    informes?: InformeUncheckedUpdateManyWithoutClienteNestedInput
    contactosFamiliares?: FamiliarUncheckedUpdateManyWithoutClienteNestedInput
    registrosDiarios?: RegistroDiarioUncheckedUpdateManyWithoutClienteNestedInput
    objetivos?: ObjetivoUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateManyWithoutColegioInput = {
    id?: StringFieldUpdateOperationsInput | string
    idCarpetaDrive?: NullableStringFieldUpdateOperationsInput | string | null
    nombre?: StringFieldUpdateOperationsInput | string
    apellidos?: StringFieldUpdateOperationsInput | string
    fechaNacimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    domicilio?: StringFieldUpdateOperationsInput | string
    curso?: StringFieldUpdateOperationsInput | string
    diagnostico?: StringFieldUpdateOperationsInput | string
    tratamientos?: StringFieldUpdateOperationsInput | string
    medicacion?: StringFieldUpdateOperationsInput | string
    alergias?: NullableStringFieldUpdateOperationsInput | string | null
    activo?: BoolFieldUpdateOperationsInput | boolean
    adaptaciones?: BoolFieldUpdateOperationsInput | boolean
    apoyos?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteTrabajadorCreateManyClienteInput = {
    trabajadorId: string
    createdAt?: Date | string
    tipoTerapia?: string | null
  }

  export type HorarioCreateManyClienteInput = {
    id?: string
    fechaHoraInicio: Date | string
    fechaHoraFin: Date | string
    tipoSesion: string
    estado?: string
    notas?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorId: string
  }

  export type InformeCreateManyClienteInput = {
    id?: string
    titulo: string
    contenido: string
    fechaCreacion?: Date | string
    fechaVencimiento?: Date | string | null
    estado?: string
    urlDocumentoFinal?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorId: string
  }

  export type FamiliarCreateManyClienteInput = {
    id?: string
    nombreContacto: string
    parentesco?: string | null
    telefonoMadre?: string | null
    emailMadre?: string | null
    telefonoPadre?: string | null
    emailPadre?: string | null
    telefonoWhatsapp?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RegistroDiarioCreateManyClienteInput = {
    id?: string
    fechaRegistro?: Date | string
    contenido: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorId: string
  }

  export type ObjetivoCreateManyClienteInput = {
    id?: string
    titulo: string
    descripcion?: string | null
    fechaInicio?: Date | string
    fechaFinPrevista?: Date | string | null
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    trabajadorResponsableId: string
  }

  export type ClienteTrabajadorUpdateWithoutClienteInput = {
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
    trabajador?: TrabajadorUpdateOneRequiredWithoutClientesAsignadosNestedInput
  }

  export type ClienteTrabajadorUncheckedUpdateWithoutClienteInput = {
    trabajadorId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClienteTrabajadorUncheckedUpdateManyWithoutClienteInput = {
    trabajadorId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoTerapia?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type HorarioUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajador?: TrabajadorUpdateOneRequiredWithoutHorariosNestedInput
  }

  export type HorarioUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type HorarioUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaHoraInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaHoraFin?: DateTimeFieldUpdateOperationsInput | Date | string
    tipoSesion?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type InformeUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajador?: TrabajadorUpdateOneRequiredWithoutInformesNestedInput
  }

  export type InformeUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type InformeUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    contenido?: StringFieldUpdateOperationsInput | string
    fechaCreacion?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    urlDocumentoFinal?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type FamiliarUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreContacto?: StringFieldUpdateOperationsInput | string
    parentesco?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoMadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailMadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoPadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailPadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoWhatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FamiliarUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreContacto?: StringFieldUpdateOperationsInput | string
    parentesco?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoMadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailMadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoPadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailPadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoWhatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FamiliarUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    nombreContacto?: StringFieldUpdateOperationsInput | string
    parentesco?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoMadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailMadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoPadre?: NullableStringFieldUpdateOperationsInput | string | null
    emailPadre?: NullableStringFieldUpdateOperationsInput | string | null
    telefonoWhatsapp?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RegistroDiarioUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajador?: TrabajadorUpdateOneRequiredWithoutRegistrosCreadosNestedInput
  }

  export type RegistroDiarioUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type RegistroDiarioUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaRegistro?: DateTimeFieldUpdateOperationsInput | Date | string
    contenido?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorId?: StringFieldUpdateOperationsInput | string
  }

  export type ObjetivoUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorResponsable?: TrabajadorUpdateOneRequiredWithoutObjetivosAsignadosNestedInput
  }

  export type ObjetivoUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorResponsableId?: StringFieldUpdateOperationsInput | string
  }

  export type ObjetivoUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaInicio?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaFinPrevista?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    trabajadorResponsableId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}