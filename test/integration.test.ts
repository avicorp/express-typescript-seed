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

async function insertUsers(): Promise<AxiosResponse<UserResponse>[]> {
    const responses = [];
    for (let i = 0; i < 5; i++) {
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
    for (let i = 0; i < 5;  i++) {
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
    for (let i = 0; i < 5 ; i++) {
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

(async () => {
    try {
        console.log("Start testing inserting 5 users");
        const responses = await insertUsers();
        const users = responses.map((elem) => { return elem.data });
        console.log("Start testing login 5 users");
        const responsesL = await loginUsers();
        const usersJWT= responsesL.map((elem) => { return elem.data });
        console.log("Start testing deleting 5 users");
        const responsesD = await deleteUsers(usersJWT);
        const usersD = responsesD.map((elem) => { return elem.data });
    } catch (err) {
        console.error(err);
    }
    try {
        console.log("Start testing login 5 users");
        const responsesL = await loginUsers();
        const usersJWT= responsesL.map((elem) => { return elem.data });
    } catch (err) {
        console.error(err);
    }
    try {
        console.log("Start testing inserting 5 users");
        const responses = await insertUsers();
        const users = responses.map((elem) => { return elem.data });
        console.log("Start testing login 5 users");
        const responsesL = await loginUsers();
        const usersJWT= responsesL.map((elem) => { return elem.data });
        console.log("Start testing deleting 5 users");
        const responsesD = await deleteUsers(usersJWT);
        const usersD = responsesD.map((elem) => { return elem.data });
        console.log("Start testing deleting 5 users");
        const responsesDFail = await deleteUsers(usersJWT);
        const usersDFail = responsesDFail.map((elem) => { return elem.data });
    } catch (err) {
        console.error(err);
    }
})();