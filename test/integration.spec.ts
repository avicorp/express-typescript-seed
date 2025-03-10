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

async function insertUser(newUser: Object): Promise<AxiosResponse<UserResponse>> {
    const response = axios.post<UserResponse>('/api/v1/auth/signup', newUser, config);
    return response;
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

        const response = insertUser(newUser);
        responses.push(response);
    }
    const result = Promise.all(responses);
    return result;
}

async function newSystemUser() {
    const newUser = {
        email: `system@mongoless.com`,
        password: 'activeONE!',
        fullName: `system`,
        username: `system`
    };
    insertUser(newUser);
}

newSystemUser();

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

async function testVM(): Promise<AxiosResponse<UserResponse>> {
    const response = axios.post<UserResponse>('/api/v1/system/run', {},  config);
    const result = Promise.resolve(response);
    return result
}

async function testHealthController(): Promise<AxiosResponse<UserResponse>> {
    const response = axios.get<any>('/api/v1/health/', config);
    const result = Promise.resolve(response);
    return result
}

test('health Of pod.', async () => {
    const responsesHealth = await testHealthController();
    expect(responsesHealth.data).toMatchObject({ Status: "OnLine" });
})

test('2 user signin, login and delete.', async () => {
    console.log("Start testing inserting 2 users");
    const responses = await insertUsers();
    const users = responses.map((elem) => { return elem.data });
    console.log("Start testing login 2 users");
    const responsesL = await loginUsers();
    const usersJWT= responsesL.map((elem) => { return elem.data });
    console.log("Start testing deleting 2 users");
    const responsesD = await deleteUsers(usersJWT);
    const usersD = responsesD.map((elem) => { return elem.data });
    expect(usersD).toHaveLength(2);
  })

test('2 user fail login.', async () => {
    console.log("Start testing login 2 users");
    try {
        await loginUsers();
    } catch (err) {
        expect(err.response.status).toBe(500);
    }
  })

test('2 user delete with old JWT.', async () => {
    console.log("Start testing inserting 2 users");
    const responses = await insertUsers();
    const users = responses.map((elem) => { return elem.data });
    console.log("Start testing login 2 users");
    const responsesL = await loginUsers();
    const usersJWT= responsesL.map((elem) => { return elem.data });
    console.log("Start testing deleting 2 users");
    const responsesD = await deleteUsers(usersJWT);
    const usersD = responsesD.map((elem) => { return elem.data });
    console.log("Start testing deleting 2 users");
    try {
        await deleteUsers(usersJWT);
    } catch (err) {
        expect(err.response.status).toBe(401);
    }
  })