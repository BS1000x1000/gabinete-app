import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * StorageService — wrapper sobre Scaleway Object Storage (API compatible con S3).
 *
 * Variables de entorno requeridas:
 *   SCW_ACCESS_KEY    — Access Key de la API de Scaleway
 *   SCW_SECRET_KEY    — Secret Key de la API de Scaleway
 *   SCW_BUCKET_NAME   — Nombre del bucket en Object Storage
 *   SCW_REGION        — Región (por defecto: fr-par)
 *
 * Si alguna variable falta, el servicio opera en modo no-op:
 * los métodos devuelven null y registran una advertencia. La app
 * no crashea — las funcionalidades que dependen de Storage quedan
 * deshabilitadas hasta que se configuren las credenciales.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string | null;

  constructor() {
    const accessKey  = process.env.SCW_ACCESS_KEY;
    const secretKey  = process.env.SCW_SECRET_KEY;
    const bucketName = process.env.SCW_BUCKET_NAME;
    const region     = process.env.SCW_REGION ?? 'fr-par';

    if (!accessKey || !secretKey || !bucketName) {
      this.logger.warn(
        'Object Storage no configurado (faltan variables SCW_*). ' +
        'Los ficheros no se archivarán hasta que se definan las credenciales.',
      );
      this.client = null;
      this.bucket = null;
      return;
    }

    this.client = new S3Client({
      region,
      endpoint: `https://s3.${region}.scw.cloud`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
    this.bucket = bucketName;
    this.logger.log(`StorageService listo — bucket: ${bucketName} (${region})`);
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Sube un fichero al bucket.
   * @returns La clave (key) del objeto subido, o null si Storage no está configurado.
   */
  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string | null> {
    if (!this.client || !this.bucket) return null;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    this.logger.log(`Storage upload OK — ${key}`);
    return key;
  }

  /**
   * Genera una URL prefirmada con expiración para descargar un objeto.
   * @param expiresInSeconds Duración en segundos (por defecto 900 = 15 min).
   * @returns URL temporal, o null si Storage no está configurado.
   */
  async getSignedUrl(
    key: string,
    expiresInSeconds = 900,
  ): Promise<string | null> {
    if (!this.client || !this.bucket) return null;

    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Elimina un objeto del bucket.
   */
  async delete(key: string): Promise<void> {
    if (!this.client || !this.bucket) return;

    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    this.logger.log(`Storage delete OK — ${key}`);
  }
}
