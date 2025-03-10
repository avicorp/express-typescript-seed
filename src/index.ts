import 'reflect-metadata';
import morgan from 'morgan';
import passport from 'passport';
import cors from 'cors';
import * as express from 'express';
import { createLogger, format, transports, Logger, LoggerOptions } from 'winston';
import { Application, Request, Response, NextFunction } from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import * as bodyParser from 'body-parser';
// import the middleware
import { AuthMiddleware } from './express/middleware';
// import the DAO class
import { UserRepository } from './express/repository/user';
import { ErrorDescriptionRepository } from './express/repository/error';
import { PodRepository } from './express/repository/pod';
import { ControlleresRepository } from './express/repository/controller';
import { RepositoryRepository } from './express/repository/repository';
// import other services
import { Config, YamlConfig } from './express/services/yaml';
import { DateTimeService } from './express/services/datetime';
import { ErrorHandlerService } from './express/services/error';
import { GoogleMapService } from './express/services/googlemap';
import { JsonWebTokenService } from './express/services/jwt';
import { PassportService } from './express/services/passport';
import { MailerService } from './express/services/mailer';
import { MongoDbService } from './express/services/mongodb';
import { TYPES } from './constants';
import { LifeCycle } from './express/services/lifeCycle';
import { LamdaLoaderService } from './express/services/lamdaLoader';
// import the controller
import './express/controllers/user';
import './express/controllers/auth';
import './express/controllers/health';
import './express/controllers/error';
import './express/controllers/resources';
import { Format } from 'logform';

// configure the winston logger
const fmt: Format = format.printf((info) => {
    return `[${info.timestamp} ${info.level}]: ${info.message}`;
});

const logger: Logger = createLogger(<LoggerOptions>{
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        fmt,
    ),
    transports: [
        new transports.Console({ level: 'debug' }),
        // new transports.File({ filename: 'sample-app.log' }),
    ],
});

(async () => {
    // load everthing needed to the container
    const container = new Container();

    // bind the config reader
    const yml: Config = new Config('app.config.yml');
    const config: YamlConfig = await yml.getConfig();

    // bind the Yaml configuration and other constant value
    container.bind<Logger>(TYPES.WinstonLogger).toConstantValue(logger);
    container.bind<YamlConfig>(TYPES.Config).toConstantValue(config);

    // bind the DAO class
    container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
    container.bind<ErrorDescriptionRepository>(TYPES.ErrorDescriptionRepository).to(ErrorDescriptionRepository).inSingletonScope();
    container.bind<PodRepository>(TYPES.PodRepository).to(PodRepository).inSingletonScope();
    container.bind<ControlleresRepository>(TYPES.ControlleresRepository).to(ControlleresRepository).inSingletonScope();
    container.bind<RepositoryRepository>(TYPES.RepositoryRepository).to(RepositoryRepository).inSingletonScope();
    // bind other services
    // container.bind<DateTimeService>(TYPES.DateTimeService).to(DateTimeService).inSingletonScope();
    container.bind<ErrorHandlerService>(TYPES.ErrorHandlerService).to(ErrorHandlerService).inSingletonScope();
    // container.bind<GoogleMapService>(TYPES.GoogleMapService).to(GoogleMapService).inSingletonScope();
    container.bind<JsonWebTokenService>(TYPES.JsonWebTokenService).to(JsonWebTokenService).inSingletonScope();
    // container.bind<MailerService>(TYPES.MailerService).to(MailerService).inSingletonScope();
    container.bind<MongoDbService>(TYPES.MongoDbService).to(MongoDbService).inSingletonScope();
    container.bind<PassportService>(TYPES.PassportService).to(PassportService).inSingletonScope();
    container.bind<LifeCycle>(TYPES.LifeCycle).to(LifeCycle).inSingletonScope();
    container.bind<LamdaLoaderService>(TYPES.LamdaLoaderService).to(LamdaLoaderService).inSingletonScope();
    // configure mongodb and connect to it
    const mongodb = container.get<MongoDbService>(TYPES.MongoDbService);
    await mongodb.connectDb()
    // configure PassportJS config and start the create user loop
    const passportConfig = container.get<PassportService>(TYPES.PassportService);
    passportConfig.init()

    // configure pod life cycle 
    const lifeCycle = container.get<LifeCycle>(TYPES.LifeCycle);
    await lifeCycle.initPod()

    // load resources 
    const lamdaLoaderService = container.get<LamdaLoaderService>(TYPES.LamdaLoaderService);
    
    await lamdaLoaderService.loadRepositories(container);
    await lamdaLoaderService.loadControllers();

    // bind the express middleware
    container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);

    // start the express server
    const server = new InversifyExpressServer(container);
    server.setConfig((app: Application) => {
        // set cors
        if (process.env.NODE_ENV == 'development') {
            app.use(cors());
        }
        // set up swagger
        app.use('/api-docs/swagger/', express.static(__dirname + '/static/swagger'));
        app.use('/api-docs/swagger/assets', express.static(process.cwd() + '/node_modules/swagger-ui-dist'));
        // set the body parser
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());
        // set passportjs
        app.use(passport.initialize());
        app.use(passport.session());
        // set the logger
        app.use(morgan('dev')); 
    });

    // error handler
    server.setErrorConfig((app: Application) => {
        app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
            logger.error(err);
            const handler = container.get<ErrorHandlerService>(TYPES.ErrorHandlerService);
            const response = await handler.getErrorResponse(err);
            res
                .status(response.status)
                .send(response.body);
        });
    });

    // build the server instance
    const instance = server.build();
    instance.listen(config.server_port);
    lifeCycle.onlinePod();
    // log to the console to indicate the server has been started
    logger.info(`Server is listening on port ${config.server_port}`);
})();

// listen to all the unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
    if (!reason) {
        logger.crit('No reason for the failure, please investigate all the potential possibilities that is causing the error');
    } else {
        logger.error(reason);
    }
});
