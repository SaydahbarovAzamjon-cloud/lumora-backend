import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  AiAnalyzeFaceRequest,
  AiAnalyzeFaceResponse,
} from './ai.types';

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyzeFace(
    body: AiAnalyzeFaceRequest,
  ): Promise<AiAnalyzeFaceResponse> {
    const baseUrl = this.configService
      .get<string>('AI_SERVICE_URL', 'http://127.0.0.1:8000')
      .replace(/\/$/, '');
    const url = `${baseUrl}/v1/analyze/face`;
    const apiKey = this.configService.get<string>('AI_API_KEY');
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv === 'production' && !apiKey) {
      throw new ServiceUnavailableException(
        'AI service is not configured (AI_API_KEY required in production)',
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
    }

    const timeoutMs = Number.parseInt(
      this.configService.get<string>('AI_TIMEOUT_MS') ?? '15000',
      10,
    );

    try {
      const response = await firstValueFrom(
        this.http.post<AiAnalyzeFaceResponse>(url, body, {
          headers,
          timeout: Number.isFinite(timeoutMs) ? timeoutMs : 15000,
        }),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.warn(
        `AI analyzeFace failed: ${axiosError.message ?? 'unknown error'}`,
      );
      throw new ServiceUnavailableException(
        'Face analysis service is temporarily unavailable',
      );
    }
  }
}
