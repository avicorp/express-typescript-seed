import { injectable } from 'inversify';
import { ControllerInfo, IControllerInfo, ResourcStatus } from '../../models/serverLess';

@injectable()
export class ControllerRepository {

    public constructor() {}

    public async createNewController(controller: IControllerInfo): Promise<IControllerInfo> {
        const newController = await ControllerInfo.create(controller);
        return newController;
    }

    public async updateController(id:any ,controller: IControllerInfo): Promise<IControllerInfo | null> {
        const updatedController = await ControllerInfo.findByIdAndUpdate(id, 
            controller);
        return updatedController;
    }

    public async getControlleres(status :ResourcStatus, limit:number): Promise<IControllerInfo[]> {
        const updatedController = await ControllerInfo.find({ status: status }, null, { limit: limit });
        return updatedController;
    }
}