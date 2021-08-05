import { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

const port = 8080;
const config = <AxiosRequestConfig>{
    baseURL: `http://localhost:${port}`
};

interface UserResponse {
    user: UserObj,
    jwt: String
}

interface UserObj {
    email: string,
    fullName: string,
    id: string
}

enum MessageType {
    warning = "warning",
    info = "info",
    disable = "disable"
}

interface Userobj{
    name: string,
    id: string
}

interface EntityMessageObj {
    _id?: string,
    entityId: string,
    user: Userobj,
    lastModifiedDate?: Date,
    fieldName: string,
    message: string,
    status: MessageType
}

async function insertUsers(): Promise<AxiosResponse<UserResponse>[]> {
    const responses = [];
    for (let i = 0; i < 2; i++) {
        const newUser = {
            email: `testuser${i}@example.com`,
            password: '1234',
            fullName: `testuser${i}`,
            username: `test${i}`,
            facebookId: `test${i}`,
        };

        const response = axios.post<UserResponse>('/api/v1/auth/signup', newUser, config);
        responses.push(response);
    }
    const result = Promise.all(responses);
    return result;
}

async function loginUsers(): Promise<AxiosResponse<UserResponse>[]> {
    const responses = [];
    for (let i = 0; i < 2;  i++) {
        let deleteUser = {
            email: `testuser${i}@example.com`,
            password: '1234'
        };
        const responseLogin = axios.post<UserResponse>('/api/v1/auth/login', deleteUser, config);
        responses.push(responseLogin);
    }

    const result = Promise.all(responses);
    return result;
}

async function deleteUsers(jwts :UserResponse[]): Promise<AxiosResponse<UserResponse>[]> {
    const responses = [];
    for (let i = 0; i < 2 ; i++) {
        let deleteUser = {
            email: `testuser${i}@example.com`,
            password: '1234',
            jwt: `Bearer ${jwts[i].jwt}`
        };
        const response = axios.post<UserResponse>('/api/v1/user/delete', deleteUser,  config);
        responses.push(response);
    }
    const result = Promise.all(responses);
    return result;
}

async function createNewEntityMessage(jwts? :UserResponse[]): Promise<AxiosResponse<EntityMessageObj>[]> {
    const responses = [];
    for (let i = 0; i < 2 ; i++) {
        const userObj:  Userobj = {
            name: `test${i}`,
            id: `4324531${i}`
        }
        const entityMessage:EntityMessageObj = {
            entityId: `testuser${i}`,
            user: userObj,
            fieldName: "name",
            message: "info message",
            status: MessageType.info
        };
        const response = axios.post<EntityMessageObj>('/api/v1/entityMessage/new', entityMessage,  config);
        responses.push(response);
    }
    const result = Promise.all(responses);
    return result;
}

test('Entity message controller', async () => {
    console.log("create two new info messages.");
    try {
        const responses = await createNewEntityMessage();
        const message = responses.map((elem) => { return elem.data });
        expect(message).toHaveLength(2);
        expect(message[0].message).toMatch("info message");
        expect(message[1].message).toMatch("info message");
    } catch (err) {
        console.log(err);
    }
  })
