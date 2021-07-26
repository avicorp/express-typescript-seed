import { Schema, Model, model, Document } from "mongoose";

export enum PodStatus {
    init = 0,
    online = 1,
    reset = 2
}

export enum ResourcStatus {
    pending = 0,
    disable = 1,
    online = 2
}

export interface IPod extends Document {
    status: PodStatus
    startDate: Date
    lastModifiedDate: Date
}

export interface IControllerInfo extends Document {
    controllerName: string,
    code: string,
    creationTime: Date,
    status: ResourcStatus
}

export interface IRepositoryInfo extends Document {
    repositoryName: string,
    code: string,
    creationTime: Date,
    status: ResourcStatus
}

const podSchema: Schema = new Schema({
    status: { type: String, trim: true },
    lastModifiedDate: {
        type: Date,
        expires: 10
    },
    startDate: {
        type: Date,
        default: Date.now
    }
});

const controllerSchema: Schema = new Schema({
    controllerName: { type: String, trim: true },
    code: { type: String, trim: true },
    creationTime: { type: Date, default: Date.now },
    status: { type: String }
});

const repositorySchema: Schema = new Schema({
    repositoryName: { type: String, trim: true },
    code: { type: String, trim: true },
    creationTime: { type: Date, default: Date.now },
    status: { type: String }
});

const Pod: Model<IPod> = model('Pod', podSchema);
const ControllerInfo: Model<IControllerInfo> = model('ControllerInfo', controllerSchema);
const RepositoryInfo: Model<IRepositoryInfo> = model('RepositoryInfo', repositorySchema);

export { Pod, ControllerInfo, RepositoryInfo };
