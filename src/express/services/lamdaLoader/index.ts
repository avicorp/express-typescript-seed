import { inject, injectable, Container, METADATA_KEY as inversify_METADATA_KEY } from 'inversify';
import { Logger } from 'winston';
import { set, connect, connection, Connection } from 'mongoose';
import { IControllerInfo, IRepositoryInfo, ResourcStatus } from '../../models/serverLess';
import { ControlleresRepository } from '../../repository/controller';
import { RepositoryRepository } from '../../repository/repository';
import { TYPES } from '../../../constants';
import { YamlConfig } from '../yaml';

@injectable()
export class LamdaLoaderService {

    private controller: ControlleresRepository;
    private repository: RepositoryRepository;
    private logger: Logger;
    private loaderMap: Map<string, object>;

    public constructor(
        @inject(TYPES.ControlleresRepository) controller: ControlleresRepository,
        @inject(TYPES.RepositoryRepository) repository: RepositoryRepository,
        @inject(TYPES.WinstonLogger) logger: Logger,
    ) {
        this.controller = controller;
        this.repository = repository;
        this.logger = logger;
        this.loaderMap = new Map<string, object>();
    }

    private require(path:string) {
        const resourceName = path.split("/").pop();
        const lodedResource = this.loaderMap.get(<string>resourceName);
        if(lodedResource) 
            return lodedResource;
        return require(path);
    }

    public async loadControllers() {
        const list =  await this.controller.getControlleres([ResourcStatus.online, ResourcStatus.pending], 10)
        
        list.forEach(controller => {
            const name = controller.controllerName;
            this.logger.info(`Load controller from DB: ${name}`);
            const code = controller.code;
            const controllerF = Function("exports", "require", code);
            this.loaderMap.set(name, { });
            const result = controllerF(
                this.loaderMap.get(name),this.require.bind(this));
        });
    }

    public async loadRepositories(container:Container) {
        const list =  await this.repository.getRepositoryes([ResourcStatus.online, ResourcStatus.pending], 10)

        list.forEach(repository => {
            const name = repository.repositoryName;
            this.logger.info(`Load repository from DB: ${name}`);
            const code = repository.code;
            const repositorF = Function("exports", "require", code);
            let scope:object = {}
            this.loaderMap.set(name, scope);
            const result = repositorF(
                this.loaderMap.get(name),this.require.bind(this));
            
            this.injectClassBinding(scope, container);
        });
    }

    private injectClassBinding(object: Object, container:Container) {
        Object.entries(object).forEach( value => {
            const key = value[0];
            const def = value[1];
            const objIsInjectable = Reflect.hasOwnMetadata(inversify_METADATA_KEY.PARAM_TYPES, def);
            if (objIsInjectable) {
                TYPES[key] = Symbol(key);
                // @ts-ignore: Unreachable code error
                container.bind<bindClass>(TYPES[key]).to(def).inSingletonScope();
                this.logger.info(`Bind ${key} from DB`);
            }
        });
    }
}