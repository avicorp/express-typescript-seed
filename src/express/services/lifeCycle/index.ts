import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { IPod, PodStatus } from '../../models/serverLess';
import { PodRepository } from '../../repository/pod';
import { sleep } from '../../../utils';
import { TYPES } from '../../../constants';


@injectable()
export class LifeCycle {
    private podRepo: PodRepository;
    private logger: Logger;
    private podId: string;

    public constructor(
        @inject(TYPES.PodRepository) podRepo: PodRepository,
        @inject(TYPES.WinstonLogger) logger: Logger,
    ) {
        this.podRepo = podRepo;
        this.logger = logger;
        this.podId = "-1";
    }

    public async initPod() { 
        try {
            const podObj = <IPod>{
                status: PodStatus.init,
                lastModifiedDate: new Date(Date.now())
            };
            const newPod = await this.podRepo.createNewPod(podObj);
            if(newPod)
                this.podId  = newPod._id;
                this.logger.info(`Pod id:${newPod._id} init.`);
        } catch (err) {
            this.logger.error(err);
        }
    }

    public async onlinePod() {
        if (this.podId == "-1")
            throw new Error("The pod didn't init, and can't set as online.");
        try {
            const podObj = <IPod>{
                status: PodStatus.online,
                lastModifiedDate: new Date(Date.now())
            };
            const result = await this.podRepo.updatePod(<any>this.podId, podObj);
            if(result)
                this.logger.info(`Pod id:${result._id} set to online.`);
        } catch (err) {
            this.logger.error(err);
        }
    }

    public async resetPod() {
        if (this.podId == "-1")
            throw new Error("The pod didn't init, and can't set as reset.");
        try {
            const podObj = <IPod>{
                status: PodStatus.reset,
                lastModifiedDate: new Date(Date.now())
            };
            const result = await this.podRepo.updatePod(<any>this.podId, podObj);
            if(result)
                this.logger.info(`Pod id:${result._id} set to reset.`);
        } catch (err) {
            this.logger.error(err);
        }
    }

    public async podStatus(): Promise <PodStatus | undefined> {
        if (this.podId == "-1")
            throw new Error("The pod didn't init, and can't set as reset.");
        try {
            const result = await this.podRepo.getPodByID(<any>this.podId);
            if (result)
                return result.status;
            return undefined;
        } catch (err) {
            this.logger.error(err);
            return undefined;
        }
    }
}