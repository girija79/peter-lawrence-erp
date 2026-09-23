import { useEffect, useState } from 'react';
import api from '../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      // Cache-busting query so the page always requests fresh data
      const response = await api.get(
        `/notifications?_t=${Date.now()}`
      );

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to fetch notifications:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load notifications.'
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      setActionLoading(id);

      await api.put(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString()
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        'Failed to mark notification as read:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to update notification.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading('all');

      await api.put('/notifications/read-all');

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt:
            notification.readAt ||
            new Date().toISOString()
        }))
      );
    } catch (err) {
      console.error(
        'Failed to mark all notifications as read:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to update notifications.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setActionLoading(id);

      await api.delete(`/notifications/${id}`);

      setNotifications((current) =>
        current.filter(
          (notification) => notification._id !== id
        )
      );
    } catch (err) {
      console.error(
        'Failed to delete notification:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to delete notification.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'notification-priority urgent';

      case 'High':
        return 'notification-priority high';

      case 'Low':
        return 'notification-priority low';

      default:
        return 'notification-priority normal';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Appointment':
        return 'bi-calendar-event';

      case 'Case':
        return 'bi-briefcase';

      case 'Document':
        return 'bi-file-earmark-text';

      case 'Payment':
      case 'Invoice':
        return 'bi-credit-card';

      case 'Leave':
        return 'bi-calendar-minus';

      case 'HR':
        return 'bi-people';

      case 'System':
        return 'bi-gear';

      default:
        return 'bi-bell';
    }
  };

  return (
    <div className="notifications-page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-eyebrow">
            COMMUNICATION
          </div>

          <h1>Notifications</h1>

          <p>
            Stay informed about appointments, cases,
            documents, payments and important system updates.
          </p>
        </div>

        <div className="notifications-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-dark"
              onClick={markAllAsRead}
              disabled={actionLoading === 'all'}
            >
              <i className="bi bi-check2-all me-2"></i>

              {actionLoading === 'all'
                ? 'Updating...'
                : 'Mark All as Read'}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="notifications-summary">
        <div className="notification-summary-item">
          <span className="summary-label">
            TOTAL NOTIFICATIONS
          </span>

          <strong>
            {notifications.length}
          </strong>
        </div>

        <div className="notification-summary-item">
          <span className="summary-label">
            UNREAD
          </span>

          <strong className="unread-value">
            {unreadCount}
          </strong>
        </div>

        <div className="notification-summary-item">
          <span className="summary-label">
            READ
          </span>

          <strong>
            {notifications.length - unreadCount}
          </strong>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger mt-4">
          {error}
        </div>
      )}

      {/* Notifications Register */}
      <section className="notifications-section">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              NOTIFICATION REGISTER
            </span>

            <h2>Recent Activity</h2>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="notifications-empty">
            <div className="spinner-border text-secondary"></div>

            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon">
              <i className="bi bi-bell-slash"></i>
            </div>

            <h3>No notifications</h3>

            <p>
              You currently have no notifications.
            </p>
          </div>
        ) : (
          <div className="notification-list">

            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`notification-item ${
                  notification.isRead
                    ? 'notification-read'
                    : 'notification-unread'
                }`}
              >

                <div className="notification-icon">
                  <i
                    className={`bi ${getTypeIcon(
                      notification.type
                    )}`}
                  ></i>
                </div>

                <div className="notification-content">

                  <div className="notification-top-row">

                    <div>
                      <div className="notification-meta">
                        <span>
                          {notification.type}
                        </span>

                        <span>•</span>

                        <span>
                          {formatDate(
                            notification.createdAt
                          )}
                        </span>
                      </div>

                      <h3>
                        {notification.title}
                      </h3>
                    </div>

                    <span
                      className={getPriorityClass(
                        notification.priority
                      )}
                    >
                      {notification.priority}
                    </span>

                  </div>

                  <p className="notification-message">
                    {notification.message}
                  </p>

                  <div className="notification-actions">

                    {!notification.isRead && (
                      <button
                        type="button"
                        className="notification-action"
                        onClick={() =>
                          markAsRead(notification._id)
                        }
                        disabled={
                          actionLoading ===
                          notification._id
                        }
                      >
                        <i className="bi bi-check2 me-1"></i>

                        {actionLoading === notification._id
                          ? 'Updating...'
                          : 'Mark as Read'}
                      </button>
                    )}

                    <button
                      type="button"
                      className="notification-action notification-delete"
                      onClick={() =>
                        deleteNotification(
                          notification._id
                        )
                      }
                      disabled={
                        actionLoading === notification._id
                      }
                    >
                      <i className="bi bi-trash3 me-1"></i>
                      Delete
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </div>
  );
};

export default Notifications;