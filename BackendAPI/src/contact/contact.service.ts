import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  // Da de alta un mensaje de contacto.
  async create(createContactDto: CreateContactDto) {
    // Verify service exists (middleware filters deleted_at = null)
    const service = await this.prisma.service.findUnique({
      where: { id_service: createContactDto.id_service },
    });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${createContactDto.id_service} not found`);
    }

    return await this.prisma.contact.create({
      data: createContactDto,
      include: {
        service: true,
      },
    });
  }

  // Lista los mensajes de contacto activos.
  async findAll(status?: boolean) {
    // Middleware automatically filters deleted_at = null
    return await this.prisma.contact.findMany({
      where: {
        ...(status !== undefined && { status }),
      },
      include: {
        service: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Trae los mensajes que llegaron por un servicio puntual.
  async findByService(serviceId: number) {
    // Middleware automatically filters deleted_at = null
    return await this.prisma.contact.findMany({
      where: {
        id_service: serviceId,
      },
      include: {
        service: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Busca un mensaje de contacto por id; si no lo encuentra, responde 404.
  async findOne(id: number) {
    // Middleware automatically filters deleted_at = null
    const contact = await this.prisma.contact.findUnique({
      where: { id_contact: id },
      include: {
        service: true,
      },
    });
    
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    
    return contact;
  }

  // Actualiza los datos de un mensaje de contacto.
  async update(id: number, updateContactDto: UpdateContactDto) {
    await this.findOne(id); // Validate existence
    
    return await this.prisma.contact.update({
      where: { id_contact: id },
      data: updateContactDto,
      include: {
        service: true,
      },
    });
  }

  // Marca un mensaje como leído.
  async markAsRead(id: number) {
    await this.findOne(id); // Validate existence
    
    return await this.prisma.contact.update({
      where: { id_contact: id },
      data: {
        status: true,
      },
      include: {
        service: true,
      },
    });
  }

  // Da de baja un mensaje de contacto. Es baja lógica: el registro queda en la base con su fecha de borrado.
  async remove(id: number) {
    await this.findOne(id); // Validate existence
    
    // Baja lógica: el middleware convierte el delete en un update con deleted_at
    return await this.prisma.contact.delete({
      where: { id_contact: id },
    });
  }
}
