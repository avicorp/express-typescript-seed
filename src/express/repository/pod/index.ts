import { injectable } from 'inversify';
import { Pod, IPod, PodStatus } from '../../models/serverLess';

@injectable()
export class PodRepository {

    public constructor() {}

    public async createNewPod(pod: IPod): Promise<IPod> {
        const newPod = await Pod.create(pod);
        return newPod;
    }

    public async updatePod(id: any ,pod: IPod): Promise<IPod | null> {
        const updatedPod = await Pod.findByIdAndUpdate(id, 
            pod);
        return updatedPod;
    }

    public async getPodes(status :PodStatus, limit:number): Promise<IPod[]> {
        const updatedPod = await Pod.find({ status: status }, null, { limit: limit });
        return updatedPod;
    }

    public async getPodByID(id: any): Promise<IPod | null> {
        const pod = await Pod.findById(id);
        return pod;
    }
}