import prisma from '../../../config/prisma';

//create a new voucher type for a company
export const createVoucherTypeModel = async (data: any) => {
  return await prisma.voucherType.create({
    data: {
      //company scoping (multi-tenancy)
      companyId: data.companyId,

      //voucher type name
      name: data.name,

      //unique voucher type code per company
      code: data.code,

      //voucher category
      category: data.category,

      //optional prefix
      prefix: data.prefix || null,

      //optional suffix
      suffix: data.suffix || null,

      //starting sequence number
      startingNumber: data.startingNumber || 1,

      //initialize current number
      currentNumber: data.startingNumber || 1,

      //system or user-defined
      isSystem: data.isSystem || false,

      //active status
      isActive: data.isActive ?? true,

    },
  });
};

//get all voucher types for a company
export const getVoucherTypesModel = async (companyId: string) => {
  return await prisma.voucherType.findMany({
    where: {
      //ensure company isolation
      companyId,

      //return only active types
      isActive: true,
    },
    orderBy: {
      //alphabetical order
      name: 'asc',
    },
  });
};

//update voucher type details
export const updateVoucherTypeModel = async (
  voucherTypeId: string,
  data: any
) => {
  return await prisma.voucherType.update({
    where: {
      //voucher type primary key
      id: voucherTypeId,
    },
    data: {
      //update name
      name: data.name,

      //update code
      code: data.code,

      //update category
      category: data.category,

      //update prefix
      prefix: data.prefix,

      //update suffix
      suffix: data.suffix,

      //enable or disable voucher type
      isActive: data.isActive,

      
    },
  });
};

//get next voucher number and increment sequence safely
export const getNextVoucherNumberModel = async (voucherTypeId: string) => {
  return await prisma.$transaction(async (tx) => {
    //fetch current voucher type sequence data
    const voucherType = await tx.voucherType.findUnique({
      where: { id: voucherTypeId },
      select: {
        //prefix for number
        prefix: true,

        //current sequence number
        currentNumber: true,

        //suffix for number
        suffix: true,
      },
    });

    //validate voucher type existence
    if (!voucherType) {
      throw new Error('Voucher type not found');
    }

    //generate formatted voucher number
    const nextNumber =
      `${voucherType.prefix || ''}` +
      `${voucherType.currentNumber.toString().padStart(4, '0')}` +
      `${voucherType.suffix || ''}`;

    //increment sequence atomically
    await tx.voucherType.update({
      where: { id: voucherTypeId },
      data: {
        //safe increment
        currentNumber: { increment: 1 },
      },
    });

    //return generated voucher number
    return nextNumber;
  });
};

