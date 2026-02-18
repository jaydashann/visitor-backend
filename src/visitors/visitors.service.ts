import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class VisitorsService {
    constructor(private prisma: PrismaService) {}

    createVisitor(data: {
        name: string;
        contact_no?: string;
        email?: string;
        purpose?: string;
        contact_person_email?: string;
        status: boolean;
    }) {
        return this.prisma.visitor.create({ 
            data: {
                ...data,
                status: data.status ?? false, // default to pending
            },
        });
    }

    getAllVisitors() {
        return this.prisma.visitor.findMany({
            orderBy: { created_at: 'desc' },
        }).then(visitors =>
            visitors.map(v => ({
                ...v,
                statusLabel: v.status ? 'Approved' : 'Pending',
            }))
        )
    }
}
