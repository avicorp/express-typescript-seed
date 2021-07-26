import { inject, injectable, Container } from 'inversify';
import { Logger } from 'winston';
import { set, connect, connection, Connection } from 'mongoose';
import { IControllerInfo, IRepositoryInfo, ResourcStatus } from '../../models/serverLess';
import { ControllerRepository } from '../../repository/controller';
import { RepositoryRepository } from '../../repository/repository';
import { TYPES } from '../../../constants';
import { YamlConfig } from '../yaml';

@injectable()
export class LamdaLoaderService {

    private controller: ControllerRepository;
    private repository: RepositoryRepository;
    private logger: Logger;
    private loaderMap: Map<string, object>;

    public constructor(
        @inject(TYPES.ControllerRepository) controller: ControllerRepository,
        @inject(TYPES.RepositoryRepository) repository: RepositoryRepository,
        @inject(TYPES.WinstonLogger) logger: Logger,
    ) {
        this.controller = controller;
        this.repository = repository;
        this.logger = logger;
        this.loaderMap = new Map<string, object>();
    }

    private require(path:string) {
        const lodedResource = this.loaderMap.get(path);
        if(lodedResource) 
            return lodedResource;
        return require(path);
    }

    public async loadControllers() {
        const list =  await this.controller.getControlleres(ResourcStatus.online, 10)
        
        list.forEach(controller => {
            const name = controller.controllerName;
            this.logger.info(`Load controller from DB: ${name}`);
            const code = controller.code;
            const controllerF = Function("exports", "require", "container", code);
            this.loaderMap.set("./" + name, { });
            const result = controllerF(
                this.loaderMap.get("./" + name),this.require.bind(this));
        });
    }

    public async loadRepositories(container:Container) {
        const list =  await this.repository.getRepositoryes(ResourcStatus.online, 10)

        list.forEach(repository => {
            const name = repository.repositoryName;
            this.logger.info(`Load repository from DB: ${name}`);
            const code = repository.code;
            const repositorF = Function("exports", "require", "container", code);
            let scope:object = {}
            this.loaderMap.set("./" + name, scope);
            const result = repositorF(
                this.loaderMap.get("./" + name),this.require.bind(this));
            
            TYPES[name] = Symbol(name);

            // @ts-ignore: Unreachable code error
            const bindClass = scope[name];
            // @ts-ignore: Unreachable code error
            container.bind<bindClass>(TYPES[name]).to(bindClass).inSingletonScope();
        });
    }
}