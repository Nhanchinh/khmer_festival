import React from 'react';
import './GoogleMap.css';

const GoogleMap = ({ location, title }) => {
    if (!location || location === 'Chưa xác định') {
        return null;
    }

    // Google Maps search URL (không cần API key)
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

    // Google Maps embed URL (fallback không cần API key)
    const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;

    return (
        <div className="google-map-container">
            <div className="google-map-header">
                <h3 className="google-map-title">🗺️ Vị trí tổ chức</h3>
                <p className="google-map-location">{location}</p>
                <a
                    href={searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-map-external-link"
                >
                    Mở trong Google Maps ↗
                </a>
            </div>

            <div className="google-map-embed">
                <iframe
                    src={embedUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Bản đồ ${location}`}
                    onError={(e) => {
                        // Fallback nếu embed fail
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                ></iframe>

                {/* Fallback: Placeholder khi iframe không load */}
                <div className="google-map-fallback" style={{ display: 'none' }}>
                    <div className="google-map-placeholder">
                        <div className="map-icon">🗺️</div>
                        <h4>Xem vị trí trên Google Maps</h4>
                        <p>📍 {location}</p>
                        <a
                            href={searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="google-map-link"
                        >
                            Mở Google Maps →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleMap; 