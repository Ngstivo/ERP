import { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
} from '@mui/material';
import {
    CloudUpload,
    Download,
    CheckCircle,
    Error as ErrorIcon,
    InsertDriveFile,
} from '@mui/icons-material';
import axios from 'axios';
import { useAppSelector } from '../../hooks/redux';
import { API_URL } from '../../config/api';

interface ImportResult {
    successCount: number;
    failureCount: number;
    totalCount: number;
    successfulProducts: string[];
    errors: Array<{
        row: number;
        sku: string;
        error: string;
    }>;
}

interface ProductImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImportComplete: () => void;
}

export default function ProductImportDialog({ open, onClose, onImportComplete }: ProductImportDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAppSelector((state) => state.auth);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = [
                'text/csv',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];
            const validExtensions = /\.(csv|xlsx|xls)$/i;

            if (validTypes.includes(file.type) || validExtensions.test(file.name)) {
                setSelectedFile(file);
                setError(null);
                setImportResult(null);
            } else {
                setError('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const endpoint = selectedFile.name.endsWith('.csv')
                ? `${API_URL}/products/import/csv`
                : `${API_URL}/products/import/excel`;

            const response = await axios.post<ImportResult>(endpoint, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setImportResult(response.data);
            if (response.data.successCount > 0) {
                onImportComplete();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to import products. Please check your file and try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/product-import-template.csv';
        link.download = 'product-import-template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setImportResult(null);
        setError(null);
        onClose();
    };

    const handleReset = () => {
        setSelectedFile(null);
        setImportResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Import Products from File</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Upload a CSV or Excel file with your product data. Make sure your file includes all required fields.
                    </Alert>

                    <Button
                        startIcon={<Download />}
                        onClick={handleDownloadTemplate}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 3 }}
                    >
                        Download Sample Template
                    </Button>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: 'background.default',
                            border: '2px dashed',
                            borderColor: selectedFile ? 'primary.main' : 'divider',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'action.hover',
                            },
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        {selectedFile ? (
                            <Box>
                                <InsertDriveFile sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                    {selectedFile.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                <Typography variant="h6" gutterBottom>
                                    Click to select a file
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Supports CSV, XLS, and XLSX files
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {importResult && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Import Results
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total
                                </Typography>
                                <Typography variant="h4">{importResult.totalCount}</Typography>
                            </Paper>
                            <Paper sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                                <CheckCircle sx={{ color: 'success.dark', mb: 1 }} />
                                <Typography variant="body2" color="success.dark">
                                    Success
                                </Typography>
                                <Typography variant="h4" color="success.dark">
                                    {importResult.successCount}
                                </Typography>
                            </Paper>
                            <Paper sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                                <ErrorIcon sx={{ color: 'error.dark', mb: 1 }} />
                                <Typography variant="body2" color="error.dark">
                                    Failed
                                </Typography>
                                <Typography variant="h4" color="error.dark">
                                    {importResult.failureCount}
                                </Typography>
                            </Paper>
                        </Box>

                        {importResult.successCount > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="success.dark" gutterBottom>
                                    Successfully Imported ({importResult.successfulProducts.length})
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1, maxHeight: 150, overflow: 'auto' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {importResult.successfulProducts.join(', ')}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}

                        {importResult.errors.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="error.dark" gutterBottom>
                                    Errors ({importResult.errors.length})
                                </Typography>
                                <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                                    <List dense>
                                        {importResult.errors.map((err, index) => (
                                            <Box key={index}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={`Row ${err.row}: ${err.sku}`}
                                                        secondary={err.error}
                                                        primaryTypographyProps={{ color: 'error.dark' }}
                                                    />
                                                </ListItem>
                                                {index < importResult.errors.length - 1 && <Divider />}
                                            </Box>
                                        ))}
                                    </List>
                                </Paper>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                {importResult ? (
                    <>
                        <Button onClick={handleReset} color="primary">
                            Import Another File
                        </Button>
                        <Button onClick={handleClose} variant="contained">
                            Close
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={handleClose} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            variant="contained"
                            disabled={!selectedFile || uploading}
                            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                        >
                            {uploading ? 'Importing...' : 'Import'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
