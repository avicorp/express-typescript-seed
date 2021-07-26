import { Response } from 'express';
import { inject } from 'inversify';
import { controller, httpGet, response } from 'inversify-express-utils';
import { LifeCycle } from '../../services/lifeCycle';
import { PodStatus } from '../../models/serverLess';
import { TYPES } from '../../../constants';

@controller('/api/v1/health')
export class HealthCheckController {
    private lifeCycle: LifeCycle;

    public constructor(
        @inject(TYPES.LifeCycle) lifeCycle: LifeCycle,
    ) {
        this.lifeCycle = lifeCycle;
    }

    @httpGet('/')
    public async getHealth(@response() res: Response) {
        const status = await this.lifeCycle.podStatus();
        if (status) {
            if (status.valueOf() == PodStatus.online)
                return res.send({'Status': 'OnLine'})
            if (status.valueOf() == PodStatus.init)
                return res.status(503).send({'Status': 'Init'})
        }
        return res.status(503).send({'Status': 'OffLine'});
    }

}
