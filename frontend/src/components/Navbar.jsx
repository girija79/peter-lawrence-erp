import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

function Navbar({ user }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Automatic notification toast
  const [toastNotification, setToastNotification] = useState(null);

  const notificationRef = useRef(null);

  // Stores notification IDs that the browser has already seen.
  const knownNotificationIds = useRef(new Set());

  // Prevents the first API request from showing old notifications.
  const firstNotificationLoad = useRef(true);

  const toastTimer = useRef(null);

  // Prevent duplicate polling requests.
  const fetchingNotifications = useRef(false);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Convert route into a readable page title
  const getPageTitle = () => {
    const path = location.pathname;

    const titles = {
      '/dashboard': 'Overview',
      '/users': 'User Management',
      '/clients': 'Clients',
      '/lawyers': 'Lawyers',
      '/cases': 'Cases',
      '/appointments': 'Appointments',
      '/documents': 'Documents',
      '/billing': 'Billing',
      '/client-payments': 'Client Payments',
      '/employees': 'Employees',
      '/hr': 'HR Management',
      '/career': 'Career Portal',
      '/vendors': 'Vendors',
      '/petty-cash': 'Petty Cash',
      '/payroll': 'Payroll',
      '/reports': 'Reports',
      '/profile': 'My Profile',
      '/attendance': 'Attendance',
      '/leave': 'Leave',
      '/payments': 'Payments',
      '/notifications': 'Notifications'
    };

    return titles[path] || 'Peter Lawrence';
  };


  // Show automatic notification toast
  const showNotificationToast = (notification) => {
    if (!notification) return;

    // Clear previous toast timer
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    // Show the new notification
    setToastNotification(notification);

    // Automatically hide after 5 seconds
    toastTimer.current = setTimeout(() => {
      setToastNotification(null);
    }, 5000);
  };


  // Fetch notifications
  const fetchNotifications = async (detectNew = true) => {
    if (!user) return;

    // Prevent overlapping requests
    if (fetchingNotifications.current) return;

    fetchingNotifications.current = true;

    try {
      const response = await api.get(
        `/notifications?_t=${Date.now()}`
      );

      const latestNotifications = Array.isArray(response.data)
        ? response.data
        : [];

      setNotifications(latestNotifications);


      /*
       * FIRST LOAD
       *
       * We only store the existing notification IDs.
       * Existing notifications should not appear as automatic toasts.
       */
      if (firstNotificationLoad.current) {
        latestNotifications.forEach((notification) => {
          knownNotificationIds.current.add(notification._id);
        });

        firstNotificationLoad.current = false;

        return;
      }


      /*
       * FIND NEW NOTIFICATIONS
       *
       * Any notification ID that was not present
       * during the previous poll is considered new.
       */
      const newNotifications = latestNotifications.filter(
        (notification) =>
          !knownNotificationIds.current.has(notification._id)
      );


      /*
       * Immediately remember all notifications currently
       * returned by the server.
       */
      latestNotifications.forEach((notification) => {
        knownNotificationIds.current.add(notification._id);
      });


      /*
       * SHOW TOAST
       *
       * Only unread notifications should trigger
       * the automatic popup.
       */
      if (detectNew && newNotifications.length > 0) {
        const newUnreadNotification = newNotifications.find(
          (notification) => notification.isRead === false
        );

        if (newUnreadNotification) {
          showNotificationToast(newUnreadNotification);
        }
      }
    } catch (error) {
      console.error(
        'Failed to fetch notifications:',
        error
      );
    } finally {
      fetchingNotifications.current = false;
    }
  };


  /*
   * INITIAL NOTIFICATION FETCH + POLLING
   *
   * First request loads existing notifications.
   *
   * Then the server is checked every 5 seconds.
   *
   * This makes testing easier and makes the notification
   * feel more responsive.
   */
  useEffect(() => {
    if (!user) return;


    // Reset notification tracking when user changes
    knownNotificationIds.current = new Set();
    firstNotificationLoad.current = true;

    // Initial load - do not show old notifications
    fetchNotifications(false);


    // Check for new notifications every 5 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);


    return () => {
      clearInterval(notificationInterval);

      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, [user]);


  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);


  // Mark one notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString()
              }
            : notification
        )
      );


      // If this notification is currently displayed
      // as a toast, close it.
      if (
        toastNotification?._id === notificationId
      ) {
        setToastNotification(null);

        if (toastTimer.current) {
          clearTimeout(toastTimer.current);
        }
      }
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      );
    }
  };


  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
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

      setToastNotification(null);

      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      );
    }
  };


  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;


  const formatNotificationDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getNotificationIcon = (type) => {
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
    <header className="topbar">

      {/* LEFT SIDE */}
      <div className="topbar-left">

        <div className="topbar-page">

          <div className="topbar-eyebrow">
            PETER LAWRENCE · LEGAL OFFICE
          </div>

          <h1 className="topbar-title">
            {getPageTitle()}
          </h1>

        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="topbar-right">

        {/* Office */}
        <div className="topbar-office">

          <span className="topbar-office-label">
            BELGRADE
          </span>

          <span className="topbar-office-status">
            <span className="status-dot"></span>
            Office system
          </span>

        </div>


        <div className="topbar-divider"></div>


        {/* NOTIFICATION BELL */}
        <div
          className="topbar-notification-wrapper"
          ref={notificationRef}
        >

          <button
            type="button"
            className="topbar-icon-button"
            title="Notifications"
            onClick={() =>
              setShowNotifications(
                (current) => !current
              )
            }
          >

            <i className="bi bi-bell"></i>

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 9
                  ? '9+'
                  : unreadCount}
              </span>
            )}

          </button>


          {/* NOTIFICATION CENTER */}
          {showNotifications && (
            <div className="notification-popup">

              {/* HEADER */}
              <div className="notification-popup-header">

                <div className="notification-popup-title-section">

                  <div className="notification-popup-title-row">

                    <h3>Notifications</h3>

                    {unreadCount > 0 && (
                      <span className="notification-popup-unread-count">
                        {unreadCount} unread
                      </span>
                    )}

                  </div>

                </div>


                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notification-mark-all"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}

              </div>


              {/* NOTIFICATION LIST */}
              <div className="notification-popup-body">

                {notifications.length === 0 ? (

                  <div className="notification-popup-empty">

                    <i className="bi bi-bell-slash"></i>

                    <strong>
                      No new notifications
                    </strong>

                    <span>
                      You're all caught up.
                    </span>

                  </div>

                ) : (

                  notifications
                    .slice(0, 5)
                    .map((notification) => (

                      <div
                        key={notification._id}
                        className={`notification-popup-item ${
                          notification.isRead
                            ? 'read'
                            : 'unread'
                        }`}
                      >

                        {/* ICON */}
                        <div className="notification-popup-icon">

                          <i
                            className={`bi ${getNotificationIcon(
                              notification.type
                            )}`}
                          ></i>

                        </div>


                        {/* CONTENT */}
                        <div className="notification-popup-content">

                          <div className="notification-popup-item-top">

                            <span className="notification-popup-type">
                              {notification.type}
                            </span>

                            {!notification.isRead && (
                              <span className="notification-unread-marker"></span>
                            )}

                          </div>


                          <h4>
                            {notification.title}
                          </h4>


                          <p>
                            {notification.message}
                          </p>


                          <div className="notification-popup-footer">

                            <span>
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </span>

                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkAsRead(
                                    notification._id
                                  )
                                }
                              >
                                Mark as read
                              </button>
                            )}

                          </div>

                        </div>

                      </div>

                    ))

                )}

              </div>


              {/* FOOTER */}
              <div className="notification-popup-bottom">

                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                >
                  <span>
                    View all notifications
                  </span>

                  <i className="bi bi-arrow-right"></i>
                </button>

              </div>

            </div>
          )}

        </div>


        {/* USER */}
        <div className="topbar-user">

          <div className="topbar-user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="topbar-user-details">

            <div className="topbar-user-name">
              {user?.name || 'User'}
            </div>

            <div className="topbar-user-role">
              {user?.role || 'User'}
            </div>

          </div>

        </div>


        {/* LOGOUT */}
        <button
          type="button"
          className="topbar-logout"
          onClick={handleLogout}
          title="Logout"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Sign out</span>
        </button>

      </div>


      {/* AUTOMATIC NOTIFICATION TOAST */}
      {toastNotification && (
        <div className="notification-toast">

          <div className="notification-toast-icon">

            <i
              className={`bi ${getNotificationIcon(
                toastNotification.type
              )}`}
            ></i>

          </div>


          <div className="notification-toast-content">

            <div className="notification-toast-label">
              NEW NOTIFICATION
            </div>

            <h4>
              {toastNotification.title}
            </h4>

            <p>
              {toastNotification.message}
            </p>

          </div>


          <button
            type="button"
            className="notification-toast-close"
            onClick={() => {
              setToastNotification(null);

              if (toastTimer.current) {
                clearTimeout(toastTimer.current);
              }
            }}
            aria-label="Close notification"
          >
            <i className="bi bi-x"></i>
          </button>

        </div>
      )}

    </header>
  );
}

export default Navbar;