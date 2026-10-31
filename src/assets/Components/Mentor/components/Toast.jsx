function Toast({ message, onDismiss }) {
    if (!message) return null;

    return (
        <div className="toast" role="status">
            <span>✓</span>{message}
            <button aria-label="Dismiss notification" onClick={onDismiss}>×</button>
        </div>
    );
}

export default Toast;
