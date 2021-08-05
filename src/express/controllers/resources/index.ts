import { Response } from 'express';
import { inject } from 'inversify';
import { controller, httpPost, response, request } from 'inversify-express-utils';
import { LifeCycle } from '../../services/lifeCycle';
import { RepositoryRepository } from '../../repository/repository';
import { ControlleresRepository } from '../../repository/controller';
import { PodStatus, IRepositoryInfo, IControllerInfo, ResourcStatus } from '../../models/serverLess';
import { TYPES } from '../../../constants';

@controller('/api/v1/resources')
export class ResourecsController {
    private lifeCycle: LifeCycle;
    private repositoryRepository: RepositoryRepository;
    private controlleresRepository:ControlleresRepository;

    public constructor(
        @inject(TYPES.LifeCycle) lifeCycle: LifeCycle,
        @inject(TYPES.RepositoryRepository) repositoryRepository: RepositoryRepository,
        @inject(TYPES.ControlleresRepository) controlleresRepository: ControlleresRepository
    ) {
        this.lifeCycle = lifeCycle;
        this.repositoryRepository = repositoryRepository;
        this.controlleresRepository = controlleresRepository;
    }

    @httpPost('/new', TYPES.AuthMiddleware)
    public async createNew(@request() req: any,
                            @response() res: Response) {
        const resource = req.body.resource;
        const resourceInfo = this.isController(resource) ? <IControllerInfo>{
            controllerName: resource.controllerName,
            code: resource.code,
            status: ResourcStatus.pending
        }: <IRepositoryInfo>{
            repositoryName: resource.repositoryName,
            code: resource.code,
            status: ResourcStatus.pending
        } 
        
        let deployedResource;
        if (this.isController(resourceInfo)) 
            deployedResource = this.deployController(<IControllerInfo>resourceInfo);
        else
            deployedResource = this.deployRepository(<IRepositoryInfo>resourceInfo);

        this.lifeCycle.resetPod();

        console.log(JSON.stringify(deployedResource));
        return res.send(deployedResource);
    }

    private isController(resource: any): boolean {
        return resource.controllerName != undefined;
    }

    private async deployController(controllerInfo: IControllerInfo): Promise<IControllerInfo | null> {
        let deployedController;
        const currentController = await this.controlleresRepository.getByName(controllerInfo);

        if (currentController.length == 1)
            deployedController = await this.controlleresRepository.update(currentController[0]._id ,controllerInfo);
        else 
            deployedController = await this.controlleresRepository.create(controllerInfo);

        return deployedController;
    }

    private async deployRepository(repositoryInfo: IRepositoryInfo): Promise<IRepositoryInfo | null> {
        let deployedRepository;
        const currentRepository = await this.repositoryRepository.getByName(repositoryInfo);

        if (currentRepository.length == 1)
            deployedRepository = await this.repositoryRepository.update(currentRepository[0]._id ,repositoryInfo);
        else 
            deployedRepository = await this.repositoryRepository.create(repositoryInfo);

        return deployedRepository;
    }

}
