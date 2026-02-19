import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { VisitorsService } from './visitors.service';

@Controller('visitors')
export class VisitorsController {
    constructor(private visitorsService: VisitorsService) {}

    @Post()
    create(@Body() body) {
        return this.visitorsService.createVisitor(body);
    }

    @Get()
    findAll() {
        return this.visitorsService.getAllVisitors();
    }

    @Get('approve')
    approve(@Query('token') token: string) {
        return this.visitorsService.approveVisitor(token);
    }
}
