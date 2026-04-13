import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * R2Service — wrapper sobre Cloudflare R2 (API compatible con S3).
 *
 * Requiere las variables de entorno:
 *   R2_ACCOUNT_ID         — ID de cuenta Cloudflare
 *   R2_ACCESS_KEY_ID      — Access Key ID del token R2
 *   R2_SECRET_ACCESS_KEY  — Secret Access Key del token R2
 *   R2_BUCKET_NAME        — Nombre del bucket
 *
 * Si alguna variable falta, el servicio opera en modo no-op:
 * los métodos devuelven null y registran una advertencia. La app
 * no crashea — las funcionalidades que dependen de R2 quedan
 * deshabilitadas hasta que se configuren las credenciales.
 */
@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly client: S3Client | null;
  private readonly bucket: string | null;

  constructor() {
    const accountId  = process.env.R2_ACCOUNT_ID;
    const accessKey  = process.env.R2_ACCESS_KEY_ID;
    const secretKey  = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!accountId || !accessKey || !secretKey || !bucketName) {
      this.logger.warn(
        'R2 no configurado (faltan variables R2_*). ' +
        'Los PDFs no se archivarán en R2 hasta que se definan las credenciales.',
      );
      this.client = null;
      this.bucket = null;
      return;
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
    this.bucket = bucketName;
    this.logger.log(`R2Service listo — bucket: ${bucketName}`);
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Sube un fichero al bucket.
   * @returns La clave (key) del objeto subido, o null si R2 no está configurado.
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

    this.logger.log(`R2 upload OK — ${key}`);
    return key;
  }

  /**
   * Genera una URL prefirmada con expiración para descargar un objeto.
   * @param expiresInSeconds Duración en segundos (por defecto 900 = 15 min).
   * @returns URL temporal, o null si R2 no está configurado.
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
    this.logger.log(`R2 delete OK — ${key}`);
  }
}
