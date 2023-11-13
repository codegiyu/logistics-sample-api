const request = require("supertest");
const { app } = require("../index");
const { users } = require("../app/models");

const email = "eomegbu@gmail.com";

const loginReqBody = {
    userName: "PetKassy",
    password: "KassyPat123"
}

const registerReqBody = {
    email,
    phone: "07012345678",
    ...loginReqBody
}

// let cipherText;
// let otp;
let registerWasSuccessful = false;

test('for successful registration', async () => {
    expect.assertions(2);

    try {
        const response = await request(app)
            .post("/v1/auth/register")
            .set("Content-Type", "application/json")
            .send(registerReqBody);

        if (response.status === 201) {
            registerWasSuccessful = true;
        }

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User account created successfully!");   
        
    } catch (error) {
        console.log(error)
    }
})

test('for successful login', async () => {
    expect.assertions(2);

    try {
        const response = await request(app)
            .post("/v1/auth/login")
            .set("Content-Type", "application/json")
            .send(loginReqBody);

        // token = response.body.token;

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");   

    } catch (error) {
        console.log(error)
    }
})

test('for successful forgot password request', async () => {
    expect.assertions(2);

    try {    
        const response = await request(app)
            .post("/v1/auth/forgot-password")
            .set("Content-Type", "application/json")
            .send({ email });

        // cipherText = response.body.data?.cipherText;
        // otp = response.body.data?.otp;
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Email sent Successfully!");
        
    } catch (error) {
        console.log(error)
    }
})


// test('for successful reset password request', async () => {
//     expect.assertions(2);

//     try {
//         if (!cipherText || !otp) {
//             throw new Error('CipherText or OTP is not available from the forgot password test');
//         }
    
//         const response = await request(app)
//             .post("/v1/auth/reset-password")
//             .set("Content-Type", "application/json")
//             .send({ cipherText, otp, newPassword: "Password123" });
    
//         expect(response.status).toBe(200);
//         expect(response.body.message).toBe("Password changed successfully!");
        
//     } catch (error) {
//         console.log(error)
//     }
// })


afterAll(() => {
    const deleteTestRegisteredUser = async () => {
        await users.deleteOne({ userName: "PetKassy" });
    }

    const shutDown = async () => {
        if (registerWasSuccessful) {
            await deleteTestRegisteredUser();
        }
        // await mongoose.disconnect();
        // server.close();
    }

    shutDown();
})