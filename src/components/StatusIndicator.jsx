function StatusIndicator({ isOnline }) {
  return (
    <span className={`status ${isOnline ? 'online' : ''}`}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  )
}

export default StatusIndicator
