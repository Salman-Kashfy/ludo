import BaseModel from '../baseModel';
import { CustomerDevice as CustomerDeviceEntity } from '../../database/entity/CustomerDevice';
import Context from '../context';

export default class CustomerDeviceModel extends BaseModel {
    constructor(connection: any, context: Context) {
        super(connection, connection.getRepository(CustomerDeviceEntity), context);
    }

    async save(input: any) {
        const customer = await this.context.customer.repository.findOne({
            where: { uuid: input.customerUuid }
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        let device = await this.repository.findOne({
            where: { deviceToken: input.deviceToken }
        });

        if (device) {
            device.customerId = customer.id;
            device.deviceType = input.deviceType;
            if (input.fcmToken) {
                device.fcmToken = input.fcmToken;
            }
        } else {
            device = this.repository.create({
                deviceToken: input.deviceToken,
                deviceType: input.deviceType,
                fcmToken: input.fcmToken,
                customerId: customer.id
            });
        }

        return await this.repository.save(device);
    }

    /**
     * Return devices (with FCM tokens) for a given customer.
     */
    async findByCustomerId(customerId: number) {
        return this.repository.find({
            where: { customerId }
        });
    }
}
