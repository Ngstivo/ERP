import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

export const showSuccess = (message: string) => {
    toast.success(message, defaultOptions);
};

export const showError = (message: string | any) => {
    // Extract error message from various formats
    let errorMessage = 'An error occurred';

    if (typeof message === 'string') {
        errorMessage = message;
    } else if (message?.response?.data?.message) {
        errorMessage = message.response.data.message;
    } else if (message?.message) {
        errorMessage = message.message;
    }

    toast.error(errorMessage, defaultOptions);
};

export const showWarning = (message: string) => {
    toast.warning(message, defaultOptions);
};

export const showInfo = (message: string) => {
    toast.info(message, defaultOptions);
};
