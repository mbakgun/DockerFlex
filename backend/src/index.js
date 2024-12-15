const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const multer = require('multer');
const fs = require('fs');
const fsPromises = fs.promises;
require('path');
const archiver = require('archiver');
require('tar-stream').extract;
require('tar');
require('os');

const app = express();
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const upload = multer({dest: 'uploads/'});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json());

const authMiddleware = (req, res, next) => {
    const masterPassword = process.env.MASTER_PASSWORD;
    
    if (!masterPassword) {
        return next();
    }

    if (req.path === '/api/auth') {
        return next();
    }

    const authHeader = req.headers['x-dockerflex-auth'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (authHeader !== masterPassword) {
        return res.status(401).json({ error: 'Invalid authentication' });
    }

    next();
};

app.post('/api/auth', (req, res) => {
    const masterPassword = process.env.MASTER_PASSWORD;
    const { password } = req.body;

    if (!masterPassword) {
        return res.json({ authenticated: true });
    }

    if (password === masterPassword) {
        res.set('X-DockerFlex-Auth', masterPassword);
        return res.json({ authenticated: true });
    }

    res.status(401).json({ error: 'Invalid password' });
});

app.use('/api', authMiddleware);

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
};

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

const execCommand = async (container, command, options = {}) => {
    try {
        const sudoExec = await container.exec({
            Cmd: ['sh', '-c', `command -v sudo && sudo ${command} || ${command}`],
            AttachStdout: true,
            AttachStderr: true,
            ...options
        });
        return sudoExec;
    } catch (error) {
        console.warn(`Failed to execute with sudo: ${error.message}`);
        return container.exec({
            Cmd: ['sh', '-c', command],
            AttachStdout: true,
            AttachStderr: true,
            ...options
        });
    }
};

app.get('/api/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({all: true});
        res.json(containers);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/api/containers/:id/files', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const path = req.query.path || '/';

        try {
            const containerInfo = await container.inspect();
            if (containerInfo.State.Status !== 'running') {
                return res.status(503).json({
                    error: 'Container is not running',
                    details: 'Container must be running to access files'
                });
            }
        } catch (error) {
            if (error.statusCode === 404) {
                return res.status(404).json({
                    error: 'Container not found',
                    details: 'The container no longer exists'
                });
            }
            throw error;
        }

        const exec = await container.exec({
            Cmd: ['ls', '-laQ', path],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start();
        let fileList = '';
        let errorOutput = '';

        stream.on('data', (chunk) => {
            fileList += chunk.toString();
        });

        stream.on('error', (error) => {
            errorOutput += error.toString();
        });

        stream.on('end', () => {
            if (errorOutput) {
                return res.status(500).json({error: errorOutput});
            }

            try {
                const files = fileList
                    .split('\n')
                    .filter(line => line.trim())
                    .slice(1)
                    .map(line => {
                        try {
                            const parts = line.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
                            if (!parts || parts.length < 9) {
                                console.warn('Invalid line format:', line);
                                return null;
                            }

                            const permissions = parts[0] || '-';
                            const size = parts[4] || '0';
                            const name = parts[8] ? parts[8].replace(/^"(.*)"$/, '$1') : '';

                            if (!name) {
                                console.warn('Empty filename:', line);
                                return null;
                            }

                            return {
                                permissions,
                                size,
                                name,
                                type: permissions.startsWith('d') ? 'directory' : 'file'
                            };
                        } catch (err) {
                            console.warn('Error parsing line:', line, err);
                            return null;
                        }
                    })
                    .filter(file => file && !['..', '.'].includes(file.name));

                res.json(files);
            } catch (err) {
                console.error('Error processing file list:', err);
                res.status(500).json({
                    error: 'Error processing file list',
                    details: err.message
                });
            }
        });
    } catch (error) {
        console.error('Container error:', error);
        res.status(error.statusCode || 500).json({
            error: error.reason || 'Container error',
            details: error.message
        });
    }
});

app.get('/api/containers/:id/files/content', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {path} = req.query;
        const decodedPath = decodeURIComponent(path);

        const exec = await container.exec({
            Cmd: ['cat', decodedPath],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start();
        let fileContent = '';
        let errorContent = '';

        stream.on('data', (chunk) => {
            const buffer = Buffer.from(chunk);
            if (buffer[0] === 2) {
                errorContent += buffer.slice(8).toString();
            } else {
                fileContent += buffer.slice(buffer[0] === 1 ? 8 : 0).toString();
            }
        });

        stream.on('end', () => {
            if (errorContent) {
                res.status(500).json({ error: errorContent });
            } else {
                res.send(fileContent);
            }
        });

        stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({error: error.message});
            }
        });

    } catch (error) {
        console.error('Error reading file:', error);
        res.status(500).json({error: error.message});
    }
});

const executeWithFallback = async (container, commands, options = {}) => {
    const methods = [
        async () => {
            const exec = await container.exec({
                Cmd: Array.isArray(commands) ? commands : ['sh', '-c', commands],
                AttachStdout: true,
                AttachStderr: true,
                ...options
            });
            return exec.start();
        },
        async () => {
            const exec = await container.exec({
                Cmd: ['sh', '-c', `command -v sudo && sudo ${Array.isArray(commands) ? commands.join(' ') : commands} || exit 1`],
                AttachStdout: true,
                AttachStderr: true,
                ...options
            });
            return exec.start();
        },
        async () => {
            const cmd = Array.isArray(commands) ? commands.join(' ') : commands;
            const exec = await container.exec({
                Cmd: ['sh', '-c', `chown $(id -u):$(id -g) "$(dirname "${cmd.split(' ').pop()}")" && ${cmd}`],
                AttachStdout: true,
                AttachStderr: true,
                ...options
            });
            return exec.start();
        }
    ];

    let lastError = null;
    for (const method of methods) {
        try {
            return await method();
        } catch (error) {
            lastError = error;
            continue;
        }
    }
    throw new Error(`Operation failed: ${lastError?.message || 'Permission denied'}. Location might be read-only or restricted.`);
};

app.put('/api/containers/:id/files', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const { path, content, restart } = req.body;

        const tempDir = `/tmp/edit-${Date.now()}`;
        const tempFile = `${tempDir}/${path.split('/').pop()}`;
        const tempTar = `${tempDir}/content.tar`;

        try {
            await fsPromises.mkdir(tempDir, { recursive: true, mode: 0o777 });
            await fsPromises.writeFile(tempFile, content, { mode: 0o666 });

            const output = require('fs').createWriteStream(tempTar);
            const archive = archiver('tar');
            archive.pipe(output);
            archive.file(tempFile, { name: path.split('/').pop() });
            await archive.finalize();
            await new Promise(resolve => output.on('close', resolve));

            const tarBuffer = await fsPromises.readFile(tempTar);

            const targetDir = path.substring(0, path.lastIndexOf('/'));
            await executeCommandWithPrivileges(container, `mkdir -p "${targetDir}"`);
            await executeCommandWithPrivileges(container, `chmod 777 "${targetDir}"`);

            await container.putArchive(tarBuffer, {
                path: targetDir,
                noOverwriteDirNonDir: true
            });

            await executeCommandWithPrivileges(container, `chmod 666 "${path}"`);

            const exec = await container.exec({
                Cmd: ['stat', '-f', '%z', path],
                AttachStdout: true,
                AttachStderr: true,
            });

            const stream = await exec.start();
            let size = '';
            
            await new Promise((resolve, reject) => {
                stream.on('data', chunk => {
                    size += chunk.toString();
                });
                stream.on('end', resolve);
                stream.on('error', reject);
            });

            if (restart) {
                try {
                    await container.restart();
                } catch (restartError) {
                    console.error('Error restarting container:', restartError);
                }
            }

            res.json({ 
                message: 'File saved successfully',
                size: parseInt(size.trim()),
                restarted: restart 
            });

        } finally {
            try {
                await fsPromises.rm(tempDir, { recursive: true, force: true });
            } catch (err) {
                console.error('Error cleaning up temp files:', err);
            }
        }
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ 
            error: 'Failed to save file',
            details: error.message 
        });
    }
});

const executeCommandWithPrivileges = async (container, command, options = {}) => {
    const privilegedExec = await container.exec({
        Cmd: ['sh', '-c', `
            if command -v sudo >/dev/null 2>&1; then
                sudo sh -c '${command.replace(/'/g, "'\\''")}' 2>&1
            else
                sh -c '${command.replace(/'/g, "'\\''")}' 2>&1
            fi
        `],
        AttachStdout: true,
        AttachStderr: true,
        Privileged: true,
        User: 'root',
        ...options
    });

    const stream = await privilegedExec.start();
    let output = '';
    
    await new Promise((resolve, reject) => {
        stream.on('data', chunk => output += chunk.toString());
        stream.on('end', () => {
            if (output.includes('Permission denied')) {
                reject(new Error(`Permission denied: ${output}`));
            } else {
                resolve(output);
            }
        });
        stream.on('error', reject);
    });
    
    return output;
};

app.put('/api/containers/:id/files/rename', async (req, res) => {
    try {
        const container = docker.getContainer(id);
        const {oldPath, newPath} = req.body;

        const parentDir = newPath.substring(0, newPath.lastIndexOf('/'));
        const verifyCmd = `
            if [ -d "${parentDir}" ]; then
                chmod -R 777 "${parentDir}" 2>/dev/null || true
                chmod -R 777 "${oldPath}" 2>/dev/null || true
                echo "SUCCESS: Permissions set"
            else
                echo "FAILED: Parent directory does not exist"
                exit 1
            fi
        `;

        const verifyExec = await execCommand(container, verifyCmd, {
            Privileged: true,
            User: 'root'
        });

        const verifyStream = await verifyExec.start();
        let verifyOutput = '';
        
        await new Promise((resolve, reject) => {
            verifyStream.on('data', chunk => {
                const buffer = Buffer.from(chunk);
                verifyOutput += buffer.slice(buffer[0] === 1 ? 8 : 0).toString();
            });
            verifyStream.on('end', resolve);
            verifyStream.on('error', reject);
        });

        if (!verifyOutput.includes('SUCCESS')) {
            throw new Error(`Verification failed: ${verifyOutput}`);
        }

        const moveCmd = `mv "${oldPath}" "${newPath}" 2>/dev/null && chmod -R 777 "${newPath}" 2>/dev/null && echo "SUCCESS: Rename completed"`;

        const moveExec = await execCommand(container, moveCmd, {
            Privileged: true,
            User: 'root'
        });

        const moveStream = await moveExec.start();
        let moveOutput = '';
        
        await new Promise((resolve, reject) => {
            moveStream.on('data', chunk => {
                const buffer = Buffer.from(chunk);
                moveOutput += buffer.slice(buffer[0] === 1 ? 8 : 0).toString();
            });
            moveStream.on('end', resolve);
            moveStream.on('error', reject);
        });

        if (!moveOutput.includes('SUCCESS')) {
            throw new Error('Rename operation failed');
        }

        res.json({
            message: 'File renamed successfully',
            oldPath,
            newPath
        });
    } catch (error) {
        console.error('Error renaming:', error);
        res.status(403).json({
            error: 'Failed to rename',
            details: error.message || 'Unable to rename. The location might be read-only or system protected.'
        });
    }
});

app.post('/api/containers/:id/create-folder', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {path} = req.body;

        if (!path) {
            return res.status(400).json({
                error: 'Path is required',
                details: 'Please provide a valid path for the folder'
            });
        }

        await executeCommandWithPrivileges(container, `
            parent_dir="$(dirname "${path}")" &&
            mkdir -p "$parent_dir" &&
            chmod 777 "$parent_dir" &&
            mkdir -p "${path}" &&
            chmod 777 "${path}" &&
            chown -R root:root "${path}"
        `);

        const verifyOutput = await executeCommandWithPrivileges(container, `test -d "${path}" && echo "SUCCESS"`);
        
        if (!verifyOutput.includes('SUCCESS')) {
            throw new Error('Directory creation could not be verified');
        }

        res.json({
            message: 'Folder created successfully',
            path: path
        });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(403).json({
            error: 'Failed to create folder',
            details: 'Unable to create folder. The location might be read-only or system protected.'
        });
    }
});

app.delete('/api/containers/:id/files', async (req, res) => {
    try {
        const {id} = req.params;
        const {path, isDirectory} = req.body;
        const container = docker.getContainer(id);

        await executeCommandWithPrivileges(container, `
            parent_dir="$(dirname "${path}")" &&
            chmod -R 777 "$parent_dir" 2>/dev/null || true &&
            chmod -R 777 "${path}" 2>/dev/null || true &&
            rm ${isDirectory ? '-rf' : '-f'} "${path}" &&
            echo "DELETED"
        `);

        try {
            await executeCommandWithPrivileges(container, `test ! -e "${path}"`);
            res.json({
                message: `${isDirectory ? 'Directory' : 'File'} deleted successfully`,
                path: path
            });
        } catch (error) {
            throw new Error('Delete operation could not be verified');
        }
    } catch (error) {
        console.error('Error deleting:', error);
        res.status(403).json({
            error: 'Permission denied',
            details: 'Unable to delete. The location might be read-only or system protected.'
        });
    }
});

app.post('/api/containers/:id/files', upload.single('file'), async (req, res) => {
    try {
        const {id} = req.params;
        const {path: uploadPath} = req.body;
        const container = docker.getContainer(id);

        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        try {
            await executeWithFallback(container, ['test', '-w', uploadPath || '/']);
        } catch (error) {
            return res.status(403).json({
                error: 'Upload permission denied',
                details: 'This location is read-only or restricted'
            });
        }

        const {path: filePath, originalname} = req.file;
        const targetPath = `${uploadPath || '/'}${uploadPath?.endsWith('/') ? '' : '/'}${originalname}`;

        try {
            await executeWithFallback(container, `mkdir -p "${uploadPath}"`);
            await executeWithFallback(container, `chmod 777 "${uploadPath}"`);

            const fileContent = await fsPromises.readFile(filePath);
            const stream = await executeWithFallback(container, `cat > "${targetPath}"`, {
                AttachStdin: true
            });

            await new Promise((resolve, reject) => {
                stream.on('error', reject);
                stream.write(fileContent);
                stream.end();
                stream.on('end', resolve);
            });

            await executeWithFallback(container, `chmod 666 "${targetPath}"`);

            res.json({
                message: 'File uploaded successfully',
                filename: originalname
            });
        } finally {
            await fsPromises.unlink(filePath).catch(console.error);
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(403).json({
            error: 'Failed to upload file',
            details: `This location might be read-only or restricted. ${error.message}`
        });
    }
});

app.post('/api/containers/:id/folders', upload.array('files[]'), async (req, res) => {
    try {
        const {id} = req.params;
        const {basePath} = req.body;
        const filePaths = req.body.filePaths || [];
        const container = docker.getContainer(id);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({error: 'No files uploaded'});
        }

        const allDirs = new Set();
        filePaths.forEach(path => {
            const fullPath = `${basePath}/${path}`;
            const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
            allDirs.add(dirPath);

            let parentDir = dirPath;
            while (parentDir.includes('/')) {
                parentDir = parentDir.substring(0, parentDir.lastIndexOf('/'));
                if (parentDir) allDirs.add(parentDir);
            }
        });

        const sortedDirs = Array.from(allDirs).sort((a, b) => a.split('/').length - b.split('/').length);

        for (const dir of sortedDirs) {
            const mkdirExec = await container.exec({
                Cmd: ['mkdir', '-p', dir],
                AttachStdout: true,
                AttachStderr: true,
            });
            await mkdirExec.start();
        }

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const relativePath = filePaths[i];

            if (!relativePath) {
                console.error(`No path found for file: ${file.originalname}`);
                continue;
            }

            if (file.originalname === '.DS_Store') {
                await fsPromises.unlink(file.path);
                continue;
            }

            try {
                const fileContent = await fsPromises.readFile(file.path);

                const fullPath = `${basePath}/${relativePath}`;

                const execWrite = await container.exec({
                    Cmd: ['sh', '-c', `cat > "${fullPath}"`],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true,
                });

                const stream = await execWrite.start({
                    hijack: true,
                    stdin: true
                });

                await new Promise((resolve, reject) => {
                    stream.on('error', reject);
                    stream.write(fileContent);
                    stream.end();

                    let error = '';
                    stream.on('data', chunk => {
                        error += chunk.toString();
                    });

                    stream.on('end', () => {
                        if (error) {
                            reject(new Error(error));
                        } else {
                            resolve();
                        }
                    });
                });
            } catch (error) {
                console.error(`Error processing file ${fullPath}:`, error);
                throw error;
            } finally {
                await fsPromises.unlink(file.path).catch(console.error);
            }
        }

        const chmodExec = await container.exec({
            Cmd: ['chmod', '-R', '777', basePath],
            AttachStdout: true,
            AttachStderr: true,
        });
        await chmodExec.start();

        const verifyExec = await container.exec({
            Cmd: ['find', basePath, '-type', 'f'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const verifyStream = await verifyExec.start();
        let verifyOutput = '';

        await new Promise((resolve) => {
            verifyStream.on('data', chunk => {
                verifyOutput += chunk.toString();
            });
            verifyStream.on('end', resolve);
        });

        const uploadedFiles = verifyOutput.trim().split('\n').filter(Boolean);

        res.json({
            message: 'Folder uploaded successfully',
            count: uploadedFiles.length,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({error: error.message});
    }
});

app.put('/api/containers/:id/files/rename', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {oldPath, newPath} = req.body;

        const exec = await container.exec({
            Cmd: ['mv', oldPath, newPath],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start();
        let error = '';

        stream.on('data', (chunk) => {
            error += chunk.toString();
        });

        stream.on('end', () => {
            if (error) {
                res.status(500).json({error});
            } else {
                res.json({message: 'File renamed successfully'});
            }
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post('/api/containers/:id/start', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        await container.start();
        res.json({message: 'Container started successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/api/containers/:id/folders/download', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {path} = req.query;
        const folderName = path.split('/').pop();

        const archive = archiver('zip', {
            zlib: {level: 9}
        });

        res.attachment(`${folderName}.zip`);
        res.setHeader('Content-Type', 'application/zip');

        archive.pipe(res);

        const execList = await container.exec({
            Cmd: ['find', path, '-type', 'f'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const streamList = await execList.start();
        let fileList = '';

        await new Promise((resolve) => {
            streamList.on('data', chunk => {
                fileList += chunk.toString();
            });
            streamList.on('end', resolve);
        });

        const files = fileList.trim().split('\n').filter(Boolean);

        for (const filePath of files) {
            try {
                const execFile = await container.exec({
                    Cmd: ['cat', filePath],
                    AttachStdout: true,
                    AttachStderr: true,
                });

                const fileStream = await execFile.start();
                const chunks = [];

                await new Promise((resolve, reject) => {
                    fileStream.on('data', chunk => chunks.push(chunk));
                    fileStream.on('error', reject);
                    fileStream.on('end', resolve);
                });

                const content = Buffer.concat(chunks);

                const relativePath = filePath.slice(path.length + 1);

                const execStat = await container.exec({
                    Cmd: ['stat', '-c', '%a', filePath],
                    AttachStdout: true,
                });

                const statStream = await execStat.start();
                let mode = '';

                await new Promise(resolve => {
                    statStream.on('data', chunk => {
                        mode += chunk.toString();
                    });
                    statStream.on('end', resolve);
                });

                archive.append(content, {
                    name: relativePath,
                    mode: parseInt(mode.trim(), 8)
                });

            } catch (error) {
                console.error(`Error processing file ${filePath}:`, error);
            }
        }

        await archive.finalize();

    } catch (error) {
        console.error('Error downloading folder:', error);
        res.status(500).json({error: error.message});
    }
});

const createDirectoryRecursive = async (container, dirPath) => {
    const parts = dirPath.split('/').filter(Boolean);
    let currentPath = '';

    for (const part of parts) {
        currentPath += '/' + part;
        try {
            const exec = await container.exec({
                Cmd: ['mkdir', '-p', currentPath],
                AttachStdout: true,
                AttachStderr: true
            });

            const stream = await exec.start();
            await new Promise((resolve, reject) => {
                let error = '';
                stream.on('data', chunk => {
                    error += chunk.toString();
                });
                stream.on('end', () => {
                    if (error) {
                        reject(new Error(error));
                    } else {
                        resolve();
                    }
                });
                stream.on('error', reject);
            });

        } catch (error) {
            console.error(`Error creating directory ${currentPath}:`, error);
            throw error;
        }
    }
};

app.post('/api/containers/:id/upload', upload.array('files[]'), async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const files = req.files;
        const paths = req.body.paths || [];
        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const targetPath = paths[i];

            try {
                const dirPath = targetPath.split('/').slice(0, -1).join('/');

                if (dirPath) {
                    await createDirectoryRecursive(container, dirPath);
                }

                const fileContent = await fsPromises.readFile(file.path);

                const exec = await container.exec({
                    Cmd: ['sh', '-c', `cat > "${targetPath}"`],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true
                });

                const stream = await exec.start({
                    hijack: true,
                    stdin: true
                });

                await new Promise((resolve, reject) => {
                    stream.on('error', reject);
                    stream.write(fileContent);
                    stream.end();

                    let error = '';
                    stream.on('data', chunk => {
                        error += chunk.toString();
                    });

                    stream.on('end', () => {
                        if (error) {
                            reject(new Error(error));
                        } else {
                            resolve();
                        }
                    });
                });

                const chmodExec = await container.exec({
                    Cmd: ['chmod', '644', targetPath],
                    AttachStdout: true,
                    AttachStderr: true
                });

                const chmodStream = await chmodExec.start();
                await new Promise((resolve, reject) => {
                    let error = '';
                    chmodStream.on('data', chunk => {
                        error += chunk.toString();
                    });
                    chmodStream.on('end', () => {
                        if (error) {
                            reject(new Error(error));
                        } else {
                            resolve();
                        }
                    });
                    chmodStream.on('error', reject);
                });

                results.push({
                    name: file.originalname,
                    path: targetPath,
                    size: file.size
                });

            } catch (error) {
                console.error(`Error uploading ${targetPath}:`, error);
                throw error;
            }
        }

        res.json({results});
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({error: error.message});
    } finally {
        for (const file of req.files) {
            try {
                await fsPromises.unlink(file.path);
            } catch (err) {
                console.error('Error deleting temporary file:', err);
            }
        }
    }
});

app.get('/api/hostname', (req, res) => {
    try {
        const execSync = require('child_process').execSync;
        let hostname = 'Docker Desktop';

        try {
            const dockerInfo = execSync('docker info --format "{{.Name}}"').toString().trim();
            if (dockerInfo) hostname = dockerInfo;
        } catch (error) {
            try {
                const dockerHost = process.env.DOCKER_HOST;
                if (dockerHost) {
                    hostname = new URL(dockerHost).hostname;
                }
            } catch (error) {
                console.error('Error getting Docker hostname:', error);
            }
        }

        res.json({hostname});
    } catch (error) {
        res.status(500).json({error: 'Could not get hostname'});
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 4200;
const server = app.listen(PORT, () => {
    
});

server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        
        setTimeout(() => {
            server.close();
            server.listen(PORT);
        }, 1000);
    }
});

process.on('SIGTERM', () => {
    
    server.close(() => {
        
        process.exit(0);
    });
});

app.get('/api/containers/:id/download', async (req, res) => {
    const {id} = req.params;
    const {path, isDirectory} = req.query;

    try {
        const container = docker.getContainer(id);

        const archive = archiver('zip');

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${path.split('/').pop()}.zip"`);

        archive.pipe(res);

        const tarStream = await container.getArchive({path});

        const extract = require('tar-stream').extract();

        extract.on('entry', async (header, stream, next) => {
            const chunks = [];

            stream.on('data', chunk => chunks.push(chunk));

            stream.on('end', () => {
                const content = Buffer.concat(chunks);

                if (header.type !== 'file') {
                    next();
                    return;
                }

                let filename = header.name;
                if (filename.startsWith('./')) {
                    filename = filename.substring(2);
                }

                archive.append(content, {
                    name: filename,
                    store: true
                });

                next();
            });

            stream.resume();
        });

        extract.on('finish', () => {
            archive.finalize();
        });

        tarStream.pipe(extract);

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({error: error.message});
        }
    }
});

app.post('/api/containers/:id/restart', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        await container.restart();
        res.json({ message: 'Container restarted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/containers/:id/copy', async (req, res) => {
    try {
        const { id } = req.params;
        const { sourcePath, targetPath, isDirectory } = req.body;
        const container = docker.getContainer(id);

        const targetDir = targetPath.substring(0, targetPath.lastIndexOf('/'));

        await executeCommandWithPrivileges(container, `
            mkdir -p "${targetDir}" &&
            chmod -R 777 "${targetDir}"
        `);

        if (isDirectory) {
            await executeCommandWithPrivileges(container, `
                if [ -d "${targetPath}" ]; then
                    rm -rf "${targetPath}"
                fi &&
                cp -a "${sourcePath}" "${targetPath}" &&
                chmod -R 777 "${targetPath}"
            `);
        } else {
            await executeCommandWithPrivileges(container, `
                cp "${sourcePath}" "${targetPath}" &&
                chmod 666 "${targetPath}"
            `);
        }

        const verifyOutput = await executeCommandWithPrivileges(container, `
            if [ -e "${targetPath}" ]; then
                echo "SUCCESS: $(ls -l "${targetPath}")"
            else
                echo "FAILED: Target path does not exist"
                exit 1
            fi
        `);
        
        if (!verifyOutput.includes('SUCCESS')) {
            throw new Error(`Verification failed: ${verifyOutput}`);
        }

        res.json({ 
            message: 'Item copied successfully',
            details: verifyOutput
        });
    } catch (error) {
        console.error('Copy error:', error);
        res.status(403).json({
            error: 'Failed to copy',
            details: error.message || 'Unable to copy. The location might be read-only or system protected.'
        });
    }
});

app.post('/api/containers/:id/move', async (req, res) => {
    const { id } = req.params;
    const { sourcePath, targetPath, isDirectory } = req.body;

    try {
        const container = docker.getContainer(id);
        
        const verifyCmd = `
            target_dir="$(dirname "${targetPath}")"
            if [ -d "$target_dir" ]; then
                chmod -R 777 "$target_dir" 2>/dev/null || true
                chmod -R 777 "${sourcePath}" 2>/dev/null || true
                echo "SUCCESS: Target directory exists and permissions set"
            else
                echo "FAILED: Target directory does not exist"
                exit 1
            fi
        `;
        
        const verifyExec = await execCommand(container, verifyCmd, {
            Privileged: true,
            User: 'root'
        });
        
        const verifyStream = await verifyExec.start();
        let verifyOutput = '';
        
        await new Promise((resolve, reject) => {
            verifyStream.on('data', chunk => {
                const buffer = Buffer.from(chunk);
                verifyOutput += buffer.slice(buffer[0] === 1 ? 8 : 0).toString();
            });
            verifyStream.on('end', resolve);
            verifyStream.on('error', reject);
        });
        
        if (!verifyOutput.includes('SUCCESS')) {
            throw new Error(`Verification failed: ${verifyOutput}`);
        }

        const moveCmd = `mv "${sourcePath}" "${targetPath}" 2>/dev/null && chmod -R 777 "${targetPath}" 2>/dev/null && echo "SUCCESS: Move completed"`;
        
        const moveExec = await execCommand(container, moveCmd, {
            Privileged: true,
            User: 'root'
        });
        
        const moveStream = await moveExec.start();
        let moveOutput = '';
        
        await new Promise((resolve, reject) => {
            moveStream.on('data', chunk => {
                const buffer = Buffer.from(chunk);
                moveOutput += buffer.slice(buffer[0] === 1 ? 8 : 0).toString();
            });
            moveStream.on('end', resolve);
            moveStream.on('error', reject);
        });

        if (!moveOutput.includes('SUCCESS')) {
            throw new Error('Move operation failed');
        }

        const verifyFinalCmd = `test -e "${targetPath}" && echo "SUCCESS: Final verification passed"`;
        
        const verifyFinalExec = await execCommand(container, verifyFinalCmd, {
            Privileged: true,
            User: 'root'
        });
        
        const verifyFinalStream = await verifyFinalExec.start();
        let verifyFinalOutput = '';
        
        await new Promise((resolve, reject) => {
            verifyFinalStream.on('data', chunk => {
                const buffer = Buffer.from(chunk);
                verifyFinalOutput += buffer.slice(buffer[0] === 1 ? 8 : 0).toString();
            });
            verifyFinalStream.on('end', resolve);
            verifyFinalStream.on('error', reject);
        });

        if (!verifyFinalOutput.includes('SUCCESS')) {
            throw new Error('Final verification failed');
        }

        res.json({ message: 'Item moved successfully' });
    } catch (error) {
        console.error('Move error:', error);
        res.status(403).json({
            error: 'Failed to move item',
            details: error.message || 'Unable to move. The location might be read-only or system protected.'
        });
    }
}); 

app.post('/api/containers/:id/create-file', async (req, res) => {
    try {
        const { id } = req.params;
        const { path, content } = req.body;
        const container = docker.getContainer(id);

        const parentDir = path.substring(0, path.lastIndexOf('/'));
        await executeCommandWithPrivileges(container, `
            mkdir -p "${parentDir}" &&
            chmod 777 "${parentDir}"
        `);

        const writeCmd = `cat > "${path}" << 'EOF'
${content}
EOF`;

        await executeCommandWithPrivileges(container, writeCmd);

        await executeCommandWithPrivileges(container, `
            test -f "${path}" &&
            chmod 666 "${path}" &&
            echo "SUCCESS"
        `);

        res.json({
            message: 'File created successfully',
            path: path
        });
    } catch (error) {
        console.error('Error creating file:', error);
        res.status(403).json({
            error: 'Failed to create file',
            details: error.message || 'Unable to create file. The location might be read-only or system protected.'
        });
    }
});

app.get('/api/containers/:id/permissions', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const { path } = req.query;

        if (!path) {
            return res.status(400).json({ error: 'Path parameter is required' });
        }

        const exec = await container.exec({
            Cmd: ['stat', '-c', '%a', path.trim()],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start();
        let output = '';
        let error = '';

        stream.on('data', chunk => {
            output += chunk.toString();
        });

        stream.on('error', chunk => {
            error += chunk.toString();
        });

        await new Promise((resolve) => stream.on('end', resolve));

        if (error) {
            throw new Error(error);
        }

        const mode = output.trim().replace(/[^\d]/g, '').slice(-3);
        if (!mode || !/^[0-7]{3}$/.test(mode)) {
            throw new Error('Invalid permissions format');
        }

        res.json({ mode });
    } catch (error) {
        console.error('Error getting permissions:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/containers/:id/permissions', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const { path, mode } = req.body;

        if (!path || !mode) {
            return res.status(400).json({ error: 'Path and mode are required' });
        }

        if (!/^[0-7]{3}$/.test(mode)) {
            return res.status(400).json({ error: 'Invalid mode format. Should be 3 digits between 0-7' });
        }

        await executeCommandWithPrivileges(container, `chmod ${mode} "${path.trim()}"`);
        
        const verifyOutput = await executeCommandWithPrivileges(container, `stat -c '%a' "${path.trim()}"`);
        const actualMode = verifyOutput.trim().replace(/[^\d]/g, '').slice(-3);
        
        if (!actualMode || !/^[0-7]{3}$/.test(actualMode)) {
            throw new Error('Failed to read permissions after change');
        }

        res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ error: error.message });
    }
});