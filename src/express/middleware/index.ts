import { inject, injectable } from 'inversify';
import { Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { BaseMiddleware } from 'inversify-express-utils';
import { TYPES } from '../../constants';
import { JsonWebTokenService } from '../../express/services/jwt';
import { UserRepository } from '../repository/user';
import { IUserRequest } from '../interfaces/user';

@injectable()
export class AuthMiddleware extends BaseMiddleware {

    private jwt: JsonWebTokenService;
    private userRepo: UserRepository;
    private logger: Logger;

    public constructor(
        @inject(TYPES.JsonWebTokenService) jwt: JsonWebTokenService,
        @inject(TYPES.UserRepository) userRepo: UserRepository,
        @inject(TYPES.WinstonLogger) logger: Logger,
    ) {
        super();
        this.jwt = jwt;
        this.userRepo = userRepo;
        this.logger = logger;
    }

    public async handler(req: IUserRequest, res: Response, next: NextFunction) {
        try {
            let token = <string>req.headers['authorization'];
            if (!token) {
                token = <string>req.body.jwt;
                if (!token) {
                    this.logger.info('Request without JWT.');
                    res.status(401).send('Unautorized - missing jwt.');
                    throw new Error('ERR_INVALID_JWT');
                }
            }
            const parts = token.split(' ');
            if (parts.length !== 2) {
                this.logger.info('Request JWT in wrong format.');
                res.status(401).send('Unautorized - Invalid jwt(wrong format).');
                throw new Error('ERR_INVALID_JWT');
            }
            // inspect the JWT token received from the client
            const scheme = parts[0];
            // inspect the scheme
            if (!/^Bearer$/i.test(scheme)) {
                this.logger.info('Request JWT in wrong format.');
                res.status(401).send('Unautorized - Invalid jwt(wrong format).');
                throw new Error('ERR_INVALID_JWT');
            }
            try {
                const jwtData = await this.jwt.verify(parts[1]);
                const user = await this.userRepo.findUserById(jwtData.data);
                if (user === null) {
                    this.logger.info(`Request of user ID: ${jwtData.data} didn't match.`);
                    res.status(401).send('Unautorized user.');
                    throw new Error('ERR_AUTH_FAILED');
                } else {
                    req.user = user;
                }
            } catch (err) {
                this.logger.error(err);
                res.status(401).send('Unautorized user.');
                throw new Error('ERR_AUTH_FAILED');
            }
            next();
        } catch (err) {
            next(err);
        }
    }

}