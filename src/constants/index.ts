export var TYPES:any = {
    AuthMiddleware: Symbol('AuthMiddleware'),
    Config: Symbol('Config'),
    DateTimeService: Symbol('DateTimeService'),
    ErrorHandlerService: Symbol('ErrorHandlerService'),
    JsonWebTokenService: Symbol('JsonWebTokenService'),
    GoogleMapService: Symbol('GoogleMapService'),
    MailerService: Symbol('MailerService'),
    MongoDbService: Symbol('MongoDbService'),
    PassportService: Symbol('PassportService'),
    LamdaLoaderService: Symbol('LamdaLoaderService'),
    LifeCycle: Symbol('LifeCycle'),
    // DAO injection
    UserRepository: Symbol('UserRepository'),
    ErrorDescriptionRepository: Symbol('ErrorDescriptionRepository'),
    PodRepository: Symbol('PodRepository'),
    ControllerRepository: Symbol('ControllerRepository'),
    RepositoryRepository: Symbol('RepositoryRepository'),
    // Logger
    WinstonLogger: Symbol('WinstonLogger'),
};
