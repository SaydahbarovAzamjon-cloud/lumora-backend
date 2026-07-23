import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? '587');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.fromAddress =
      this.config.get<string>('SMTP_FROM') ?? 'Lumora <noreply@lumora.local>';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP not configured — verification codes will be logged in development',
      );
    }
  }

  async sendVerificationCode(input: {
    email: string;
    code: string;
    purposeLabel: string;
  }): Promise<void> {
    const subject = `Lumora — ${input.purposeLabel} code`;
    const text = `Your Lumora ${input.purposeLabel} code is: ${input.code}\n\nThis code expires in 2 minutes.`;

    if (!this.transporter) {
      this.logger.log(
        `[DEV] ${input.purposeLabel} code for ${input.email}: ${input.code}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: input.email,
      subject,
      text,
    });
  }
}
