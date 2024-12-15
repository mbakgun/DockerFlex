import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AppBar,
    Box,
    Button,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fade,
    Grid,
    Grow,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Paper,
    Snackbar,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    FormGroup,
} from '@material-ui/core';
import {
    Add as AddIcon,
    ArrowBack,
    Close as CloseIcon,
    CloudUpload,
    CloudUpload as UploadIcon,
    Code as CodeIcon,
    CreateNewFolder as CreateNewFolderIcon,
    Delete,
    Delete as DeleteIcon,
    Edit,
    Folder,
    GetApp,
    InsertDriveFile,
    InsertDriveFile as InsertDriveFileIcon,
    Menu as MenuIcon,
    PlayArrow as RunningIcon,
    Save as SaveIcon,
    Stop as StoppedIcon,
    GitHub as GitHubIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    FileCopy as FileCopyIcon,
} from '@material-ui/icons';
import MuiAlert from '@material-ui/lab/Alert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import { sql } from '@codemirror/lang-sql';
import { python } from '@codemirror/lang-python';
import { php } from '@codemirror/lang-php';
import { markdown } from '@codemirror/lang-markdown';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { linter, lintGutter } from "@codemirror/lint";
import jsonlint from 'jsonlint-mod';
import yamlLint from 'yaml-lint';
import { StreamLanguage } from '@codemirror/language';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { go } from '@codemirror/lang-go';
import { nginx } from '@codemirror/legacy-modes/mode/nginx';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { Info as InfoIcon } from '@material-ui/icons';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        padding: theme.spacing(3),
        paddingTop: theme.spacing(2),
        backgroundColor: '#0d1117',
        minHeight: '100vh',
        color: '#e6edf3',
    },
    headerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing(6),
        marginTop: theme.spacing(4),
        padding: theme.spacing(3),
        background: 'linear-gradient(135deg, #161b22 0%, #21262d 100%)',
        borderRadius: theme.spacing(2),
        color: '#e6edf3',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        [theme.breakpoints.down('sm')]: {
            marginBottom: theme.spacing(3),
            marginTop: theme.spacing(2),
            padding: theme.spacing(2),
        },
    },
    title: {
        color: 'white',
        fontWeight: 500,
        textAlign: 'center',
        marginBottom: theme.spacing(2),
        letterSpacing: '0.5px',
        display: 'inline-grid',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(0.75),
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.75rem',
            padding: '0 16px',
            wordBreak: 'break-word',
        },
    },
    githubButton: {
        color: '#e6edf3',
        transition: 'transform 0.2s, color 0.2s',
        position: 'relative',
        padding: 8,
        '&:hover': {
            color: '#58a6ff',
            transform: 'scale(1.1)',
            backgroundColor: 'transparent',
        },
    },
    version: {
        fontSize: '0.7rem',
        color: '#8b949e',
        position: 'absolute',
        bottom: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.6rem',
            bottom: '-10px',
        },
    },
    hostInfo: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1.1rem',
        marginTop: theme.spacing(1),
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    statsContainer: {
        display: 'flex',
        gap: theme.spacing(3),
        marginTop: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            gap: theme.spacing(2),
            flexWrap: 'wrap',
            justifyContent: 'center',
        },
    },
    statItem: {
        textAlign: 'center',
        padding: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(0.5),
            minWidth: '80px',
        },
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: '0.9rem',
        opacity: 0.9,
    },
    divider: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        margin: theme.spacing(2, 0),
        width: '80%',
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderRadius: theme.spacing(2),
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
        },
    },
    cardContent: {
        padding: theme.spacing(3),
        color: '#ffffff',
    },
    containerName: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        marginBottom: theme.spacing(2),
        color: '#ffffff',
        '& .MuiTypography-root': {
            color: '#ffffff',
            fontWeight: 500,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.9rem',
        },
    },
    statusChip: {
        marginTop: theme.spacing(1),
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '6px 16px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'fit-content',
        '& .MuiChip-icon': {
            color: '#4caf50',
        },
    },
    statusContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    statusText: {
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    runningChip: {
        backgroundColor: '#4caf50',
        color: 'white',
    },
    stoppedChip: {
        backgroundColor: '#f44336',
        color: 'white',
    },
    imageInfo: {
        marginTop: theme.spacing(2),
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.875rem',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            fontSize: '0.75rem',
        },
    },
    normalContainer: {
        backgroundColor: '#2E7D32',
        '&:hover': {
            backgroundColor: '#388E3C',
        },
    },
    artifactContainer: {
        backgroundColor: '#B71C1C',
        '&:hover': {
            backgroundColor: '#C62828',
        },
    },
    appContainer: {
        backgroundColor: '#2E7D32',
        '&:hover': {
            backgroundColor: '#388E3C',
        },
    },
    dialog: {
        minHeight: '80vh',
    },
    appBar: {
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.drawer + 1,
        transition: 'none !important',
        backgroundColor: 'transparent !important',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        [theme.breakpoints.down('sm')]: {
            padding: '0 8px',
        },
    },
    fileList: {
        width: '100%',
        backgroundColor: '#0d1117',
        marginTop: 0,
        color: '#e6edf3',
        minHeight: 'calc(100vh - 64px)',
        '& .MuiListItem-root': {
            backgroundColor: '#0d1117',
            borderBottom: '1px solid #21262d',
            '&:hover': {
                backgroundColor: '#161b22',
            },
        },
    },
    selectedItem: {
        backgroundColor: '#2d333b !important',
        '&:hover': {
            backgroundColor: '#2d333b !important',
        },
        '& .MuiListItemText-primary': {
            color: '#ffffff !important',
        },
        '& .MuiListItemText-secondary': {
            color: '#e6edf3 !important',
        },
    },
    backButton: {
        marginRight: theme.spacing(2),
    },
    editor: {
        width: '100%',
        height: 'calc(100vh - 64px)',
        '& .cm-editor': {
            height: '100%',
            fontSize: '14px',
            backgroundColor: '#0d1117',
        },
        '& .cm-scroller': {
            height: '100% !important',
            backgroundColor: '#0d1117',
        },
        '& .cm-gutters': {
            backgroundColor: '#0d1117',
            borderRight: '1px solid #30363d',
        },
        '& .cm-diagnostic-error': {
            borderLeft: '2px solid #ff0000',
        },
        '& .cm-lint-marker, & .cm-lint-marker-error': {
            display: 'none',
        },
        '& .cm-lintRange': {
            textDecoration: 'none'
        },
        '& .cm-tooltip-hover.cm-tooltip': {
            zIndex: 1500,
            backgroundColor: '#21262d',
            border: '1px solid #30363d',
            color: '#e6edf3',
            borderRadius: '4px',
            padding: '4px 8px',
            position: 'absolute',
            opacity: 0,
            transition: 'opacity 0.01s ease-in',
            '&.visible': {
                opacity: 1,
            }
        },
        '& .cm-tooltip-hover.cm-tooltip.cm-tooltip-above': {
            position: 'absolute',
        }
    },
    editorContainer: {
        backgroundColor: '#0d1117',
        height: 'calc(100vh - 64px)',
        padding: 0,
        overflow: 'hidden',
    },
    breadcrumb: {
        marginLeft: theme.spacing(2),
        color: 'rgba(255, 255, 255, 0.7)',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    buildkitContainer: {
        backgroundColor: '#ffebee',
    },
    nonRunningContainer: {
        opacity: 0.7,
        cursor: 'not-allowed',
        '&:hover': {
            transform: 'none',
            boxShadow: 'none',
        },
    },
    appBarNormal: {
        backgroundColor: '#2E7D32 !important',
    },
    appBarArtifact: {
        backgroundColor: '#B71C1C !important',
    },
    appBarApp: {
        backgroundColor: '#2E7D32 !important',
    },
    dropZone: {
        position: 'relative',
        height: '100%',
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#0d1117',
        '&.dragging': {
            '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(13, 17, 23, 0.8)',
                zIndex: 1,
            },
        },
    },
    dropMessage: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        color: 'white',
        textAlign: 'center',
        pointerEvents: 'none',
    },
    successMessage: {
        position: 'fixed',
        bottom: theme.spacing(2),
        left: theme.spacing(2),
        backgroundColor: '#4caf50',
        color: 'white',
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        zIndex: 9999,
        animation: '$fadeOut 3s ease-in-out',
    },
    '@keyframes fadeOut': {
        '0%': {
            opacity: 1,
        },
        '70%': {
            opacity: 1,
        },
        '100%': {
            opacity: 0,
        },
    },
    tooltip: {
        backgroundColor: '#21262d',
        color: '#e6edf3',
        fontSize: '0.875rem',
        border: '1px solid #30363d',
    },
    snackbar: {
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 9999,
    },
    alert: {
        backgroundColor: theme.palette.error.dark,
        color: '#ffffff',
        '& .MuiAlert-icon': {
            color: '#ffffff',
        },
    },
    renameTextField: {
        '& .MuiInputBase-input': {
            color: '#ffffff',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#ffffff',
            },
        },
    },
    fileListItem: {
        '& .MuiListItemText-primary': {
            color: '#ffffff',
        },
        '& .MuiListItemText-secondary': {
            color: 'rgba(255, 255, 255, 0.7)',
        },
    },
    dialogTransition: {
        transition: 'none !important',
    },
    uploadDialog: {
        '& .MuiDialog-paper': {
            backgroundColor: '#0d1117',
            color: '#e6edf3',
        },
    },
    uploadDialogTitle: {
        '& .MuiTypography-root': {
            color: '#e6edf3',
        },
    },
    uploadDropZone: {
        border: '2px dashed #30363d',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(3),
        textAlign: 'center',
        backgroundColor: '#0d1117',
        color: '#e6edf3',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: theme.spacing(2),
        '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: '#161b22',
        },
        '&.dragging': {
            borderColor: '#6366f1',
            backgroundColor: '#161b22',
        },
    },
    uploadList: {
        backgroundColor: '#0d1117',
        '& .MuiListItem-root': {
            borderBottom: '1px solid #21262d',
            '&.Mui-selected': {
                backgroundColor: '#f0883e33',
            },
            '&:hover': {
                backgroundColor: '#f0883e1a',
            },
        },
        '& .MuiListItemText-primary': {
            color: '#e6edf3',
        },
        '& .MuiListItemText-secondary': {
            color: '#8b949e',
        },
        '& .MuiListItemIcon-root': {
            color: '#e6edf3',
            minWidth: '40px',
        },
    },
    uploadListIcon: {
        color: '#e6edf3',
        marginRight: theme.spacing(1),
    },
    uploadActions: {
        backgroundColor: '#161b22',
        borderTop: '1px solid #30363d',
        '& .MuiButton-contained': {
            backgroundColor: '#f0883e',
            color: '#ffffff',
            '&:hover': {
                backgroundColor: '#d46b28',
            },
            '&.Mui-disabled': {
                backgroundColor: '#4a3928',
                color: '#b08c5b',
            },
        },
    },
    editorDialog: {
        backgroundColor: '#0d1117',
        '& .MuiDialog-paper': {
            backgroundColor: '#0d1117',
        },
        [theme.breakpoints.down('sm')]: {
            '& .MuiContainer-root': {
                padding: theme.spacing(1),
            },
        },
    },
    editorAppBar: {
        backgroundColor: '#161b22 !important',
        borderBottom: '1px solid #30363d',
        [theme.breakpoints.down('sm')]: {
            '& .MuiToolbar-root': {
                minHeight: '56px',
                padding: '0 8px',
            },
            '& .MuiTypography-h6': {
                fontSize: '1rem',
                maxWidth: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            },
        },
    },
    editorToolbar: {
        '& .MuiButton-root': {
            color: '#e6edf3',
            '&:hover': {
                backgroundColor: 'rgba(56, 139, 253, 0.15)',
            },
        },
        [theme.breakpoints.down('sm')]: {
            '& .MuiButton-root': {
                padding: '4px 8px',
                minWidth: 'unset',
                '& .MuiButton-startIcon': {
                    margin: 0,
                },
                '& .MuiButton-label > span:last-child': {
                    display: 'none', 
                },
            },
        },
    },
    newItemDialog: {
        '& .MuiDialog-paper': {
            backgroundColor: '#161b22',
            color: '#e6edf3',
        },
    },
    newItemTextField: {
        '& .MuiInputBase-input': {
            color: '#e6edf3',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#30363d',
            },
            '&:hover fieldset': {
                borderColor: '#6e7681',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#58a6ff',
            },
        },
        '& .MuiInputLabel-root': {
            color: '#e6edf3',
        },
        '& .MuiInputLabel-outlined': {
            color: '#e6edf3',
        },
        '& .MuiInputLabel-outlined.Mui-focused': {
            color: '#58a6ff',
        },
    },
    newItemContent: {
        '& .MuiInputBase-root': {
            color: '#e6edf3',
            backgroundColor: '#0d1117',
        },
        '& .MuiInputLabel-root': {
            color: '#e6edf3',
        },
        '& .MuiInputLabel-outlined': {
            color: '#e6edf3',
        },
        '& .MuiInputLabel-outlined.Mui-focused': {
            color: '#58a6ff',
        },
    },
    saveButton: {
        backgroundColor: '#f0883e',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#d46b28',
        },
        '&.Mui-disabled': {
            backgroundColor: '#4a3928',
            color: '#b08c5b',
        },
    },
    toolbarActions: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    mobileMenuButton: {
        display: 'none',
        [theme.breakpoints.down('sm')]: {
            display: 'block',
            marginLeft: 'auto',
            marginRight: theme.spacing(1),
        },
    },
    mobileMenu: {
        '& .MuiPaper-root': {
            backgroundColor: '#21262d',
            color: '#e6edf3',
            border: '1px solid #30363d',
            width: '200px',
            maxWidth: '90vw',
        },
    },
    mobileMenuItem: {
        color: '#e6edf3',
        '&:hover': {
            backgroundColor: 'rgba(56, 139, 253, 0.15)',
        },
        '& .MuiListItemIcon-root': {
            color: '#e6edf3',
            minWidth: '40px',
        },
    },
    restartCheckbox: {
        color: '#e6edf3',
        marginRight: theme.spacing(2),
        '& .MuiCheckbox-root': {
            color: '#8b949e',
        },
        '& .Mui-checked': {
            color: '#f0883e',
        },
        '& .MuiFormControlLabel-label': {
            color: '#e6edf3',
        },
    },
    searchContainer: {
        display: 'flex',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        padding: '2px',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        width: '30px',
        '&.expanded': {
            width: '300px',
            backgroundColor: '#21262d',
        },
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
    searchInput: {
        color: '#ffffff',
        border: 'none',
        background: 'transparent',
        outline: 'none',
        padding: '4px 4px',
        margin: 0,
        width: '0',
        transition: 'width 0.3s ease',
        '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.7)',
        },
        '&.expanded': {
            width: '100%',
            marginLeft: '4px',
        },
    },
    saveButtonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
        color: '#ffffff !important', 
    },
    saveButtonWrapper: {
        position: 'relative',
        marginRight: '8px',
        '& .MuiButton-root.Mui-disabled': {
            backgroundColor: '#f0883e',
            opacity: 0.8,
        }
    },
    saveButtonContent: {
        visibility: props => props.saving ? 'hidden' : 'visible',
    },
    dragOver: {
        backgroundColor: '#1c2026 !important',
        borderColor: '#388e3c !important',
        '& .MuiListItemIcon-root': {
            color: '#4caf50 !important'
        }
    },
    dragging: {
        opacity: 0.5,
        backgroundColor: '#1c2026 !important'
    },
    dropToParent: {
        backgroundColor: '#1c2026 !important',
        borderColor: '#388e3c !important',
        '& .MuiIconButton-root': {
            color: '#4caf50 !important'
        }
    },
    navigationArea: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        '&.dragOver': {
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderRadius: theme.spacing(1)
        }
    },
    checkboxStyle: {
        '& .MuiCheckbox-root': {
            color: '#8b949e',
            '&.Mui-checked': {
                color: '#2E7D32'
            }
        },
        '& .MuiFormControlLabel-label': {
            color: '#e6edf3'
        }
    },
    authDialog: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0d1117',
        zIndex: theme.zIndex.modal,
        '& .MuiDialog-paper': {
            backgroundColor: '#0d1117',
            color: '#e6edf3',
            padding: theme.spacing(3),
            minWidth: '300px',
            boxShadow: 'none'
        },
        '& .MuiDialogTitle-root': {
            borderBottom: '1px solid #30363d',
            '& h4': {
                color: '#e6edf3',
            },
        },
        '& .MuiDialogContent-root': {
            paddingTop: theme.spacing(3),
        },
        '& .MuiDialogActions-root': {
            borderTop: '1px solid #30363d',
            padding: theme.spacing(2),
        },
    },
    authInput: {
        '& .MuiInputBase-input': {
            color: '#e6edf3',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#30363d',
            },
            '&:hover fieldset': {
                borderColor: '#6e7681',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#f0883e',
            },
        },
        '& .MuiInputLabel-root': {
            color: '#8b949e',
        },
        '& .MuiInputLabel-outlined.Mui-focused': {
            color: '#f0883e',
        },
    },
    authButton: {
        backgroundColor: '#f0883e',
        color: '#ffffff',
        width: '100%',
        '&:hover': {
            backgroundColor: '#d46b28',
        },
        '&.Mui-disabled': {
            backgroundColor: '#4a3928',
            color: '#b08c5b',
        },
    },
    authError: {
        color: '#f85149',
        marginTop: theme.spacing(1),
        fontSize: '0.875rem',
    },
    titleContainer: {
        textAlign: 'center',
        marginBottom: theme.spacing(2),
        position: 'relative',
        '& h4': {
            color: '#e6edf3',
            marginBottom: theme.spacing(1),
        },
    },
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const cleanFileName = (fileName) => {
    return fileName
        .replace(/[^a-zA-Z0-9\s._-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const INTERNAL_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4200';

const createLinter = (fileName) => {
    const ext = fileName.toLowerCase().split('.').pop();

    return linter(async (view) => {
        const content = view.state.doc.toString();
        const diagnostics = [];

        try {
            if (ext === 'json') {
                jsonlint.parse(content);
            } else if (ext === 'yaml' || ext === 'yml') {
                await yamlLint.lint(content);
            }
        } catch (error) {
            diagnostics.push({
                from: 0,
                to: content.length,
                severity: 'error',
                message: error.message
            });
        }

        return diagnostics;
    });
};

const getFileLanguage = (fileName) => {
    const ext = fileName.toLowerCase().split('.').pop();

    switch (ext) {
        case 'json':
            return json();
        case 'yaml':
        case 'yml':
            return yaml();
        case 'xml':
            return xml();
        case 'html':
        case 'htm':
            return html();
        case 'css':
            return css();
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return javascript();
        case 'php':
            return php();
        case 'py':
            return python();
        case 'sql':
            return sql();
        case 'md':
        case 'markdown':
            return markdown();
        case 'sh':
        case 'bash':
            return StreamLanguage.define(shell);
        case 'go':
            return go();
        case 'conf':
            return StreamLanguage.define(nginx);
        case 'toml':
            return StreamLanguage.define(toml);
        default:
            return null;
    }
};

function App() {
    const [containers, setContainers] = useState([]);
    const [selectedContainer, setSelectedContainer] = useState(() => {
        const saved = localStorage.getItem('selectedContainer');
        return saved ? JSON.parse(saved) : null;
    });
    const [files, setFiles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentPath, setCurrentPath] = useState(() => {
        return localStorage.getItem('currentPath') || '/';
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [openEditor, setOpenEditor] = useState(false);
    const [fileContent, setFileContent] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [navigationStack, setNavigationStack] = useState([]);
    const [currentStackIndex, setCurrentStackIndex] = useState(-1);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [messageType, setMessageType] = useState('error');
    const [searchString, setSearchString] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [hostInfo, setHostInfo] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'error'
    });
    const [error, setError] = useState(null);
    const [newItemAnchorEl, setNewItemAnchorEl] = useState(null);
    const [newItemDialog, setNewItemDialog] = useState(false);
    const [newItemType, setNewItemType] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [newFileContent, setNewFileContent] = useState('');
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [restartOnSave, setRestartOnSave] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSearchDialog, setMobileSearchDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const classes = useStyles({ saving }); 

    const [originalContent, setOriginalContent] = useState('');
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);

    const [isParentDragOver, setIsParentDragOver] = useState(false);

    const [showAuthDialog, setShowAuthDialog] = useState(true);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');

    const [permissionsDialog, setPermissionsDialog] = useState(false);
    const [permissions, setPermissions] = useState({
        owner: { read: true, write: true, execute: true },
        group: { read: true, write: true, execute: true },
        others: { read: true, write: true, execute: true }
    });

    const [isLoading, setIsLoading] = useState(true);

    const calculateNumericPermissions = (perms) => {
        const calculate = (entity) => {
            let value = 0;
            if (entity.read) value += 4;
            if (entity.write) value += 2;
            if (entity.execute) value += 1;
            return value;
        };
        
        return `${calculate(perms.owner)}${calculate(perms.group)}${calculate(perms.others)}`;
    };

    const parseNumericPermissions = (numeric) => {
        const parseBits = (value) => ({
            read: (value & 4) === 4,
            write: (value & 2) === 2,
            execute: (value & 1) === 1
        });
        
        const digits = numeric.toString().padStart(3, '0');
        return {
            owner: parseBits(parseInt(digits[0])),
            group: parseBits(parseInt(digits[1])),
            others: parseBits(parseInt(digits[2]))
        };
    };

    const [permissionsLoading, setPermissionsLoading] = useState(false);

    const handlePermissionsClick = async () => {
        if (!selectedFile) return;
        
        try {
            setPermissionsLoading(true);
            const response = await axios.get(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/permissions`,
                { params: { path: `${currentPath}/${selectedFile.name}` } }
            );
            
            const mode = response.data.mode.replace(/[^\d]/g, '').slice(-3);
            if (!mode || !/^[0-7]{3}$/.test(mode)) {
                throw new Error('Invalid permissions format received');
            }
            
            const newPermissions = parseNumericPermissions(mode);
            setPermissions(newPermissions);
            setPermissionsDialog(true);
            setPermissionsLoading(false);
        } catch (error) {
            setPermissionsLoading(false);
            showErrorMessage('Error fetching permissions: ' + error.message);
        }
    };

    const handlePermissionsSave = async () => {
        if (!selectedFile) return;
        
        try {
            setPermissionsLoading(true);  
            await axios.put(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/permissions`,
                {
                    path: `${currentPath}/${selectedFile.name}`,
                    mode: calculateNumericPermissions(permissions)
                }
            );
            
            setPermissionsDialog(false);
            showSuccessMessage('Permissions updated successfully');
            await fetchFiles(selectedContainer.Id, currentPath);
            setPermissionsLoading(false);  
        } catch (error) {
            setPermissionsLoading(false);  
            showErrorMessage('Error updating permissions: ' + error.message);
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('dockerflex-token');
        if (token) {
            try {
                axios.defaults.headers.common['X-DockerFlex-Auth'] = token;
                const response = await axios.post(`${INTERNAL_API_URL}/api/auth`, {});
                if (response.data.authenticated) {
                    setIsAuthenticated(true);
                    setShowAuthDialog(false);
                    await restorePreviousState();
                    return;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        }
        setIsLoading(false);
        setShowAuthDialog(true);
    };

    const handleAuthentication = async () => {
        try {
            const response = await axios.post(`${INTERNAL_API_URL}/api/auth`, { password });
            if (response.data.authenticated) {
                const token = response.headers['x-dockerflex-auth'];
                if (token) {
                    localStorage.setItem('dockerflex-token', token);
                    axios.defaults.headers.common['X-DockerFlex-Auth'] = token;
                }
                setIsAuthenticated(true);
                setShowAuthDialog(false);
                setAuthError('');
                
                await fetchContainers();
            }
        } catch (error) {
            setAuthError('Invalid password');
            localStorage.removeItem('dockerflex-token');
            delete axios.defaults.headers.common['X-DockerFlex-Auth'];
            console.error('Authentication error:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('dockerflex-token');
        if (token) {
            axios.defaults.headers.common['X-DockerFlex-Auth'] = token;
            setIsAuthenticated(true);
            setShowAuthDialog(false);
        }
    }, []);

    const restorePreviousState = async () => {
        const savedContainer = localStorage.getItem('selectedContainer');
        const savedPath = localStorage.getItem('currentPath');
        
        if (savedContainer) {
            try {
                const parsedContainer = JSON.parse(savedContainer);
                setSelectedContainer(parsedContainer);
                setOpenDialog(true);
                
                if (savedPath) {
                    setCurrentPath(savedPath);
                    await fetchFiles(parsedContainer.Id, savedPath);
                }
            } catch (error) {
                console.error('Error restoring state:', error);
                localStorage.removeItem('selectedContainer');
                localStorage.removeItem('currentPath');
            }
        }
        setIsLoading(false);
    };

    const fetchContainers = async () => {
        try {
            const response = await axios.get(`${INTERNAL_API_URL}/api/containers`);
            setContainers(response.data);
            
            await restorePreviousState();
        } catch (error) {
            console.error('Error fetching containers:', error);
            if (error.response?.status === 401) {
                setShowAuthDialog(true);
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            const initFetch = async () => {
                try {
                    await fetchContainers();
                } catch (error) {
                    if (error.response?.status === 401) {
                        setIsAuthenticated(false);
                        setShowAuthDialog(true);
                    } else {
                        showErrorMessage('Error fetching containers: ' + error.message);
                    }
                }
            };
            initFetch();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const handleNavigation = (e) => {
            if (!openDialog && !openEditor) return;

            e.preventDefault();
            e.stopPropagation();

            if (openEditor) {
                handleCloseEditor();
                return;
            }

            if (currentPath === '/') {
                handleCloseDialog();
            } else {
                const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                setCurrentPath(parentPath);
                fetchFiles(selectedContainer.Id, parentPath);
            }
        };

        window.addEventListener('popstate', handleNavigation);
        return () => window.removeEventListener('popstate', handleNavigation);
    }, [openDialog, openEditor, currentPath, selectedContainer]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!openDialog || openEditor || isRenaming) return;

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();

            if (!key.match(/^[a-z0-9]$/)) return;

            setSearchString(prev => {
                const newSearch = prev + key;

                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }

                const timeout = setTimeout(() => {
                    setSearchString('');
                }, 1000);
                setSearchTimeout(timeout);

                const matchingFile = files.find(file =>
                    file.name.toLowerCase().startsWith(newSearch)
                );

                if (matchingFile) {
                    setSelectedFile(matchingFile);

                    requestAnimationFrame(() => {
                        const selectedElement = document.querySelector(`.${classes.selectedItem}`);
                        const fileList = document.querySelector(`.${classes.fileList}`);

                        if (selectedElement && fileList) {
                            const toolbarHeight = 64;
                            const elementRect = selectedElement.getBoundingClientRect();
                            const listRect = fileList.getBoundingClientRect();
                            const topOffset = listRect.top + toolbarHeight;

                            if (elementRect.top < topOffset) {
                                selectedElement.scrollIntoView(true);
                                fileList.scrollTop -= (toolbarHeight + 40); 
                            }
                            selectedElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    });
                }

                return newSearch;
            });
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [openDialog, openEditor, isRenaming, files, searchTimeout, classes.selectedItem, classes.fileList]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (permissionsDialog) return;
            
            if (!openDialog || openEditor) return;

            if (e.key === 'Enter' && selectedFile) {
                e.preventDefault();
                e.stopPropagation();
                handleFileDoubleClick(selectedFile);
            }

            if (e.key === 'Backspace' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                document.querySelector(`.${classes.backButton}`)?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [openDialog, openEditor, selectedFile, classes.backButton, permissionsDialog]);

    const handleContainerClick = async (container) => {
        try {
            if (container.State !== 'running') {
                try {
                    await axios.post(`${INTERNAL_API_URL}/api/containers/${container.Id}/start`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await fetchContainers();
                } catch (error) {
                    setError(`Error starting container: ${error.message}`);
                    return;
                }
            }

            const response = await axios.get(
                `${INTERNAL_API_URL}/api/containers/${container.Id}/files`,
                { params: { path: '/' } }  
            );

            if (response.status === 200) {
                setSelectedContainer(container);
                setCurrentPath('/');
                setFiles(response.data);
                setOpenDialog(true);
                window.history.pushState({ type: 'container', path: '/' }, '');
            }
        } catch (error) {
            const message = error.response?.data?.details || error.message;
            setError(`Error accessing container: ${message}`);
            return;
        }
    };

    const fetchFiles = async (containerId, path) => {
        try {
            const containersResponse = await axios.get(`${INTERNAL_API_URL}/api/containers`);
            const containerExists = containersResponse.data.some(c => c.Id === containerId);

            if (!containerExists) {
                localStorage.removeItem('currentPath');
                localStorage.removeItem('selectedContainer');
                setCurrentPath('/');
                setSelectedContainer(null);
                setOpenDialog(false);
                setFiles([]);
                throw new Error('Container no longer exists or was recreated');
            }

            const response = await axios.get(`${INTERNAL_API_URL}/api/containers/${containerId}/files`, {
                params: { path }
            });
            const filteredFiles = response.data.filter(file => {
                return !file.name.startsWith('.') &&
                    !file.name.includes('.DS_Store') &&
                    file.name !== 'Thumbs.db' &&
                    file.name !== 'desktop.ini';
            });
            setFiles(filteredFiles);
        } catch (error) {
            console.error('Error fetching files:', error);
            if (error.message === 'Container no longer exists or was recreated') {
                showErrorMessage('Container no longer exists or was recreated. Please select a container again.');
            }
        }
    };

    const handleFileClick = (file) => {
        if (selectedFile?.name === file.name) {
            setSelectedFile(null);
        } else {
            setSelectedFile(file);
        }
    };

    const handleFileDoubleClick = async (file) => {
        if (isRenaming) return;

        setPermissionsDialog(false);

        if (file.type === 'directory') {
            setSelectedFile(null);
            const newPath = currentPath === '/'
                ? `/${file.name}`
                : `${currentPath}/${file.name}`;
            setCurrentPath(newPath);
            try {
                await fetchFiles(selectedContainer.Id, newPath);
                window.history.pushState({ type: 'directory', path: newPath }, '', window.location.pathname);
            } catch (error) {
                showErrorMessage('Error accessing directory: ' + error.message);
            }
        } else {
            try {
                const filePath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${file.name}`;
                const response = await axios.get(
                    `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/files/content`,
                    {
                        params: { path: filePath },
                        headers: {
                            'Accept': 'text/plain'
                        },
                        transformResponse: [(data) => {
                            return data;
                        }]
                    }
                );

                if (response.status === 200) {
                    setFileContent(response.data);
                    setOriginalContent(response.data); 
                    setSelectedFile(file);
                    setOpenEditor(true);
                    window.history.pushState({ type: 'editor', path: currentPath }, '');
                } else {
                    throw new Error('Failed to load file content');
                }
            } catch (error) {
                const message = error.response?.data?.error || error.message;
                showErrorMessage('Error opening file: ' + message);
            }
        }
    };

    const handleBack = () => {
        if (openEditor) {
            handleCloseEditor();
            return;
        }

        if (currentPath === '/') {
            handleCloseDialog();
            window.history.pushState(null, '', window.location.pathname);
        } else {
            const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
            setCurrentPath(parentPath);
            fetchFiles(selectedContainer.Id, parentPath);
            window.history.pushState(
                { type: 'directory', path: parentPath },
                '',
                window.location.pathname
            );
        }
        setPermissionsDialog(false);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedContainer(null);
        setFiles([]);
        setCurrentPath('/');
        localStorage.removeItem('currentPath');
        localStorage.removeItem('selectedContainer');
        setPermissionsDialog(false);
    };

    const handleCloseEditor = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedDialog(true);
        } else {
            closeEditorWithoutSaving();
        }
        setPermissionsDialog(false);
    };

    const closeEditorWithoutSaving = () => {
        setOpenEditor(false);
        setFileContent('');
        setOriginalContent('');
        setShowUnsavedDialog(false);
        setPermissionsDialog(false);
    };

    const handleDownload = async () => {
        if (!selectedFile) return;

        try {
            const response = await axios.get(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/download`,
                {
                    params: {
                        path: `${currentPath}/${selectedFile.name}`,
                        isDirectory: selectedFile.type === 'directory'
                    },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${selectedFile.name}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showErrorMessage('Error downloading: ' + error.message);
        }
    };

    const handleSaveFile = async () => {
        setSaving(true);
        try {
            const response = await axios.put(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/files`,
                {
                    path: `${currentPath}/${selectedFile.name}`,
                    content: fileContent,
                    restart: restartOnSave
                }
            );

            showSuccessMessage('File saved successfully');

            setOriginalContent(fileContent);

            if (response.data.restarted) {
                showSuccessMessage('Container restarted successfully');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                await fetchFiles(selectedContainer.Id, currentPath);

                if (response.data.size) {
                    setSelectedFile(prev => ({
                        ...prev,
                        size: response.data.size
                    }));
                }

                setTimeout(() => {
                    setSaving(false);
                }, 500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.details || error.message;
            showErrorMessage('Error saving file: ' + errorMessage);
            setSaving(false);
        }
    };

    const isArtifact = (container) => {
        const name = container.Names[0].toLowerCase();
        return name.includes('dockerflex-') ||
            name.includes('buildx_buildkit');
    };

    const handleDeleteFile = async () => {
        if (!selectedFile) return;

        try {
            const fullPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${selectedFile.name}`;
            await axios.delete(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/files`,
                {
                    data: {
                        path: fullPath,
                        isDirectory: selectedFile.type === 'directory'
                    }
                }
            );
            await fetchFiles(selectedContainer.Id, currentPath);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const handleRenameClick = () => {
        if (selectedFile) {
            setNewFileName(selectedFile.name);
            setIsRenaming(true);
        }
    };

    const handleRename = async () => {
        if (!selectedFile || !newFileName) return;

        try {
            const oldPath = `${currentPath}/${selectedFile.name}`;
            const newPath = `${currentPath}/${newFileName}`;

            await axios.put(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/files/rename`, {
                oldPath,
                newPath
            });

            await fetchFiles(selectedContainer.Id, currentPath);
            setSelectedFile(null);
            setIsRenaming(false);
            showSuccessMessage('File renamed successfully');
        } catch (error) {
            showErrorMessage('Error renaming file: ' + (error.response?.data?.error || error.message));
        }
    };

    const showErrorMessage = (message) => {
        setError(message);
        setTimeout(() => setError(null), 3000);
    };

    const showSuccessMessage = (message) => {
        setErrorMessage(message);
        setShowError(true);
        setMessageType('success');
    };

    const getContainerStyle = (container) => {
        return isArtifact(container)
            ? classes.artifactContainer
            : classes.normalContainer;
    };

    const sortContainers = (containers) => {
        return [...containers].sort((a, b) => {
            const isRed = (container) => {
                const name = container.Names[0].toLowerCase();
                return name.includes('dockerflex-') || name.includes('buildx_buildkit');
            };

            const aIsRed = isRed(a);
            const bIsRed = isRed(b);
            const aIsRunning = a.State === 'running';
            const bIsRunning = b.State === 'running';

            if (aIsRed !== bIsRed) {
                return aIsRed ? 1 : -1;
            }

            if (aIsRunning !== bIsRunning) {
                return aIsRunning ? -1 : 1;
            }

            return a.Names[0].localeCompare(b.Names[0]);
        });
    };




    const getAllFilesFromDirectory = async (dirEntry, basePath = '') => {
        const files = [];
        const reader = dirEntry.createReader();

        const readEntries = async () => {
            const entries = await new Promise((resolve) => {
                reader.readEntries(resolve);
            });

            if (entries.length > 0) {
                for (const entry of entries) {
                    if (entry.name.startsWith('.') ||
                        entry.name.includes('.DS_Store') ||
                        entry.name === 'Thumbs.db' ||
                        entry.name === 'desktop.ini') {
                        continue;
                    }

                    if (entry.isFile) {
                        const file = await new Promise(resolve => entry.file(resolve));
                        file.originalPath = basePath + entry.name;
                        files.push(file);
                    } else if (entry.isDirectory) {
                        const subFiles = await getAllFilesFromDirectory(
                            entry,
                            `${basePath}${entry.name}/`
                        );
                        files.push(...subFiles);
                    }
                }
                await readEntries();
            }
        };

        await readEntries();
        return files;
    };

    const getAppBarClass = () => {
        if (!selectedContainer) return '';
        return isArtifact(selectedContainer)
            ? classes.appBarArtifact
            : classes.appBarNormal;
    };

    const handleDialogClose = (event, reason) => {
        if (reason === 'escapeKeyDown') {
            return;
        }
        handleCloseDialog();
    };

    const handleEditorDialogClose = (event, reason) => {
        if (reason === 'escapeKeyDown') {
            return;
        }
        handleCloseEditor();
    };

    const handleUploadClick = () => {
        setOpenUploadDialog(true);
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        const newItems = files
            .filter(file => {
                return !file.name.startsWith('.') &&
                    !file.name.includes('.DS_Store') &&
                    file.name !== 'Thumbs.db' &&
                    file.name !== 'desktop.ini';
            })
            .map(file => {
                const cleanedName = cleanFileName(file.name);
                return {
                    file,
                    path: `${currentPath}/${cleanedName}`,
                    type: 'file',
                    displayName: cleanedName
                };
            });
        setUploadQueue(prev => [...prev, ...newItems]);
    };

    const handleFolderSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const filesByPath = files.reduce((acc, file) => {
            if (!file.webkitRelativePath) return acc;

            const pathParts = file.webkitRelativePath.split('/');
            const folderName = pathParts[0];
            const relativePath = pathParts.slice(1).join('/');

            if (!acc[folderName]) {
                acc[folderName] = [];
            }

            if (!file.name.startsWith('.') &&
                !file.name.includes('.DS_Store') &&
                file.name !== 'Thumbs.db' &&
                file.name !== 'desktop.ini') {
                acc[folderName].push({
                    file,
                    relativePath
                });
            }

            return acc;
        }, {});

        const folderName = Object.keys(filesByPath)[0];
        if (folderName && filesByPath[folderName]) {
            const folderFiles = filesByPath[folderName];
            const newItems = folderFiles.map(({ file, relativePath }) => ({
                file,
                path: `${currentPath}/${folderName}/${relativePath}`,
                type: 'file',
                displayName: file.name
            }));

            setUploadQueue(prev => [...prev, ...newItems]);
        }
    };

    const handleUpload = async () => {
        if (uploadQueue.length === 0) return;

        const formData = new FormData();
        uploadQueue.forEach((item, index) => {
            if (item.file) {
                formData.append('files[]', item.file);
            }
            formData.append(`paths[${index}]`, item.path);
            formData.append(`types[${index}]`, item.type);
        });

        try {
            const response = await axios.post(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            showSuccessMessage(`Successfully uploaded ${response.data.results.length} items`);
            setUploadQueue([]);
            setOpenUploadDialog(false);
            await fetchFiles(selectedContainer.Id, currentPath);
        } catch (error) {
            showErrorMessage('Error uploading: ' + error.message);
        }
    };

    const UploadDialog = () => {
        const classes = useStyles();
        const [isDragging, setIsDragging] = useState(false);

        const handleClose = () => {
            setOpenUploadDialog(false);
            setUploadQueue([]);
        };

        const handleDragEnter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const { clientX: x, clientY: y } = e;

            if (
                x <= rect.left ||
                x >= rect.right ||
                y <= rect.top ||
                y >= rect.bottom
            ) {
                setIsDragging(false);
            }
        };

        const handleDrop = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const items = Array.from(e.dataTransfer.items);

            const filePromises = items
                .filter(item => item.kind === 'file' && item.webkitGetAsEntry()?.isFile)
                .map(item => item.getAsFile());

            if (filePromises.length === 0) {
                showErrorMessage('Please use the folder selection button to upload folders');
                return;
            }

            handleFileSelect({
                target: {
                    files: filePromises
                }
            });
        };

        return (
            <Dialog
                open={openUploadDialog}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                className={classes.uploadDialog}
            >
                <DialogTitle style={{ borderBottom: '1px solid #30363d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e6edf3' }}>
                        <UploadIcon />
                        Upload Files
                    </div>
                </DialogTitle>
                <DialogContent dividers>
                    <div
                        className={`${classes.uploadDropZone} ${isDragging ? 'dragging' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                    >
                        <CloudUpload style={{ fontSize: 48, marginBottom: 16 }} />
                        <Typography variant="h6">
                            Drag & Drop Files Here
                        </Typography>
                        <Typography variant="body2" style={{ color: '#8b949e' }}>
                            or click to select files (use the button below for folders)
                        </Typography>
                    </div>

                    <Divider style={{ margin: '16px 0', backgroundColor: '#30363d' }} />

                    <div style={{ textAlign: 'center' }}>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <input
                            type="file"
                            webkitdirectory="true"
                            directory="true"
                            onChange={handleFolderSelect}
                            style={{ display: 'none' }}
                            id="folder-input"
                        />
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<CreateNewFolderIcon style={{ color: '#e6edf3' }} />}
                            onClick={() => document.getElementById('folder-input').click()}
                            style={{ width: '200px' }}
                        >
                            Select Folder
                        </Button>
                        <Typography variant="caption" style={{ display: 'block', marginTop: '8px', color: '#8b949e' }}>
                            Select a single folder to upload its contents
                        </Typography>
                    </div>

                    {}
                    {uploadQueue.length > 0 && (
                        <>
                            <Typography variant="subtitle1" style={{ marginTop: '24px', color: '#e6edf3' }}>
                                Upload Queue ({uploadQueue.length} items)
                            </Typography>
                            <List className={classes.uploadList}>
                                {uploadQueue.map((item, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => setUploadQueue(prev => prev.filter((_, i) => i !== index))}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <InsertDriveFileIcon className={classes.uploadListIcon} />
                                        <ListItemText
                                            primary={item.displayName}
                                            secondary={item.path}
                                            style={{ wordBreak: 'break-all' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions className={classes.uploadActions}>
                    <Button onClick={handleClose} style={{ color: '#8b949e' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={uploadQueue.length === 0}
                        startIcon={<CloudUpload style={{ color: '#ffffff' }} />}
                    >
                        Upload ({uploadQueue.length} items)
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    useEffect(() => {
        const loadInitialState = async () => {
            if (selectedContainer) {
                try {
                    const response = await axios.get(`${INTERNAL_API_URL}/api/containers`);
                    const currentContainer = response.data.find(c => c.Id === selectedContainer.Id);

                    if (!currentContainer) {
                        throw new Error('Container not found or recreated');
                    }

                    await fetchFiles(selectedContainer.Id, currentPath);
                    setOpenDialog(true);
                } catch (error) {
                    console.error('Error loading initial state:', error);
                    localStorage.removeItem('currentPath');
                    localStorage.removeItem('selectedContainer');
                    setCurrentPath('/');
                    setSelectedContainer(null);
                    setOpenDialog(false);
                    setFiles([]);

                    showErrorMessage('Container no longer exists or was recreated. Please select a container again.');
                }
            }
        };

        loadInitialState();
    }, []);

    useEffect(() => {
        if (currentPath) {
            localStorage.setItem('currentPath', currentPath);
        }
    }, [currentPath]);

    useEffect(() => {
        if (selectedContainer) {
            localStorage.setItem('selectedContainer', JSON.stringify(selectedContainer));
        }
    }, [selectedContainer]);

    useEffect(() => {
        const getHostInfo = async () => {
            try {
                if (import.meta.env.VITE_HOSTNAME) {
                    setHostInfo(import.meta.env.VITE_HOSTNAME);
                    return;
                }

                const response = await axios.get(`${INTERNAL_API_URL}/api/hostname`);
                setHostInfo(response.data.hostname);
            } catch (error) {
                console.error('Error fetching host info:', error);
                setHostInfo('Docker Desktop');
            }
        };

        getHostInfo();
    }, []);

    const handleNewItemClick = (event) => {
        if (mobileMenuAnchor) {
            handleMobileMenuClose();
        }
        setNewItemAnchorEl(event.currentTarget);
    };

    const handleNewItemClose = () => {
        setNewItemAnchorEl(null);
    };

    const handleNewItemTypeSelect = (type) => {
        setNewItemType(type);
        setNewItemDialog(true);
        setNewItemAnchorEl(null);
        setNewItemName('');
        setNewFileContent('');
    };

    const handleNewItemCreate = async () => {
        try {
            const cleanedName = cleanFileName(newItemName);
            if (!cleanedName) {
                showErrorMessage('Please enter a valid name');
                return;
            }

            if (newItemType === 'folder') {
                await axios.post(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/create-folder`, {
                    path: `${currentPath}/${cleanedName}`
                });
            } else {
                await axios.post(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/create-file`, {
                    path: `${currentPath}/${cleanedName}`,
                    content: newFileContent
                });
            }

            await fetchFiles(selectedContainer.Id, currentPath);
            setNewItemDialog(false);
            setNewItemName('');
            setNewFileContent('');
            showSuccessMessage(`${newItemType === 'folder' ? 'Folder' : 'File'} created successfully`);
        } catch (error) {
            showErrorMessage('Error creating ' + newItemType + ': ' + (error.response?.data?.error || error.message));
        }
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchor(null);
    };

    const handleListItemClick = (file) => {
        if (isRenaming) return;

        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        if (window.innerWidth <= 600) {
            if (selectedFile?.name === file.name) {
                if (timeDiff < 300) {
                    handleFileDoubleClick(file);
                } else {
                    setSelectedFile(null);
                }
            } else {
                handleFileClick(file);
            }
        } else {
            handleFileClick(file);
        }

        setLastClickTime(currentTime);
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchToggle = () => {
        if (!searchExpanded) {
            setSearchExpanded(true);
            setTimeout(() => document.getElementById('search-input')?.focus(), 100);
        } else if (!searchQuery) {
            setSearchExpanded(false);
        }
    };

    const handleSearchBlur = () => {
        if (!searchQuery) {
            setSearchExpanded(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            setSearchExpanded(false);
        }
    };

    useEffect(() => {
        setSearchQuery('');
        setSearchExpanded(false);
    }, [currentPath]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const tooltip = document.querySelector('.cm-tooltip-hover');
        if (tooltip) {
            tooltip.classList.add('visible');

            requestAnimationFrame(() => {
                tooltip.style.left = `${x - (tooltip.offsetWidth / 2)}px`;
                tooltip.style.top = `${y - 40}px`;
            });
        }

        const handleMouseLeave = () => {
            if (tooltip) {
                tooltip.classList.remove('visible');
            }
        };

        e.currentTarget.addEventListener('mouseleave', handleMouseLeave, { once: true });
    };

    const handleCopy = async () => {
        if (!selectedFile) return;

        try {
            const basePath = currentPath;
            const sourcePath = `${basePath}/${selectedFile.name}`;

            let targetName = selectedFile.name;
            const ext = targetName.includes('.') ? `.${targetName.split('.').pop()}` : '';
            const baseName = targetName.includes('.') ? targetName.slice(0, -ext.length) : targetName;

            let copyIndex = 0;
            let newName = `${baseName} (copy)${ext}`;

            while (files.some(f => f.name === newName)) {
                copyIndex++;
                newName = `${baseName} (copy-${copyIndex})${ext}`;
            }

            const targetPath = `${basePath}/${newName}`;

            await axios.post(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/copy`, {
                sourcePath,
                targetPath,
                isDirectory: selectedFile.type === 'directory'
            });

            await fetchFiles(selectedContainer.Id, currentPath);

            setSelectedFile(null);

            setMessageType('success');
            setErrorMessage(`Successfully copied ${selectedFile.name}`);
            setShowError(true);
        } catch (error) {
            console.error('Copy error:', error);
            setError(error.response?.data?.error || 'Failed to copy item');
        }
    };

    const hasUnsavedChanges = () => {
        return fileContent !== originalContent;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && openEditor) {
                e.preventDefault();
                handleCloseEditor();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openEditor, fileContent, originalContent]);

    const handleDragStart = (e, file) => {
        e.dataTransfer.setData('text/plain', file.name);
        setDraggedItem(file);
    };

    const handleDragOver = (e, file) => {
        e.preventDefault();
        if (file.type === 'directory' && draggedItem?.name !== file.name) {
            setDragOverItem(file);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOverItem(null);
    };

    const handleDrop = async (e, targetFolder) => {
        e.preventDefault();
        setDragOverItem(null);

        if (!draggedItem || draggedItem.name === targetFolder.name) {
            setDraggedItem(null);  
            return;
        }

        try {
            const sourcePath = `${currentPath}/${draggedItem.name}`;
            const targetPath = `${currentPath}/${targetFolder.name}/${draggedItem.name}`;

            await axios.post(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/move`, {
                sourcePath,
                targetPath,
                isDirectory: draggedItem.type === 'directory'
            });

            await fetchFiles(selectedContainer.Id, currentPath);
            setSelectedFile(null);
            showSuccessMessage(`Successfully moved ${draggedItem.name} to ${targetFolder.name}`);
        } catch (error) {
            showErrorMessage('Error moving file: ' + (error.response?.data?.error || error.message));
        }

        setDraggedItem(null);  
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleParentDragOver = (e) => {
        e.preventDefault();
        if (draggedItem && currentPath !== '/') {
            setIsParentDragOver(true);
        }
    };

    const handleParentDragLeave = (e) => {
        e.preventDefault();
        setIsParentDragOver(false);
    };

    const handleParentDrop = async (e) => {
        e.preventDefault();
        setIsParentDragOver(false);

        if (!draggedItem || currentPath === '/') {
            setDraggedItem(null);
            return;
        }

        try {
            const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
            const sourcePath = `${currentPath}/${draggedItem.name}`;
            const targetPath = `${parentPath}/${draggedItem.name}`;

            await axios.post(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/move`, {
                sourcePath,
                targetPath,
                isDirectory: draggedItem.type === 'directory'
            });

            await fetchFiles(selectedContainer.Id, currentPath);
            setSelectedFile(null);
            showSuccessMessage(`Successfully moved ${draggedItem.name} to parent folder`);
        } catch (error) {
            showErrorMessage('Error moving file: ' + (error.response?.data?.error || error.message));
        }

        setDraggedItem(null);
    };

    const handlePermissionsKeyDown = (event) => {
        if (event.key === 'Escape') {
            setPermissionsDialog(false);
        } else if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            event.stopPropagation();
            handlePermissionsSave();
        }
    };

    <Dialog
        open={permissionsDialog}
        onClose={() => setPermissionsDialog(false)}
        className={classes.newItemDialog}
        maxWidth="sm"
        fullWidth
        onKeyDown={handlePermissionsKeyDown}
    >
        <DialogTitle style={{ 
            borderBottom: '1px solid #30363d',
            color: '#e6edf3'
        }}>
            File Permissions - {selectedFile?.name}
        </DialogTitle>
        <DialogContent style={{ paddingTop: '20px' }}>
            {}
        </DialogContent>
    </Dialog>

    return (
        <React.Fragment>
            {isLoading ? (
                <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    minHeight="100vh"
                    className={classes.root}
                >
                    <CircularProgress style={{ color: '#f0883e' }} />
                </Box>
            ) : showAuthDialog ? (
                <Dialog
                    open={showAuthDialog}
                    className={classes.authDialog}
                    maxWidth="sm"
                    fullWidth
                    disableEscapeKeyDown
                >
                    <DialogTitle>
                        <div className={classes.titleContainer}>
                            <Typography variant="h4">
                                DockerFlex
                            </Typography>
                            <Tooltip title="View on GitHub" arrow>
                                <IconButton
                                    className={classes.githubButton}
                                    onClick={() => window.open('https://github.com/mbakgun/dockerflex', '_blank')}
                                >
                                    <GitHubIcon />
                                </IconButton>
                            </Tooltip>
                            <span className={classes.version}>v1.0.1</span>
                        </div>
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            id="MASTER_PASSWORD"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAuthentication();
                                }
                            }}
                            className={classes.authInput}
                            label="Password"
                            variant="outlined"
                            fullWidth
                            autoFocus
                        />
                        {authError && (
                            <Typography className={classes.authError}>
                                {authError}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleAuthentication}
                            disabled={!password}
                            className={classes.authButton}
                            variant="contained"
                        >
                            LOGIN
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : (
                <Container className={classes.root} maxWidth="xl">
                    <Box className={classes.headerContainer}>
                        <Grow in timeout={1000}>
                            <div className={classes.titleContainer}>
                                <Typography variant="h4">
                                    DockerFlex
                                </Typography>
                                <Tooltip title="View on GitHub" arrow>
                                    <IconButton
                                        className={classes.githubButton}
                                        onClick={() => window.open('https://github.com/mbakgun/dockerflex', '_blank')}
                                    >
                                        <GitHubIcon />
                                    </IconButton>
                                </Tooltip>
                                <span className={classes.version}>v1.0.1</span>
                            </div>
                        </Grow>

                        <Divider className={classes.divider} />
                        
                        <Typography variant="subtitle1" className={classes.hostInfo}>
                            Host: {hostInfo}
                        </Typography>

                        <div className={classes.statsContainer}>
                            <div className={classes.statItem}>
                                <Typography className={classes.statValue}>
                                    {containers.filter(c => c.State === 'running').length}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    Running
                                </Typography>
                            </div>

                            <div className={classes.statItem}>
                                <Typography className={classes.statValue}>
                                    {containers.filter(c => c.State !== 'running').length}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    Stopped
                                </Typography>
                            </div>

                            <div className={classes.statItem}>
                                <Typography className={classes.statValue}>
                                    {containers.length}
                                </Typography>
                                <Typography className={classes.statLabel}>
                                    Total
                                </Typography>
                            </div>
                        </div>
                    </Box>

                    <Grid container spacing={3}>
                        {sortContainers(containers).map((container, index) => (
                            <Grid item xs={12} sm={6} md={4} key={container.Id}>
                                <Fade in timeout={500 * (index + 1)}>
                                    <Paper
                                        elevation={3}
                                        className={`${classes.card} ${getContainerStyle(container)}`}
                                        onClick={() => handleContainerClick(container)}
                                        style={{
                                            cursor: 'pointer',
                                            opacity: container.State === 'running' ? 1 : 0.8
                                        }}
                                    >
                                        <CardContent className={classes.cardContent}>
                                            <div className={classes.containerName}>
                                                <CodeIcon />
                                                <Typography variant="h6" component="h2">
                                                    {container.Names[0].replace('/', '')}
                                                </Typography>
                                            </div>

                                            <div className={classes.statusChip}>
                                                <div className={classes.statusText}>
                                                    {container.State === 'running' ? (
                                                        <RunningIcon style={{ fontSize: 20, color: '#4caf50' }} />
                                                    ) : (
                                                        <StoppedIcon style={{ fontSize: 20, color: '#f44336' }} />
                                                    )}
                                                    Status: {container.State}
                                                    {container.State !== 'running' && (
                                                        <Typography variant="caption"
                                                            style={{ marginLeft: 8, color: '#e6edf3' }}>
                                                            (Click to start)
                                                        </Typography>
                                                    )}
                                                </div>
                                            </div>

                                            <Typography className={classes.imageInfo}>
                                                {container.Image}
                                            </Typography>
                                        </CardContent>
                                    </Paper>
                                </Fade>
                            </Grid>
                        ))}
                    </Grid>

                    <Dialog
                        fullScreen
                        open={openDialog}
                        onClose={handleDialogClose}
                        TransitionProps={{
                            timeout: 0,
                        }}
                        className={classes.dialogTransition}
                    >
                        <AppBar
                            className={`${classes.appBar} ${getAppBarClass()}`}
                            style={{ transition: 'none' }}
                        >
                            <Toolbar className={classes.toolbar}>
                                <div
                                    className={`${classes.navigationArea} ${isParentDragOver ? 'dragOver' : ''}`}
                                    onDragOver={handleParentDragOver}
                                    onDragLeave={handleParentDragLeave}
                                    onDrop={handleParentDrop}
                                >
                                    <Tooltip title="Go Back (Backspace)" arrow>
                                        <IconButton
                                            color="inherit"
                                            onClick={handleBack}
                                            className={`${classes.backButton} ${isParentDragOver ? classes.dropToParent : ''}`}
                                        >
                                            <ArrowBack />
                                        </IconButton>
                                    </Tooltip>
                                    <Typography variant="h6">
                                        {selectedContainer?.Names[0]} - Files
                                    </Typography>
                                    <Typography
                                        className={classes.breadcrumb}
                                    >
                                        {currentPath}
                                    </Typography>
                                </div>
                                {}
                                <div className={classes.toolbarActions}>
                                    {}
                                    <div className={`${classes.searchContainer} ${searchExpanded ? 'expanded' : ''}`}>
                                        <IconButton
                                            size="small"
                                            color="inherit"
                                            onClick={handleSearchToggle}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                        <input
                                            id="search-input"
                                            type="text"
                                            placeholder={searchExpanded ? "Search current folder..." : ""}
                                            className={`${classes.searchInput} ${searchExpanded ? 'expanded' : ''}`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onBlur={handleSearchBlur}
                                            onKeyDown={handleSearchKeyDown}
                                        />
                                        {searchExpanded && searchQuery && (
                                            <IconButton
                                                size="small"
                                                color="inherit"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    document.getElementById('search-input')?.focus();
                                                }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )}
                                    </div>

                                    {}
                                    <div style={{
                                        width: '1px',
                                        height: '20px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        margin: '0 4px'
                                    }} />

                                    {}
                                    <div style={{
                                        display: 'flex',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        padding: '2px 6px',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Tooltip title="Create New" arrow>
                                            <IconButton
                                                size="small"
                                                color="inherit"
                                                onClick={handleNewItemClick}
                                                style={{ margin: '0 2px' }}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Menu
                                            anchorEl={newItemAnchorEl}
                                            keepMounted
                                            open={Boolean(newItemAnchorEl)}
                                            onClose={handleNewItemClose}
                                            PaperProps={{
                                                style: {
                                                    backgroundColor: '#21262d',
                                                    color: '#e6edf3',
                                                    border: '1px solid #30363d',
                                                },
                                            }}
                                        >
                                            <MenuItem onClick={() => handleNewItemTypeSelect('folder')}
                                                style={{ color: '#e6edf3' }}>
                                                <CreateNewFolderIcon style={{ marginRight: 8 }} />
                                                New Folder
                                            </MenuItem>
                                            <MenuItem onClick={() => handleNewItemTypeSelect('file')}
                                                style={{ color: '#e6edf3' }}>
                                                <NoteAddIcon style={{ marginRight: 8 }} />
                                                New File
                                            </MenuItem>
                                        </Menu>
                                        <Tooltip title="Upload Files/Folders" arrow>
                                            <IconButton
                                                size="small"
                                                color="inherit"
                                                onClick={handleUploadClick}
                                                style={{ margin: '0 2px' }}
                                            >
                                                <CloudUpload />
                                            </IconButton>
                                        </Tooltip>
                                    </div>

                                    {}
                                    <div style={{
                                        width: '1px',
                                        height: '20px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        margin: '0 4px'
                                    }} />

                                    {}
                                    <div style={{
                                        display: 'flex',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        padding: '2px 4px',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Tooltip title="Download Selected" arrow>
                                            <span style={{ margin: '0 2px' }}>
                                                <IconButton
                                                    size="small"
                                                    color="inherit"
                                                    disabled={!selectedFile}
                                                    onClick={handleDownload}
                                                >
                                                    <GetApp />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title="Rename Selected" arrow>
                                            <span style={{ margin: '0 2px' }}>
                                                <IconButton
                                                    size="small"
                                                    color="inherit"
                                                    disabled={!selectedFile}
                                                    onClick={handleRenameClick}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title="Delete Selected" arrow>
                                            <span style={{ margin: '0 2px' }}>
                                                <IconButton
                                                    size="small"
                                                    color="inherit"
                                                    disabled={!selectedFile}
                                                    onClick={handleDeleteFile}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title="Copy Selected" arrow>
                                            <span style={{ margin: '0 2px' }}>
                                                <IconButton
                                                    size="small"
                                                    color="inherit"
                                                    disabled={!selectedFile}
                                                    onClick={handleCopy}
                                                >
                                                    <FileCopyIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        {}
                                        <Tooltip title="Permissions" arrow>
                                            <span style={{ margin: '0 2px' }}>
                                                <IconButton
                                                    size="small"
                                                    color="inherit"
                                                    disabled={!selectedFile}
                                                    onClick={handlePermissionsClick}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </div>

                                    {}
                                    <div style={{
                                        width: '1px',
                                        height: '20px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        margin: '0 4px'
                                    }} />

                                    {}
                                    <div style={{
                                        display: 'flex',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        borderRadius: '4px',
                                        padding: '2px',
                                        alignItems: 'center'
                                    }}>
                                        <Tooltip title="Close" arrow>
                                            <IconButton
                                                size="small"
                                                color="inherit"
                                                onClick={handleCloseDialog}
                                                style={{ margin: '0 2px' }}
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>

                                {}
                                <IconButton
                                    className={classes.mobileMenuButton}
                                    color="inherit"
                                    onClick={handleMobileMenuOpen}
                                    edge="end"
                                >
                                    <MenuIcon />
                                </IconButton>

                                {}
                                <Menu
                                    anchorEl={mobileMenuAnchor}
                                    keepMounted
                                    open={Boolean(mobileMenuAnchor)}
                                    onClose={handleMobileMenuClose}
                                    className={classes.mobileMenu}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            handleMobileMenuClose();
                                            setMobileSearchDialog(true);
                                        }}
                                        className={classes.mobileMenuItem}
                                    >
                                        <ListItemIcon>
                                            <SearchIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Search Files" />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            handleNewItemTypeSelect('file');
                                            handleMobileMenuClose();
                                        }}
                                        className={classes.mobileMenuItem}
                                    >
                                        <ListItemIcon>
                                            <NoteAddIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="New File" />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            handleNewItemTypeSelect('folder');
                                            handleMobileMenuClose();
                                        }}
                                        className={classes.mobileMenuItem}
                                    >
                                        <ListItemIcon>
                                            <CreateNewFolderIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="New Folder" />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            handleUploadClick();
                                            handleMobileMenuClose();
                                        }}
                                        className={classes.mobileMenuItem}
                                    >
                                        <ListItemIcon>
                                            <CloudUpload />
                                        </ListItemIcon>
                                        <ListItemText primary="Upload" />
                                    </MenuItem>
                                    {selectedFile && (
                                        <>
                                            <Divider />
                                            <MenuItem
                                                onClick={() => {
                                                    handleDownload();
                                                    handleMobileMenuClose();
                                                }}
                                                className={classes.mobileMenuItem}
                                            >
                                                <ListItemIcon>
                                                    <GetApp />
                                                </ListItemIcon>
                                                <ListItemText primary="Download" />
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleRenameClick();
                                                    handleMobileMenuClose();
                                                }}
                                                className={classes.mobileMenuItem}
                                            >
                                                <ListItemIcon>
                                                    <Edit />
                                                </ListItemIcon>
                                                <ListItemText primary="Rename" />
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleDeleteFile();
                                                    handleMobileMenuClose();
                                                }}
                                                className={classes.mobileMenuItem}
                                            >
                                                <ListItemIcon>
                                                    <Delete />
                                                </ListItemIcon>
                                                <ListItemText primary="Delete" />
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    handleCopy();
                                                    handleMobileMenuClose();
                                                }}
                                                className={classes.mobileMenuItem}
                                            >
                                                <ListItemIcon>
                                                    <FileCopyIcon />
                                                </ListItemIcon>
                                                <ListItemText primary="Copy" />
                                            </MenuItem>
                                        </>
                                    )}
                                </Menu>
                            </Toolbar>
                        </AppBar>
                        <List className={classes.fileList}>
                            {filteredFiles.map((file, index) => (
                                <ListItem
                                    button
                                    key={index}
                                    onClick={() => handleListItemClick(file)}
                                    onDoubleClick={() => window.innerWidth > 600 && handleFileDoubleClick(file)}
                                    className={`
                                        ${selectedFile?.name === file.name ? classes.selectedItem : ''} 
                                        ${classes.fileListItem}
                                        ${dragOverItem?.name === file.name ? classes.dragOver : ''}
                                        ${draggedItem?.name === file.name ? classes.dragging : ''}
                                    `}
                                    draggable={!isRenaming}
                                    onDragStart={(e) => handleDragStart(e, file)}
                                    onDragOver={(e) => handleDragOver(e, file)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, file)}
                                    onDragEnd={handleDragEnd}
                                >
                                    {isRenaming && selectedFile?.name === file.name ? (
                                        <TextField
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRename();
                                                }
                                            }}
                                            onBlur={handleRename}
                                            autoFocus
                                            fullWidth
                                            className={`${classes.renameTextField} ${classes.newItemContent}`}
                                            InputProps={{
                                                style: { color: '#ffffff' }
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        />
                                    ) : (
                                        <>
                                            {file.type === 'directory' ? (
                                                <Folder style={{ marginRight: 8, color: '#ffffff' }} />
                                            ) : (
                                                <InsertDriveFile style={{ marginRight: 8, color: '#ffffff' }} />
                                            )}
                                            <ListItemText
                                                primary={file.displayName || cleanFileName(file.name)}
                                                secondary={`Size: ${file.size} bytes`}
                                            />
                                        </>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Dialog>

                    <Dialog
                        fullScreen
                        open={openEditor}
                        onClose={handleEditorDialogClose}
                        disableEscapeKeyDown
                        className={classes.editorDialog}
                    >
                        <AppBar className={`${classes.appBar} ${classes.editorAppBar}`}>
                            <Toolbar className={`${classes.toolbar} ${classes.editorToolbar}`}>
                                <Typography variant="h6" style={{ color: '#e6edf3' }}>
                                    {selectedFile?.name}
                                </Typography>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={restartOnSave}
                                                onChange={(e) => setRestartOnSave(e.target.checked)}
                                                name="restartOnSave"
                                                className={classes.checkboxStyle}
                                            />
                                        }
                                        label="Restart container on save"
                                        className={classes.restartCheckbox}
                                    />
                                    <div className={classes.saveButtonWrapper}>
                                        <Button
                                            onClick={handleSaveFile}
                                            startIcon={!saving && <SaveIcon />}
                                            style={{
                                                backgroundColor: '#f0883e',
                                                color: '#ffffff',
                                            }}
                                            variant="contained"
                                            disabled={saving}
                                        >
                                            <span className={classes.saveButtonContent}>
                                                Save{hasUnsavedChanges() ? ' *' : ''}
                                            </span>
                                        </Button>
                                        {saving && (
                                            <CircularProgress
                                                size={24}
                                                className={classes.saveButtonProgress}
                                            />
                                        )}
                                    </div>
                                    <Tooltip title="Close (ESC)" arrow>
                                        <IconButton
                                            onClick={handleCloseEditor}
                                            style={{ color: '#e6edf3' }}
                                            edge="end"
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </Toolbar>
                        </AppBar>
                        <div className={classes.editorContainer}>
                            <CodeMirror
                                value={fileContent}
                                height="100%"
                                theme={oneDark}
                                onChange={(value) => setFileContent(value)}
                                onMouseMove={handleMouseMove}
                                extensions={[
                                    getFileLanguage(selectedFile?.name || '') || [],
                                    lintGutter(),
                                    createLinter(selectedFile?.name || '')
                                ].filter(Boolean)}
                                className={classes.editor}
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    history: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    defaultKeymap: true,
                                    searchKeymap: true,
                                    historyKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        </div>
                    </Dialog>

                    <Snackbar
                        open={showError}
                        autoHideDuration={6000}
                        onClose={() => setShowError(false)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    >
                        <Alert
                            onClose={() => setShowError(false)}
                            severity={messageType}
                        >
                            {errorMessage}
                        </Alert>
                    </Snackbar>

                    {uploadSuccess && (
                        <div className={classes.successMessage}>
                            Successfully uploaded: {uploadedFiles.join(', ')}
                        </div>
                    )}

                    <UploadDialog />

                    <Snackbar
                        open={!!error}
                        autoHideDuration={6000}
                        onClose={() => setError(null)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left'
                        }}
                        style={{
                            position: 'fixed',
                            zIndex: 9999,
                            left: 24
                        }}
                    >
                        <Alert
                            onClose={() => setError(null)}
                            severity="error"
                            variant="filled"
                            style={{
                                backgroundColor: '#d32f2f',
                                color: 'white',
                                width: '100%'
                            }}
                        >
                            {error}
                        </Alert>
                    </Snackbar>

                    <Dialog
                        open={newItemDialog}
                        onClose={() => setNewItemDialog(false)}
                        className={classes.newItemDialog}
                        maxWidth="sm"
                        fullWidth
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newItemName) {
                                e.preventDefault();
                                handleNewItemCreate();
                            }
                        }}
                    >
                        <DialogTitle style={{ borderBottom: '1px solid #30363d' }}>
                            {newItemType === 'folder' ? 'Create New Folder' : 'Create New File'}
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label={newItemType === 'folder' ? 'Folder Name' : 'File Name'}
                                type="text"
                                fullWidth
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className={`${classes.newItemTextField} ${classes.newItemContent}`}
                                variant="outlined"
                                style={{ marginTop: '16px' }}
                            />
                            {newItemType === 'file' && (
                                <TextField
                                    margin="dense"
                                    label="File Content"
                                    multiline
                                    rows={10}
                                    fullWidth
                                    value={newFileContent}
                                    onChange={(e) => setNewFileContent(e.target.value)}
                                    className={`${classes.newItemTextField} ${classes.newItemContent}`}
                                    variant="outlined"
                                    style={{ marginTop: '16px' }}
                                />
                            )}
                        </DialogContent>
                        <DialogActions style={{ borderTop: '1px solid #30363d', padding: '16px' }}>
                            <Button onClick={() => setNewItemDialog(false)} style={{ color: '#8b949e' }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleNewItemCreate}
                                disabled={!newItemName}
                                className={classes.saveButton}
                                variant="contained"
                            >
                                Create
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={mobileSearchDialog}
                        onClose={() => setMobileSearchDialog(false)}
                        fullWidth
                        maxWidth="sm"
                        className={classes.newItemDialog}
                    >
                        <DialogTitle>Search Files</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Search"
                                type="text"
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={classes.newItemTextField}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: searchQuery && (
                                        <IconButton
                                            size="small"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={showUnsavedDialog}
                        onClose={() => setShowUnsavedDialog(false)}
                        className={classes.newItemDialog}
                    >
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogContent>
                            <Typography>
                                You have unsaved changes. Are you sure you want to close the editor?
                            </Typography>
                        </DialogContent>
                        <DialogActions style={{ borderTop: '1px solid #30363d', padding: '16px' }}>
                            <Button
                                onClick={() => setShowUnsavedDialog(false)}
                                style={{ color: '#8b949e' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={closeEditorWithoutSaving}
                                className={classes.saveButton}
                                variant="contained"
                            >
                                Close Without Saving
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {}
                    <Dialog
                        open={permissionsDialog}
                        onClose={() => setPermissionsDialog(false)}
                        className={classes.newItemDialog}
                        maxWidth="sm"
                        fullWidth
                        onKeyDown={handlePermissionsKeyDown}
                    >
                        <DialogTitle style={{ 
                            borderBottom: '1px solid #30363d',
                            color: '#e6edf3'
                        }}>
                            File Permissions - {selectedFile?.name}
                        </DialogTitle>
                        <DialogContent style={{ paddingTop: '20px' }}>
                            {permissionsLoading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Grid container spacing={2}>
                                    {['owner', 'group', 'others'].map((entity) => (
                                        <Grid item xs={12} key={entity}>
                                            <Typography variant="subtitle1" style={{ 
                                                textTransform: 'capitalize',
                                                marginBottom: '8px'
                                            }}>
                                                {entity}
                                            </Typography>
                                            <FormGroup row>
                                                <FormControlLabel
                                                    className={classes.checkboxStyle}
                                                    control={
                                                        <Checkbox
                                                            checked={permissions[entity].read}
                                                            onChange={(e) => {
                                                                const newPermissions = {
                                                                    ...permissions,
                                                                    [entity]: { 
                                                                        ...permissions[entity], 
                                                                        read: e.target.checked 
                                                                    }
                                                                };
                                                                setPermissions(newPermissions);
                                                                const numericField = document.querySelector('input[type="text"][pattern="[0-7]{0,3}"]');
                                                                if (numericField) {
                                                                    numericField.value = calculateNumericPermissions(newPermissions);
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label="Read"
                                                />
                                                <FormControlLabel
                                                    className={classes.checkboxStyle}
                                                    control={
                                                        <Checkbox
                                                            checked={permissions[entity].write}
                                                            onChange={(e) => {
                                                                const newPermissions = {
                                                                    ...permissions,
                                                                    [entity]: { 
                                                                        ...permissions[entity], 
                                                                        write: e.target.checked 
                                                                    }
                                                                };
                                                                setPermissions(newPermissions);
                                                                const numericField = document.querySelector('input[type="text"][pattern="[0-7]{0,3}"]');
                                                                if (numericField) {
                                                                    numericField.value = calculateNumericPermissions(newPermissions);
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label="Write"
                                                />
                                                <FormControlLabel
                                                    className={classes.checkboxStyle}
                                                    control={
                                                        <Checkbox
                                                            checked={permissions[entity].execute}
                                                            onChange={(e) => {
                                                                const newPermissions = {
                                                                    ...permissions,
                                                                    [entity]: { 
                                                                        ...permissions[entity], 
                                                                        execute: e.target.checked 
                                                                    }
                                                                };
                                                                setPermissions(newPermissions);
                                                                const numericField = document.querySelector('input[type="text"][pattern="[0-7]{0,3}"]');
                                                                if (numericField) {
                                                                    numericField.value = calculateNumericPermissions(newPermissions);
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    label="Execute"
                                                />
                                            </FormGroup>
                                        </Grid>
                                    ))}
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Numeric Permissions"
                                            defaultValue={calculateNumericPermissions(permissions)}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^[0-7]{0,3}$/.test(value)) {
                                                    if (value.length === 3) {
                                                        setPermissions(parseNumericPermissions(value));
                                                    }
                                                    e.target.value = value;
                                                }
                                            }}
                                            className={classes.newItemTextField}
                                            inputProps={{ 
                                                maxLength: 3,
                                                style: { color: '#e6edf3' },
                                                type: 'text',
                                                pattern: '[0-7]{0,3}'
                                            }}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                            InputLabelProps={{
                                                style: { color: '#8b949e' }
                                            }}
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </DialogContent>
                        <DialogActions style={{ borderTop: '1px solid #30363d', padding: '16px' }}>
                            <Button onClick={() => setPermissionsDialog(false)} style={{ color: '#8b949e' }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePermissionsSave}
                                className={classes.saveButton}
                                variant="contained"
                                disabled={permissionsLoading}
                            >
                                {permissionsLoading ? (
                                    <CircularProgress size={24} style={{ color: '#ffffff' }} />
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            )}
        </React.Fragment>
    );
}

export default App; 