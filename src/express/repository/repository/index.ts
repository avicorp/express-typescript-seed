import { injectable } from 'inversify';
import { RepositoryInfo, IRepositoryInfo, ResourcStatus } from '../../models/serverLess';

@injectable()
export class RepositoryRepository {

    public constructor() {}

    public async create(repository: IRepositoryInfo): Promise<IRepositoryInfo> {
        const newRepository = await RepositoryInfo.create(repository);
        return newRepository;
    }

    public async update(id:any ,repository: IRepositoryInfo): Promise<IRepositoryInfo | null> {
        const updatedRepository = await RepositoryInfo.findByIdAndUpdate(id, 
            repository);
        return updatedRepository;
    }

    public async getByName(repository: IRepositoryInfo): Promise<IRepositoryInfo[]> {
        const repositoryExist = await RepositoryInfo.find({ repositoryName: repository.repositoryName })
        return repositoryExist;
    }

    public async getRepositoryes(status :ResourcStatus[], limit:number): Promise<IRepositoryInfo[]> {
        const updatedRepository = await RepositoryInfo.find({ $or:[ {status: status[0]}, {status: status[1]} ]}, null, { limit: limit });
        return updatedRepository;
    }
}