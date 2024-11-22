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
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${decodedPath.split('/').pop()}"`);

        // Pipe the stream directly to response
        stream.pipe(res);

        // Handle stream errors
        stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({error: error.message});
            }
        });

    } catch (error) {
        console.error('Error downloading file:', error);
        if (!res.headersSent) {
            res.status(500).json({error: error.message});
        }
    }
});

// Update file content saving endpoint
app.put('/api/containers/:id/files', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {path, content} = req.body;

        // Create temporary directory
        const tempDir = `/tmp/edit-${Date.now()}`;
        const tempFile = `${tempDir}/${path.split('/').pop()}`;
        const tempTar = `${tempDir}/content.tar`;

        await fsPromises.mkdir(tempDir, {recursive: true});

        // Write content to temp file
        await fsPromises.writeFile(tempFile, content);

        // Create tar archive
        const output = require('fs').createWriteStream(tempTar);
        const archive = archiver('tar');

        archive.pipe(output);
        archive.file(tempFile, {name: path.split('/').pop()});
        await archive.finalize();

        // Wait for archive to finish writing
        await new Promise(resolve => output.on('close', resolve));

        // Read tar file and upload to container
        const tarBuffer = await fsPromises.readFile(tempTar);
        await container.putArchive(tarBuffer, {
            path: path.substring(0, path.lastIndexOf('/')),
            noOverwriteDirNonDir: true
        });

        // Get updated file info
        const exec = await container.exec({
            Cmd: ['ls', '-laQ', path],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start();
        let fileInfo = '';

        await new Promise((resolve) => {
            stream.on('data', (chunk) => {
                fileInfo += chunk.toString();
            });
            stream.on('end', resolve);
        });

        // Parse file info to get new size
        const fileInfoParts = fileInfo.trim().split('\n')[0].match(/[^\s"']+|"([^"]*)"|'([^']*)'/g);
        const newSize = fileInfoParts ? fileInfoParts[4] : null;

        // Clean up
        await fsPromises.rm(tempDir, {recursive: true, force: true});

        res.json({
            message: 'File updated successfully',
            size: newSize
        });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({error: error.message});
    }
});

// Updated endpoint for single file upload
app.post('/api/containers/:id/files', upload.single('file'), async (req, res) => {
    try {
        const {id} = req.params;
        const {path: uploadPath} = req.body;

        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        const {path: filePath, originalname} = req.file;
        const container = docker.getContainer(id);

        // Read file content
        const fileContent = await fsPromises.readFile(filePath);

        // Copy file to container (using exec)
        const targetPath = `${uploadPath || '/'}${uploadPath.endsWith('/') ? '' : '/'}${originalname}`;

        // First copy file to container
        const execWrite = await container.exec({
            Cmd: ['sh', '-c', `cat > "${targetPath}"`],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await execWrite.start({
            hijack: true,
            stdin: true
        });

        // Write file content and end stream properly
        await new Promise((resolve, reject) => {
            stream.on('error', reject);

            // Write the file content
            stream.write(fileContent);

            // End the stream
            stream.end();

            // Wait for the stream to finish
            stream.on('end', resolve);
        });

        // Set permissions
        const execChmod = await container.exec({
            Cmd: ['chmod', '777', targetPath],
            AttachStdout: true,
            AttachStderr: true,
        });

        await execChmod.start();

        // Clean up temp file
        await fsPromises.unlink(filePath);

        res.json({
            message: 'File uploaded successfully',
            filename: originalname
        });
    } catch (error) {
        console.error('Upload error:', error);
        console.error('Error details:', error.stack);
        res.status(500).json({error: error.message});
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

// Delete file - Fix error handling
app.delete('/api/containers/:id/files', async (req, res) => {
    try {
        const {id} = req.params;
        const {path, isDirectory} = req.body;
        const container = docker.getContainer(id);

        const exec = await container.exec({
            // Use rm -rf for directories, rm -f for files
            Cmd: isDirectory ? ['rm', '-rf', path] : ['rm', '-f', path],
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
                res.json({message: 'File deleted successfully'});
            }
        });
    } catch (error) {
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
const PORT = process.env.PORT || 4000;
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

// Update the folder creation endpoint to use a different route
app.post('/api/containers/:id/create-folder', async (req, res) => {
    try {
        const container = docker.getContainer(req.params.id);
        const {path} = req.body;

        // Validate input
        if (!path) {
            return res.status(400).json({
                error: 'Path is required',
                details: 'Please provide a valid path for the folder'
            });
        }

        // Verify container exists and is running
        try {
            const containerInfo = await container.inspect();
            if (containerInfo.State.Status !== 'running') {
                return res.status(503).json({
                    error: 'Container is not running',
                    details: 'Container must be running to create folders'
                });
            }
        } catch (error) {
            if (error.statusCode === 404) {
                return res.status(404).json({
                    error: 'Container not found',
                    details: 'The specified container no longer exists'
                });
            }
            throw error;
        }

        // Create directory using mkdir
        const exec = await container.exec({
            Cmd: ['mkdir', '-p', path],
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

        res.json({
            message: 'Folder created successfully',
            path: path
        });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({
            error: 'Failed to create folder',
            details: error.message
        });
    }
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