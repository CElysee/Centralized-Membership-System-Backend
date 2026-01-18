import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

/**
 * File Service - Proxy to File Server
 * Handles communication with the external file server
 */
@Injectable()
export default class FilesService {
  private readonly fileServerUrl: string;

  constructor(private configService: ConfigService) {
    this.fileServerUrl = this.configService.get('FILE_SERVER_URL') || 'http://localhost:3001';
  }

  /**
   * Stream file by ID (proxy to file server)
   */
  async streamFileById(fileId: string, res: Response): Promise<void> {
    try {
      const response = await fetch(`${this.fileServerUrl}/api/files/stream/id/${fileId}`);

      if (!response.ok) {
        throw new HttpException(
          response.statusText || 'File not found',
          response.status,
        );
      }

      // Forward headers
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      if (contentType) res.setHeader('Content-Type', contentType);
      if (contentLength) res.setHeader('Content-Length', contentLength);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new InternalServerErrorException('Failed to read file stream');
      }

      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      const nodeStream = this.webStreamToNodeStream(stream);
      nodeStream.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to stream file from file server');
    }
  }

  /**
   * Stream file by filename (proxy to file server)
   */
  async streamFileByName(fileName: string, res: Response): Promise<void> {
    try {
      const response = await fetch(`${this.fileServerUrl}/api/files/stream/${fileName}`);

      if (!response.ok) {
        throw new HttpException(
          response.statusText || 'File not found',
          response.status,
        );
      }

      // Forward headers
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');

      if (contentType) res.setHeader('Content-Type', contentType);
      if (contentLength) res.setHeader('Content-Length', contentLength);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      // Stream the response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new InternalServerErrorException('Failed to read file stream');
      }

      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      const nodeStream = this.webStreamToNodeStream(stream);
      nodeStream.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to stream file from file server');
    }
  }

  /**
   * Get multiple files information by IDs (proxy to file server)
   */
  async getFilesByIds(ids: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.fileServerUrl}/api/files/info/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new HttpException(
          response.statusText || 'Failed to get files info',
          response.status,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get files info from file server');
    }
  }

  /**
   * Convert Web ReadableStream to Node.js Readable stream
   */
  private webStreamToNodeStream(webStream: ReadableStream): NodeJS.ReadableStream {
    const { Readable } = require('stream');
    const reader = webStream.getReader();

    return new Readable({
      async read() {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      },
    });
  }
}
