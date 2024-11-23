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

// Add error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
};

// Add process error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Add helper function at the top level
const execCommand = async (container, command, options = {}) => {
    try {
        // First try with sudo
        const sudoExec = await container.exec({
            Cmd: ['sh', '-c', `command -v sudo && sudo ${command} || ${command}`],
            AttachStdout: true,
            AttachStderr: true,
            ...options
        });
        return sudoExec;
    } catch (error) {
        console.warn(`Failed to execute with sudo: ${error.message}`);
        // Fallback to direct command
        return container.exec({
            Cmd: ['sh', '-c', command],
            AttachStdout: true,
            AttachStderr: true,
            ...options
        });
    }
};

// List all containers
app.get('/api/containers', async (req, res) => {
    try {
        const containers = await docker.listContainers({all: true});
        res.json(containers);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Get container files
app.get('/api/containers/:id/files', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const path = req.query.path || '/';

        // First verify container exists and is running
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

                            // Safe access to array elements with defaults
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

// Get file content endpoint
app.get('/api/containers/:id/files/content', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {path} = req.query;
        const decodedPath = decodeURIComponent(path);

        // Get file content directly from container using exec
        const exec = await container.exec({
            Cmd: ['cat', decodedPath],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start();
        let fileContent = '';
        let errorContent = '';

        // Collect all data chunks
        stream.on('data', (chunk) => {
            const buffer = Buffer.from(chunk);
            // Check if this is stderr data (usually has a header byte of 2)
            if (buffer[0] === 2) {
                errorContent += buffer.slice(8).toString();
            } else {
                // For stdout (header byte of 1) or no header
                fileContent += buffer.slice(buffer[0] === 1 ? 8 : 0).toString();
            }
        });

        // Handle end of stream
        stream.on('end', () => {
            if (errorContent) {
                res.status(500).json({ error: errorContent });
            } else {
                res.send(fileContent);
            }
        });

        // Handle stream errors
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

// Add helper function for executing commands with multiple methods
const executeWithFallback = async (container, commands, options = {}) => {
    const methods = [
        // Method 1: Direct command
        async () => {
            const exec = await container.exec({
                Cmd: Array.isArray(commands) ? commands : ['sh', '-c', commands],
                AttachStdout: true,
                AttachStderr: true,
                ...options
            });
            return exec.start();
        },
        // Method 2: Try with sudo
        async () => {
            const exec = await container.exec({
                Cmd: ['sh', '-c', `command -v sudo && sudo ${Array.isArray(commands) ? commands.join(' ') : commands} || exit 1`],
                AttachStdout: true,
                AttachStderr: true,
                ...options
            });
            return exec.start();
        },
        // Method 3: Try changing ownership first
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

// Update file content saving endpoint
app.put('/api/containers/:id/files', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const { path, content, restart } = req.body;

        // Create temporary directory and file
        const tempDir = `/tmp/edit-${Date.now()}`;
        const tempFile = `${tempDir}/${path.split('/').pop()}`;
        const tempTar = `${tempDir}/content.tar`;

        try {
            // Create temp directory
            await fsPromises.mkdir(tempDir, { recursive: true, mode: 0o777 });
            // Write content to temp file
            await fsPromises.writeFile(tempFile, content, { mode: 0o666 });

            // Create tar archive
            const output = require('fs').createWriteStream(tempTar);
            const archive = archiver('tar');
            archive.pipe(output);
            archive.file(tempFile, { name: path.split('/').pop() });
            await archive.finalize();
            await new Promise(resolve => output.on('close', resolve));

            // Read tar file
            const tarBuffer = await fsPromises.readFile(tempTar);

            // Create directory and set permissions
            const targetDir = path.substring(0, path.lastIndexOf('/'));
            await executeCommandWithPrivileges(container, `mkdir -p "${targetDir}"`);
            await executeCommandWithPrivileges(container, `chmod 777 "${targetDir}"`);

            // Upload file
            await container.putArchive(tarBuffer, {
                path: targetDir,
                noOverwriteDirNonDir: true
            });

            // Set file permissions
            await executeCommandWithPrivileges(container, `chmod 666 "${path}"`);

            // Get file size
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

            // If restart is requested, restart the container
            if (restart) {
                try {
                    await container.restart();
                } catch (restartError) {
                    console.error('Error restarting container:', restartError);
                    // Continue even if restart fails
                }
            }

            res.json({ 
                message: 'File saved successfully',
                size: parseInt(size.trim()),
                restarted: restart 
            });

        } finally {
            // Clean up temp files
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

// Add this helper function for robust command execution
const executeCommandWithPrivileges = async (container, command, options = {}) => {
    const privilegedExec = await container.exec({
        Cmd: ['sh', '-c', `
            # Try to elevate privileges
            if command -v sudo >/dev/null 2>&1; then
                sudo sh -c '${command.replace(/'/g, "'\\''")}' 2>&1
            else
                # Try direct execution as root
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

// Update rename endpoint
app.put('/api/containers/:id/files/rename', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {oldPath, newPath} = req.body;

        // First ensure parent directory is writable
        const parentDir = newPath.substring(0, newPath.lastIndexOf('/'));
        await executeCommandWithPrivileges(container, `
            mkdir -p "${parentDir}" &&
            chmod 777 "${parentDir}" &&
            chown -R root:root "${parentDir}"
        `);

        // Perform rename with elevated privileges
        await executeCommandWithPrivileges(container, `
            chmod -R 777 "${oldPath}" 2>/dev/null || true &&
            mv "${oldPath}" "${newPath}" &&
            chmod -R 777 "${newPath}" 2>/dev/null || true
        `);

        res.json({
            message: 'File renamed successfully',
            oldPath,
            newPath
        });
    } catch (error) {
        console.error('Error renaming:', error);
        res.status(403).json({
            error: 'Failed to rename',
            details: 'Unable to rename. The location might be read-only or system protected.'
        });
    }
});

// Update folder creation endpoint
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

        // Try to create directory with elevated privileges
        await executeCommandWithPrivileges(container, `
            parent_dir="$(dirname "${path}")" &&
            mkdir -p "$parent_dir" &&
            chmod 777 "$parent_dir" &&
            mkdir -p "${path}" &&
            chmod 777 "${path}" &&
            chown -R root:root "${path}"
        `);

        // Verify directory was created
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

// Update delete endpoint to use the new helper
app.delete('/api/containers/:id/files', async (req, res) => {
    try {
        const {id} = req.params;
        const {path, isDirectory} = req.body;
        const container = docker.getContainer(id);

        // Try to delete with elevated privileges
        await executeCommandWithPrivileges(container, `
            parent_dir="$(dirname "${path}")" &&
            chmod -R 777 "$parent_dir" 2>/dev/null || true &&
            chmod -R 777 "${path}" 2>/dev/null || true &&
            rm ${isDirectory ? '-rf' : '-f'} "${path}" &&
            echo "DELETED"
        `);

        // Verify deletion
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

// Update file upload endpoint
app.post('/api/containers/:id/files', upload.single('file'), async (req, res) => {
    try {
        const {id} = req.params;
        const {path: uploadPath} = req.body;
        const container = docker.getContainer(id);

        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        // Check write permissions
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
            // Create directory with proper permissions
            await executeWithFallback(container, `mkdir -p "${uploadPath}"`);
            await executeWithFallback(container, `chmod 777 "${uploadPath}"`);

            // Upload file
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

            // Set file permissions
            await executeWithFallback(container, `chmod 666 "${targetPath}"`);

            res.json({
                message: 'File uploaded successfully',
                filename: originalname
            });
        } finally {
            // Clean up temp file
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

// Updated endpoint for folder upload
app.post('/api/containers/:id/folders', upload.array('files[]'), async (req, res) => {
    try {
        const {id} = req.params;
        const {basePath} = req.body;
        const filePaths = req.body.filePaths || [];
        const container = docker.getContainer(id);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({error: 'No files uploaded'});
        }

        // First collect all directory paths
        const allDirs = new Set();
        filePaths.forEach(path => {
            const fullPath = `${basePath}/${path}`;
            const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
            allDirs.add(dirPath);

            // Also add parent directories
            let parentDir = dirPath;
            while (parentDir.includes('/')) {
                parentDir = parentDir.substring(0, parentDir.lastIndexOf('/'));
                if (parentDir) allDirs.add(parentDir);
            }
        });

        // Create directories in order and unique
        const sortedDirs = Array.from(allDirs).sort((a, b) => a.split('/').length - b.split('/').length);

        // First create all directories
        for (const dir of sortedDirs) {
            const mkdirExec = await container.exec({
                Cmd: ['mkdir', '-p', dir],
                AttachStdout: true,
                AttachStderr: true,
            });
            await mkdirExec.start();
        }

        // Then upload files
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
                // Read file content
                const fileContent = await fsPromises.readFile(file.path);

                // Create full path
                const fullPath = `${basePath}/${relativePath}`;

                // Copy file to container
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
                // Clean up temp file
                await fsPromises.unlink(file.path).catch(console.error);
            }
        }

        // Recursively set permissions for all directories
        const chmodExec = await container.exec({
            Cmd: ['chmod', '-R', '777', basePath],
            AttachStdout: true,
            AttachStderr: true,
        });
        await chmodExec.start();

        // Verify folder structure
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

// Rename file or directory
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

// Add container start endpoint
app.post('/api/containers/:id/start', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        await container.start();
        res.json({message: 'Container started successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// Update folder download endpoint
app.get('/api/containers/:id/folders/download', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {path} = req.query;
        const folderName = path.split('/').pop();

        // Create zip archive
        const archive = archiver('zip', {
            zlib: {level: 9}
        });

        // Set response headers
        res.attachment(`${folderName}.zip`);
        res.setHeader('Content-Type', 'application/zip');

        // Pipe archive to response
        archive.pipe(res);

        // First, get all files recursively
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

        // Get all files
        const files = fileList.trim().split('\n').filter(Boolean);

        // Process each file
        for (const filePath of files) {
            try {
                // Get file content
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

                // Calculate relative path for zip
                const relativePath = filePath.slice(path.length + 1);

                // Get file permissions
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

                // Add file to zip with proper mode
                archive.append(content, {
                    name: relativePath,
                    mode: parseInt(mode.trim(), 8)
                });

            } catch (error) {
                console.error(`Error processing file ${filePath}:`, error);
            }
        }

        // Finalize archive
        await archive.finalize();

    } catch (error) {
        console.error('Error downloading folder:', error);
        res.status(500).json({error: error.message});
    }
});

// Update createDirectoryRecursive function
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

            // Start exec and wait for completion
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

// Update upload endpoint
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
                // Extract directory path from the full file path
                const dirPath = targetPath.split('/').slice(0, -1).join('/');

                // Create directory structure if it doesn't exist
                if (dirPath) {
                    await createDirectoryRecursive(container, dirPath);
                }

                // Read file content using fsPromises
                const fileContent = await fsPromises.readFile(file.path);

                // Create and write file using exec
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

                // Write file content
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

                // Set permissions
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
        // Cleanup temporary files using fsPromises
        for (const file of req.files) {
            try {
                await fsPromises.unlink(file.path);
            } catch (err) {
                console.error('Error deleting temporary file:', err);
            }
        }
    }
});

// Update hostname endpoint
app.get('/api/hostname', (req, res) => {
    try {
        // Try to get Docker Desktop hostname
        const execSync = require('child_process').execSync;
        let hostname = 'Docker Desktop';

        // Try different methods to get Docker host name
        try {
            // First try Docker info
            const dockerInfo = execSync('docker info --format "{{.Name}}"').toString().trim();
            if (dockerInfo) hostname = dockerInfo;
        } catch (error) {
            try {
                // Then try environment variable
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

// Add error handler middleware
app.use(errorHandler);

// Update server startup
const PORT = process.env.PORT || 4200;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.log('Port is already in use. Trying again...');
        setTimeout(() => {
            server.close();
            server.listen(PORT);
        }, 1000);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Add this new endpoint
app.get('/api/containers/:id/download', async (req, res) => {
    const {id} = req.params;
    const {path, isDirectory} = req.query;

    try {
        const container = docker.getContainer(id);

        // Create a zip archive
        const archive = archiver('zip');

        // Set response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${path.split('/').pop()}.zip"`);

        // Pipe archive data to response
        archive.pipe(res);

        // Get tar stream from Docker
        const tarStream = await container.getArchive({path});

        // Create extract stream
        const extract = require('tar-stream').extract();

        // Process each file from the tar
        extract.on('entry', async (header, stream, next) => {
            const chunks = [];

            stream.on('data', chunk => chunks.push(chunk));

            stream.on('end', () => {
                const content = Buffer.concat(chunks);

                // Skip if this is a directory
                if (header.type !== 'file') {
                    next();
                    return;
                }

                // Remove the base path from the filename
                let filename = header.name;
                if (filename.startsWith('./')) {
                    filename = filename.substring(2);
                }

                // Add file to zip archive
                archive.append(content, {
                    name: filename,
                    store: true
                });

                next();
            });

            stream.resume();
        });

        // When tar extraction is complete, finalize the zip
        extract.on('finish', () => {
            archive.finalize();
        });

        // Pipe tar stream to extract
        tarStream.pipe(extract);

    } catch (error) {
        console.error('Download error:', error);
        if (!res.headersSent) {
            res.status(500).json({error: error.message});
        }
    }
});

// Add new restart endpoint
app.post('/api/containers/:id/restart', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        await container.restart();
        res.json({ message: 'Container restarted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}); 