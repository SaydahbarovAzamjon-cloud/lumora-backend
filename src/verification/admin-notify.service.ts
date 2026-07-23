import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type PasswordResetAdminNotification = {
  displayName?: string | null;
  userId: string;
  authentication: string;
  identifier: string;
  verification: string;
  status: 'SUCCESS' | 'FAILED';
  timeIso: string;
};

@Injectable()
export class AdminNotifyService {
  private readonly logger = new Logger(AdminNotifyService.name);
  private readonly botToken: string | undefined;
  private readonly chatId: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    this.chatId = this.config.get<string>('TELEGRAM_ADMIN_CHAT_ID');
  }

  async notifyPasswordReset(
    event: PasswordResetAdminNotification,
  ): Promise<void> {
    const text = [
      '━━━━━━━━━━━━━━━━━━━━',
      '🔑 PASSWORD RESET',
      '',
      'User:',
      event.displayName?.trim() || '—',
      '',
      'User ID:',
      event.userId,
      '',
      'Authentication:',
      event.authentication,
      '',
      'Identifier:',
      event.identifier,
      '',
      'Verification:',
      event.verification,
      '',
      'Status:',
      event.status,
      '',
      'Time:',
      event.timeIso,
      '━━━━━━━━━━━━━━━━━━━━',
    ].join('\n');

    if (!this.botToken || !this.chatId) {
      this.logger.log(`[DEV] Admin password-reset notification:\n${text}`);
      return;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.chatId,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Telegram admin notify failed: ${body}`);
    }
  }
}
