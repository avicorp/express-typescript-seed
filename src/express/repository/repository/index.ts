import { injectable } from 'inversify';
import { RepositoryInfo, IRepositoryInfo, ResourcStatus } from '../../models/serverLess';

@injectable()
export class RepositoryRepository {

    public constructor() {}

    public async createNewRepository(repository: IRepositoryInfo): Promise<IRepositoryInfo> {
        const newRepository = await RepositoryInfo.create(repository);
        return newRepository;
    }

    public async updateRepository(id:any ,repository: IRepositoryInfo): Promise<IRepositoryInfo | null> {
        const updatedRepository = await RepositoryInfo.findByIdAndUpdate(id, 
            repository);
        return updatedRepository;
    }

    public async getRepositoryes(status :ResourcStatus, limit:number): Promise<IRepositoryInfo[]> {
        const updatedRepository = await RepositoryInfo.find({ status: status }, null, { limit: limit });
        return updatedRepository;
    }
}