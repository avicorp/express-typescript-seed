import passport from 'passport';
import { inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete, request, response, next, requestBody, requestParam } from 'inversify-express-utils';
import { IUser } from '../../models/user';
import { UserRepository } from '../../repository/user';
import { TYPES } from '../../../constants';
import { Logger } from 'winston';


@controller('/api/v1/user')
export class UserController {

    private userRepo: UserRepository;
    private logger: Logger;
    // private userReccuest:IUserRequest;

    public constructor(
        @inject(TYPES.UserRepository) userRepo: UserRepository,
        @inject(TYPES.WinstonLogger) logger: Logger,
    ) {
        this.userRepo = userRepo;
        this.logger = logger;
    }

    @httpPost('/delete', TYPES.AuthMiddleware)
    public async deleteError(
        @request() req: Request,
        @response() res: Response): Promise<Response>
    {
        const error =  await this.userRepo.deleteUser(req.body.email);
        return res.send(error);
    }
}