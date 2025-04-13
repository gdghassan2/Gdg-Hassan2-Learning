
interface HestiaApiData {
    [key: string]: string;
}

//Admin Credentials
const hst_hostname = 'panel.weblion.pro';
const hst_port = 443;
const hst_username = 'bilal';
// const hst_password = 'Pass+'; to bep passed from env variable during runtime
const hst_returncode = 'yes';

//Domain details
// const domain = 'student4.learning.gdghassan2.com'; //domain

//New account example details
// const username = 'student4q';
// const password = 'd3m0p4ssw0rd';
// const email = 'bilal.ftb2000@gmail.com';
// const packages = 'student';
// const first_name = 'Rust';
// const last_name = 'Cohle';

async function callApi(data_json: HestiaApiData) {
    try {
        const data = new URLSearchParams(data_json).toString();
        const response = await fetch(`https://${hst_hostname}:${hst_port}/api/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data
        });
        const responseData = await response.text();
        console.log(responseData);
    } catch (error) {
        console.error(error);
    }
}

export async function createAccount(hst_password: string, username: string, password: string, email: string, first_name: string, last_name: string) {
    const data_json = {
        'user': hst_username,
        'password': hst_password,
        'returncode': hst_returncode,
        'cmd': 'v-add-user',
        'arg1': username,
        'arg2': password,
        'arg3': email,
        'arg4': "student",
        'arg5': first_name,
        'arg6': last_name
    }
    await callApi(data_json);
}

export async function createWebsite(hst_password: string,username:string, domain: string) {
    const data_json = {
        'user': hst_username,
        'password': hst_password,
        'returncode': hst_returncode,
        'cmd': 'v-add-domain',
        'arg1': username,
        'arg2': domain
    }
    await callApi(data_json);
}

export async function addSSLWebsite(hst_password: string, username: string, domain: string) {
    const data_json = {
        'user': hst_username,
        'password': hst_password,
        'returncode': hst_returncode,
        'cmd': 'v-add-letsencrypt-domain',
        'arg1': username,
        'arg2': domain
    }
    await callApi(data_json);
}

export async function forceSSL(hst_password: string, username: string, domain: string) {
    const data_json = {
        'user': hst_username,
        'password': hst_password,
        'returncode': hst_returncode,
        'cmd': 'v-add-web-domain-ssl-force',
        'arg1': username,
        'arg2': domain
    }
    await callApi(data_json);
}

//  The script will create a new student account, a website, and add SSL to the website.
//  You can run the script using the following command:
//  node createStudentAccount.js
//  The script will output the response from the API.
//  Conclusion
//  In this tutorial, you learned how to create a student account, a website, and add SSL to the website using the Hestia API. You can use the API to automate various tasks in your Hestia control panel.
//  If you have any questions or feedback, feel free to leave a comment.
//  Bilal is a passionate content creator and digital marketing enthusiast who loves to find hacks and creative ways to produce prolific outcomes in strategizing content. Bilal is also an avid reader who loves to read mysteries in his free time.
