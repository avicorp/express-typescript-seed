import { injectable } from 'inversify';
import { ControllerInfo, IControllerInfo, ResourcStatus } from '../../models/serverLess';

@injectable()
export class ControlleresRepository {

    public constructor() {}

    public async create(controller: IControllerInfo): Promise<IControllerInfo> {
        const newController = await ControllerInfo.create(controller);
        return newController;
    }

    public async update(id:any ,controller: IControllerInfo): Promise<IControllerInfo | null> {
        const updatedController = await ControllerInfo.findByIdAndUpdate(id, 
            controller);
        return updatedController;
    }

    public async getByName(controller: IControllerInfo): Promise<IControllerInfo[]> {
        const controllerExist = await ControllerInfo.find({ controllerName: controller.controllerName })
        return controllerExist;
    }

    public async getControlleres(status :ResourcStatus[], limit:number): Promise<IControllerInfo[]> {
        const updatedController = await ControllerInfo.find({ $or:[ {status: status[0]}, {status: status[1]} ]}, null, { limit: limit });
        return updatedController;
    }
}