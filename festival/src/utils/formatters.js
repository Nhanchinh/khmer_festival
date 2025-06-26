// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
};

// Format number
export const formatNumber = (number) => {
    return number.toLocaleString('vi-VN');
}; 