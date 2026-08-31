import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { promises as fs } from 'fs';
import { dirname, join, resolve, sep } from 'path';

/**
 * StorageService — almacenamiento de ficheros del expediente.
 *
 * Tres modos, elegidos en el arranque:
 *
 *   `s3`     Scaleway Object Storage (API compatible con S3). Es el único modo
 *            válido en producción. Requiere SCW_ACCESS_KEY, SCW_SECRET_KEY y
 *            SCW_BUCKET_NAME (SCW_REGION por defecto `fr-par`).
 *
 *   `local`  Carpeta del disco, SOLO fuera de producción. Existe para poder
 *            generar y revisar los PDF del expediente sin contratar todavía el
 *            bucket. Nunca se activa con NODE_ENV=production: los contenedores
 *            son efímeros y un fichero clínico en disco se pierde en el
 *            siguiente despliegue (regla innegociable nº2 de CLAUDE.md).
 *
 *   `none`   Producción sin credenciales. Todo devuelve null y quien dependa de
 *            Storage falla de forma ruidosa, que es lo que debe pasar.
 */
export type StorageDriver = 's3' | 'local' | 'none';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string | null = null;
  private readonly rootLocal: string | null = null;
  readonly driver: StorageDriver;

  constructor() {
    const accessKey  = process.env.SCW_ACCESS_KEY;
    const secretKey  = process.env.SCW_SECRET_KEY;
    const bucketName = process.env.SCW_BUCKET_NAME;
    const region     = process.env.SCW_REGION ?? 'fr-par';

    if (accessKey && secretKey && bucketName) {
      this.client = new S3Client({
        region,
        endpoint: `https://s3.${region}.scw.cloud`,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      });
      this.bucket = bucketName;
      this.driver = 's3';
      this.logger.log(`StorageService listo — bucket: ${bucketName} (${region})`);
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      this.driver = 'none';
      this.logger.error(
        'Object Storage no configurado (faltan variables SCW_*). ' +
        'En producción no hay alternativa: los ficheros no se pueden guardar.',
      );
      return;
    }

    this.rootLocal = resolve(
      process.env.STORAGE_LOCAL_DIR ?? join(process.cwd(), '.almacen-local'),
    );
    this.driver = 'local';
    this.logger.warn(
      `Object Storage no configurado — modo LOCAL de desarrollo en ${this.rootLocal}. ` +
      'Los ficheros se guardan en disco; no uses este modo con datos reales.',
    );
  }

  get isConfigured(): boolean {
    return this.driver !== 'none';
  }

  /** El binario se sirve por la API (modo local) en vez de por URL prefirmada. */
  get sirveDesdeApi(): boolean {
    return this.driver === 'local';
  }

  /**
   * Ruta en disco de una clave, comprobando que no se escapa de la raíz.
   * Las claves las genera la app, pero un `..` colado convertiría una subida
   * en una escritura arbitraria del sistema de ficheros.
   */
  private rutaLocal(key: string): string {
    const destino = resolve(this.rootLocal!, key);
    if (destino !== this.rootLocal && !destino.startsWith(this.rootLocal + sep)) {
      throw new Error(`Clave de almacenamiento no válida: ${key}`);
    }
    return destino;
  }

  /**
   * Sube un fichero.
   * @returns La clave (key) del objeto, o null si no hay almacenamiento.
   */
  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string | null> {
    if (this.driver === 'none') return null;

    if (this.driver === 'local') {
      const destino = this.rutaLocal(key);
      await fs.mkdir(dirname(destino), { recursive: true });
      await fs.writeFile(destino, body);
      this.logger.log(`Storage local OK — ${key}`);
      return key;
    }

    await this.client!.send(
      new PutObjectCommand({
        Bucket: this.bucket!,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    this.logger.log(`Storage upload OK — ${key}`);
    return key;
  }

  /** Lee un objeto. Solo lo usa el modo local, que no tiene URL prefirmada. */
  async download(key: string): Promise<Buffer | null> {
    if (this.driver === 'local') {
      return fs.readFile(this.rutaLocal(key)).catch(() => null);
    }
    if (this.driver === 'none') return null;

    const res = await this.client!.send(
      new GetObjectCommand({ Bucket: this.bucket!, Key: key }),
    );
    const chunks: Buffer[] = [];
    for await (const chunk of res.Body as any) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  }

  /**
   * Genera una URL prefirmada con expiración para descargar un objeto.
   * @param expiresInSeconds Duración en segundos (por defecto 900 = 15 min).
   * @returns URL temporal, o null si no hay bucket (incluido el modo local,
   *          donde el fichero lo sirve la propia API).
   */
  async getSignedUrl(
    key: string,
    expiresInSeconds = 900,
  ): Promise<string | null> {
    if (this.driver !== 's3') return null;

    const command = new GetObjectCommand({ Bucket: this.bucket!, Key: key });
    return getSignedUrl(this.client!, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Elimina un objeto.
   */
  async delete(key: string): Promise<void> {
    if (this.driver === 'none') return;

    if (this.driver === 'local') {
      await fs.rm(this.rutaLocal(key), { force: true });
      this.logger.log(`Storage local delete OK — ${key}`);
      return;
    }

    await this.client!.send(
      new DeleteObjectCommand({ Bucket: this.bucket!, Key: key }),
    );
    this.logger.log(`Storage delete OK — ${key}`);
  }
}
