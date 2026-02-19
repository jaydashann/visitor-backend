import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios'; 
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'; 

@Injectable()
export class VisitorsService {
  private readonly GAS_URL = 'https://script.google.com/macros/s/AKfycbzF61m6MffR4DM6hbgC9kXzCEiP-P7C9K5qlefktkBl8BPTlTgKJ_x7mEKYajlmI7J7/exec';

  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService, 
  ) {}

  async createVisitor(data: {
    name: string;
    contact_no?: string;
    email?: string;
    purpose?: string;
    contact_person_email?: string;
    status: boolean;
  }) {
    // generate a unique token for the approval link
    const approvalToken = uuidv4();

    // save visitor to MySQL
    const visitor = await this.prisma.visitor.create({
      data: {
        ...data,
        status: data.status ?? false,
        token: approvalToken, // save the token
      },
    });

    // trigger Google Apps Script Email 
    if (visitor.contact_person_email) {
      try {
        await firstValueFrom(
          this.httpService.post(this.GAS_URL, {
            visitorName: visitor.name,
            contactEmail: visitor.contact_person_email,
            token: approvalToken,
            purpose: visitor.purpose,
          }),
        );
      } catch (error) {
        console.error('Failed to send email via GAS:', error.message);
      }
    }

    return visitor;
  }

  // approval link when email button is pressed
  async approveVisitor(token: string) {
    const visitor = await this.prisma.visitor.findUnique({
      where: { token },
    });

    if (!visitor) {
      throw new InternalServerErrorException('Invalid approval token.');
    }

    return this.prisma.visitor.update({
      where: { token },
      data: { status: true },
    });
  }

  async getAllVisitors() {
    const visitors = await this.prisma.visitor.findMany({
      orderBy: { created_at: 'desc' },
    });

    return visitors.map((v) => ({
      ...v,
      statusLabel: v.status ? 'Approved' : 'Pending',
    }));
  }
}