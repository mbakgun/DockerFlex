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
} from '@material-ui/icons';
import MuiAlert from '@material-ui/lab/Alert';
import { createMuiTheme } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import NoteAddIcon from '@material-ui/icons/NoteAdd';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#ec4899',
            light: '#f472b6',
            dark: '#db2777',
        },
        background: {
            default: '#0d1117',
            paper: '#161b22',
        },
        text: {
            primary: '#e6edf3',
            secondary: '#8b949e',
        },
    },
    overrides: {
        MuiTooltip: {
            tooltip: {
                backgroundColor: '#21262d',
                color: '#e6edf3',
                fontSize: '0.875rem',
                border: '1px solid #30363d',
            },
            arrow: {
                color: '#21262d',
            },
        },
        MuiCard: {
            root: {
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
            },
        },
        MuiPaper: {
            root: {
                backgroundColor: '#161b22',
                '&.MuiMenu-paper': {
                    backgroundColor: '#21262d',
                    border: '1px solid #30363d',
                },
            },
        },
    },
});

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.75rem',
            padding: '0 16px',
            wordBreak: 'break-word',
        },
    },
    githubButton: {
        color: '#e6edf3',
        transition: 'transform 0.2s, color 0.2s',
        '&:hover': {
            color: '#58a6ff',
            transform: 'scale(1.1)',
            backgroundColor: 'transparent',
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
        height: '80vh',
        marginTop: theme.spacing(2),
        fontFamily: 'monospace',
        backgroundColor: '#0d1117',
        '& .MuiInputBase-root': {
            color: '#e6edf3',
            backgroundColor: '#0d1117',
            height: '100%',
        },
        '& .MuiInputBase-inputMultiline': {
            height: '100% !important',
            overflow: 'auto !important',
        },
        '& .MuiOutlinedInput-root': {
            height: '100%',
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
                    display: 'none', // Hide "Save" text on mobile
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
}));

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

// Helper function to clean file names
const cleanFileName = (fileName) => {
    return fileName
        .replace(/[^\w\s.-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

// Use environment variables for API URLs
const INTERNAL_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4200';
const HOSTNAME = import.meta.env.VITE_HOSTNAME || 'Docker Desktop';

function App() {
    const classes = useStyles();
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

    useEffect(() => {
        fetchContainers();
    }, []);

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

    // Add keyboard navigation handler
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Only handle if dialog is open and not editing/renaming
            if (!openDialog || openEditor || isRenaming) return;

            // Ignore if typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toLowerCase();

            // Only handle alphanumeric keys
            if (!key.match(/^[a-z0-9]$/)) return;

            // Update search string and find matching file
            setSearchString(prev => {
                const newSearch = prev + key;

                // Clear previous timeout
                if (searchTimeout) {
                    clearTimeout(searchTimeout);
                }

                // Set new timeout to clear search string after 1 second
                const timeout = setTimeout(() => {
                    setSearchString('');
                }, 1000);
                setSearchTimeout(timeout);

                // Find first matching file regardless of current selection
                const matchingFile = files.find(file =>
                    file.name.toLowerCase().startsWith(newSearch)
                );

                if (matchingFile) {
                    setSelectedFile(matchingFile);

                    // Ensure the selected item is visible and not obscured
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
                                fileList.scrollTop -= (toolbarHeight + 40); // Increased offset to prevent elements being hidden
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

    const fetchContainers = async () => {
        try {
            const response = await axios.get(`${INTERNAL_API_URL}/api/containers`);
            setContainers(sortContainers(response.data));
        } catch (error) {
            showErrorMessage('Error fetching containers: ' + error.message);
        }
    };

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
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedContainer(null);
        setFiles([]);
        setCurrentPath('/');
        localStorage.removeItem('currentPath');
        localStorage.removeItem('selectedContainer');
    };

    const handleCloseEditor = () => {
        setOpenEditor(false);
        setFileContent('');
    };

    const handleDownload = async () => {
        if (!selectedFile) return;

        try {
            // Always use the zip endpoint for both files and directories
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
            // Always download as zip
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
        try {
            const response = await axios.put(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/files`,
                {
                    path: `${currentPath}/${selectedFile.name}`,
                    content: fileContent,
                    restart: restartOnSave
                }
            );

            // Show success message
            showSuccessMessage('File saved successfully');

            // If file was saved and container was restarted
            if (response.data.restarted) {
                showSuccessMessage('Container restarted successfully');
                // Wait a bit before reloading to ensure container is up
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                // Close editor
                handleCloseEditor();

                // Refresh file list to get updated sizes
                await fetchFiles(selectedContainer.Id, currentPath);

                // If the response includes new size, update the selected file
                if (response.data.size) {
                    setSelectedFile(prev => ({
                        ...prev,
                        size: response.data.size
                    }));
                }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.details || error.message;
            showErrorMessage('Error saving file: ' + errorMessage);
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
        if (!selectedFile || !newFileName || newFileName === selectedFile.name) {
            setIsRenaming(false);
            return;
        }

        try {
            const oldPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${selectedFile.name}`;
            const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${newFileName}`;

            await axios.put(
                `${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/files/rename`,
                { oldPath, newPath }
            );

            setIsRenaming(false);
            setNewFileName('');
            await fetchFiles(selectedContainer.Id, currentPath);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error renaming file:', error);
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
            // Helper function to check if container is red (artifact)
            const isRed = (container) => {
                const name = container.Names[0].toLowerCase();
                return name.includes('dockerflex-') || name.includes('buildx_buildkit');
            };

            const aIsRed = isRed(a);
            const bIsRed = isRed(b);

            // If one is red and other isn't, red goes last
            if (aIsRed && !bIsRed) return 1;
            if (!aIsRed && bIsRed) return -1;

            // If both are same color (red or green), sort by running state
            if (a.State === 'running' && b.State !== 'running') return -1;
            if (a.State !== 'running' && b.State === 'running') return 1;

            // If same state, sort alphabetically
            return a.Names[0].localeCompare(b.Names[0]);
        });
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const { clientX: x, clientY: y } = e;

        // Only set dragging to false if we've actually left the drop zone
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

        // Get files from DataTransfer
        const items = Array.from(e.dataTransfer.items);

        // Only accept files, reject folders
        const filePromises = items
            .filter(item => item.kind === 'file' && item.webkitGetAsEntry()?.isFile)
            .map(item => item.getAsFile());

        if (filePromises.length === 0) {
            // Show warning if a folder is dragged
            showErrorMessage('Please use the folder selection button to upload folders');
            return;
        }

        // Send files to handleFileSelect
        handleFileSelect({
            target: {
                files: filePromises
            }
        });
    };

    // Recursively get all files from a directory
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

    // Helper function to determine AppBar color
    const getAppBarClass = () => {
        if (!selectedContainer) return '';
        return isArtifact(selectedContainer)
            ? classes.appBarArtifact
            : classes.appBarNormal;
    };

    // Add handler for dialog close
    const handleDialogClose = (event, reason) => {
        if (reason === 'escapeKeyDown') {
            // Prevent closing on ESC key
            return;
        }
        handleCloseDialog();
    };

    // Add handler for editor dialog close
    const handleEditorDialogClose = (event, reason) => {
        if (reason === 'escapeKeyDown') {
            // Prevent closing on ESC key
            return;
        }
        handleCloseEditor();
    };

    const handleUploadClick = () => {
        setOpenUploadDialog(true);
    };

    // Update handleFileSelect function
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

    // Update handleFolderSelect function
    const handleFolderSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Group files by their relative paths
        const filesByPath = files.reduce((acc, file) => {
            if (!file.webkitRelativePath) return acc;

            const pathParts = file.webkitRelativePath.split('/');
            const folderName = pathParts[0];
            const relativePath = pathParts.slice(1).join('/');

            if (!acc[folderName]) {
                acc[folderName] = [];
            }

            // Skip hidden and system files
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

        // Process the first (and should be only) folder
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

            // Get files from DataTransfer
            const items = Array.from(e.dataTransfer.items);

            // Only accept files, reject folders
            const filePromises = items
                .filter(item => item.kind === 'file' && item.webkitGetAsEntry()?.isFile)
                .map(item => item.getAsFile());

            if (filePromises.length === 0) {
                // Show warning if a folder is dragged
                showErrorMessage('Please use the folder selection button to upload folders');
                return;
            }

            // Send files to handleFileSelect
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

                    {/* Upload queue display */}
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

    // Add effect to handle initial load
    useEffect(() => {
        const loadInitialState = async () => {
            if (selectedContainer) {
                try {
                    await fetchFiles(selectedContainer.Id, currentPath);
                    setOpenDialog(true);
                } catch (error) {
                    console.error('Error loading initial state:', error);
                    // Clear stored state if there's an error
                    localStorage.removeItem('currentPath');
                    localStorage.removeItem('selectedContainer');
                    setCurrentPath('/');
                    setSelectedContainer(null);
                }
            }
        };

        loadInitialState();
    }, []);

    // Update localStorage when path or container changes
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

    // Update the useEffect for fetching host info
    useEffect(() => {
        const getHostInfo = async () => {
            try {
                // First check environment variable
                if (import.meta.env.VITE_HOSTNAME) {
                    setHostInfo(import.meta.env.VITE_HOSTNAME);
                    return;
                }

                // Fallback to API call if no environment variable
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
        // Close mobile menu if open
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
        if (!newItemName) return;

        try {
            const newPath = `${currentPath}${currentPath.endsWith('/') ? '' : '/'}${newItemName}`;

            if (newItemType === 'folder') {
                // Use the new endpoint for folder creation
                await axios.post(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/create-folder`, {
                    path: newPath
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                await axios.put(`${INTERNAL_API_URL}/api/containers/${selectedContainer.Id}/files`, {
                    path: newPath,
                    content: newFileContent
                });
            }

            setNewItemDialog(false);
            fetchFiles(selectedContainer.Id, currentPath);
            showSuccessMessage(`${newItemType === 'folder' ? 'Folder' : 'File'} created successfully`);
        } catch (error) {
            const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
            showErrorMessage(`Error creating ${newItemType}: ${errorMessage}`);
        }
    };

    // Add handler for mobile menu
    const handleMobileMenuOpen = (event) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchor(null);
    };

    // Update the handleListItemClick function
    const handleListItemClick = (file) => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;

        // For mobile devices
        if (window.innerWidth <= 600) {
            if (selectedFile?.name === file.name) {
                if (timeDiff < 300) {
                    // Double click - open file/folder
                    handleFileDoubleClick(file);
                } else {
                    // Second click after timeout - deselect
                    setSelectedFile(null);
                }
            } else {
                // First click on a new item - select it
                handleFileClick(file);
            }
        } else {
            // Desktop behavior remains unchanged
            handleFileClick(file);
        }

        // Update last click time
        setLastClickTime(currentTime);
    };

    // Add this function to filter files
    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add handler for search toggle
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

    // Add effect to clear search when changing folders
    useEffect(() => {
        setSearchQuery('');
        setSearchExpanded(false);
    }, [currentPath]);

    return (
        <>
            <Container className={classes.root} maxWidth="xl">
                <Box className={classes.headerContainer}>
                    <Grow in timeout={1000}>
                        <Typography variant="h3" component="h1" className={classes.title}>
                            DockerFlex
                            <IconButton
                                href="https://github.com/mbakgun/dockerflex"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={classes.githubButton}
                                aria-label="GitHub Repository"
                            >
                                <GitHubIcon />
                            </IconButton>
                        </Typography>
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
                    {containers.map((container, index) => (
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
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Tooltip title="Go Back" arrow>
                                    <IconButton
                                        color="inherit"
                                        onClick={handleBack}
                                        className={classes.backButton}
                                    >
                                        <ArrowBack />
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="h6">
                                    {selectedContainer?.Names[0]} - Files
                                </Typography>
                                <Typography className={classes.breadcrumb}>
                                    {currentPath}
                                </Typography>
                            </div>

                            {/* Desktop Actions */}
                            <div className={classes.toolbarActions}>
                                {/* Search Group */}
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

                                {/* Vertical Divider after Search */}
                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    margin: '0 4px'
                                }} />

                                {/* File Creation Group */}
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

                                {/* Vertical Divider */}
                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    margin: '0 4px'
                                }} />

                                {/* File Operations Group */}
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
                                </div>

                                {/* Vertical Divider */}
                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    margin: '0 4px'
                                }} />

                                {/* Dialog Control Group */}
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

                            {/* Mobile Menu Button */}
                            <IconButton
                                className={classes.mobileMenuButton}
                                color="inherit"
                                onClick={handleMobileMenuOpen}
                                edge="end"
                            >
                                <MenuIcon />
                            </IconButton>

                            {/* Mobile Menu */}
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
                                        // Open a dialog for mobile search
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
                                className={`${selectedFile?.name === file.name ? classes.selectedItem : ''} ${classes.fileListItem}`}
                            >
                                {isRenaming && selectedFile?.name === file.name ? (
                                    <TextField
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(cleanFileName(e.target.value))}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleRename();
                                            }
                                        }}
                                        onBlur={handleRename}
                                        autoFocus
                                        size="small"
                                        fullWidth
                                        className={classes.renameTextField}
                                        InputProps={{
                                            style: { color: '#ffffff' }
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
                                        />
                                    }
                                    label="Restart container on save"
                                    className={classes.restartCheckbox}
                                />
                                <Button
                                    onClick={handleSaveFile}
                                    startIcon={<SaveIcon />}
                                    style={{
                                        backgroundColor: '#f0883e',
                                        color: '#ffffff',
                                        marginRight: '8px',
                                    }}
                                    variant="contained"
                                >
                                    <span>Save</span>
                                </Button>
                                <IconButton
                                    onClick={handleCloseEditor}
                                    style={{ color: '#e6edf3' }}
                                    edge="end"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </div>
                        </Toolbar>
                    </AppBar>
                    <Container style={{
                        backgroundColor: '#0d1117',
                        height: '100%',
                        paddingTop: window.innerWidth <= 600 ? '8px' : '24px'
                    }}>
                        <TextField
                            className={classes.editor}
                            multiline
                            rows={20}
                            variant="outlined"
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Tab') {
                                    e.preventDefault();
                                    const start = e.target.selectionStart;
                                    const end = e.target.selectionEnd;
                                    const newContent = fileContent.substring(0, start) + '\t' + fileContent.substring(end);
                                    setFileContent(newContent);
                                    
                                    setTimeout(() => {
                                        e.target.selectionStart = e.target.selectionEnd = start + 1;
                                    }, 0);
                                }
                            }}
                        />
                    </Container>
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
                            onChange={(e) => setNewItemName(cleanFileName(e.target.value))}
                            className={classes.newItemTextField}
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Tab') {
                                        e.preventDefault();
                                        const start = e.target.selectionStart;
                                        const end = e.target.selectionEnd;
                                        const newContent = newFileContent.substring(0, start) + '\t' + newFileContent.substring(end);
                                        setNewFileContent(newContent);
                                        setTimeout(() => {
                                            e.target.selectionStart = e.target.selectionEnd = start + 1;
                                        }, 0);
                                    }
                                }}
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
            </Container>
        </>
    );
}

export default App; 