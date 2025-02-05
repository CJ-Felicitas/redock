require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 1234;


app.use(bodyParser.json());

// check if vm responds
app.get('/health', (req, res) => {
    console.log("Health Test Passed");
    res.status(200).json({ status: 'UP' });
});

const executeDeployment = (scriptPath, tag, containerName, dockerUser, dockerPassword, res) => {
    console.log(`Deploying ${containerName} with tag: ${tag}`);

    exec(`${scriptPath} ${tag} ${containerName} ${dockerUser} ${dockerPassword}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ status: "Error", message: "Deployment Failed" });
        }

        console.log(`stdout: ${stdout}`);
        res.status(200).json({ status: "OK", message: `${containerName} Deployment Successful` });
    });
};

// TODO: add loggers for webhooks
// app.post('/dockerhub/webhooks', (req, res) => {
//     console.log(req.body);
//     res.status(200).json({ status: "OK" });
// });


app.post('/deploy/opulenz-frontend', (req, res) => {
    const { tag } = req.body;
    if (process.env.X_API_KEY != req.body.apiKey) {
        return res.status(401).json({status: "Error", message: "Invalid X-API-KEY"} )
    }

    if (!tag) {
        return res.status(400).json({ status: "Error", message: "Tag is required" });
    }

    const scriptPath = './deploy.sh';
    const containerName = 'opulenz-frontend';
    const dockerUser = process.env.DOCKER_USER;
    const dockerPassword = process.env.DOCKER_PASSWORD;

    // start deployment
    executeDeployment(scriptPath, tag, containerName, dockerUser, dockerPassword, res);
});

app.post('/deploy/opulenz-mailinator', (req, res) => {
    const { tag } = req.body;
    if (process.env.X_API_KEY != req.body.apiKey) {
        return res.status(401).json({status: "Error", message: "Invalid X-API-KEY"} )
    }

    if (!tag) {
        return res.status(400).json({ status: "Error", message: "Tag is required" });
    }

    const scriptPath = './deploy.sh';
    const containerName = 'opulenz-mailinator';
    const dockerUser = process.env.DOCKER_USER;
    const dockerPassword = process.env.DOCKER_PASSWORD;

    // start deployment
    executeDeployment(scriptPath, tag, containerName, dockerUser, dockerPassword, res);
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});