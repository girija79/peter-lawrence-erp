import { NavLink } from 'react-router-dom';

function Sidebar({ user }) {

  // Admin Menu
  const adminMenu = [
    {
      section: 'WORKSPACE',
      items: [
        {
          name: 'Overview',
          icon: 'bi-grid-1x2',
          path: '/dashboard'
        },
        {
          name: 'Clients',
          icon: 'bi-person-vcard',
          path: '/clients'
        },
        {
          name: 'Lawyers',
          icon: 'bi-briefcase',
          path: '/lawyers'
        },
        {
          name: 'Cases',
          icon: 'bi-folder2-open',
          path: '/cases'
        },
        {
          name: 'Appointments',
          icon: 'bi-calendar3',
          path: '/appointments'
        }
      ]
    },
    {
      section: 'OPERATIONS',
      items: [
        {
          name: 'Documents',
          icon: 'bi-file-earmark-text',
          path: '/documents'
        },
        {
          name: 'Billing',
          icon: 'bi-receipt',
          path: '/billing'
        },
        {
          name: 'Employees',
          icon: 'bi-person-badge',
          path: '/employees'
        },
        {
          name: 'HR Management',
          icon: 'bi-person-workspace',
          path: '/hr'
        }
      ]
    },
    {
      section: 'ADMINISTRATION',
      items: [
        {
          name: 'Users',
          icon: 'bi-people',
          path: '/users'
        },
        {
          name: 'Career Portal',
          icon: 'bi-mortarboard',
          path: '/careers'
        },
        {
          name: 'Vendors',
          icon: 'bi-building',
          path: '/vendors'
        },
        {
          name: 'Petty Cash',
          icon: 'bi-cash-stack',
          path: '/petty-cash'
        },
        {
          name: 'Payroll',
          icon: 'bi-wallet2',
          path: '/payroll'
        },
        {
          name: 'Reports',
          icon: 'bi-bar-chart',
          path: '/reports'
        }
      ]
    }
  ];

  // Lawyer Menu
  const lawyerMenu = [
    {
      section: 'WORKSPACE',
      items: [
        {
          name: 'Overview',
          icon: 'bi-grid-1x2',
          path: '/dashboard'
        },
        {
          name: 'My Clients',
          icon: 'bi-person-vcard',
          path: '/clients'
        },
        {
          name: 'My Cases',
          icon: 'bi-folder2-open',
          path: '/cases'
        },
        {
          name: 'Appointments',
          icon: 'bi-calendar3',
          path: '/appointments'
        },
        {
          name: 'Documents',
          icon: 'bi-file-earmark-text',
          path: '/documents'
        }
      ]
    }
  ];

  // Employee Menu
  const employeeMenu = [
    {
      section: 'MY WORKSPACE',
      items: [
        {
          name: 'Overview',
          icon: 'bi-grid-1x2',
          path: '/dashboard'
        },
        {
          name: 'My Profile',
          icon: 'bi-person',
          path: '/profile'
        },
        {
          name: 'Attendance',
          icon: 'bi-calendar-check',
          path: '/attendance'
        },
        {
          name: 'Leave',
          icon: 'bi-calendar-minus',
          path: '/leave'
        }
      ]
    }
  ];

  // Client Menu
  const clientMenu = [
    {
      section: 'MY LEGAL MATTERS',
      items: [
        {
          name: 'Overview',
          icon: 'bi-grid-1x2',
          path: '/dashboard'
        },
        {
          name: 'My Profile',
          icon: 'bi-person',
          path: '/profile'
        },
        {
          name: 'My Cases',
          icon: 'bi-folder2-open',
          path: '/cases'
        },
        {
          name: 'Appointments',
          icon: 'bi-calendar3',
          path: '/appointments'
        },
        {
          name: 'Documents',
          icon: 'bi-file-earmark-text',
          path: '/documents'
        },
        {
          name: 'Payments',
          icon: 'bi-credit-card',
          path: '/payments'
        }
      ]
    }
  ];

  // Select menu according to logged-in user's role
  let menuSections = [];

  if (user?.role === 'admin') {
    menuSections = adminMenu;
  } else if (user?.role === 'lawyer') {
    menuSections = lawyerMenu;
  } else if (user?.role === 'employee') {
    menuSections = employeeMenu;
  } else if (user?.role === 'client') {
    menuSections = clientMenu;
  }

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-header">

        <div className="brand-mark">
          PL
        </div>

        <div className="brand-content">
          <h5>Peter Lawrence</h5>
          <small>Legal ERP & CRM</small>
        </div>

      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">

        {menuSections.map((section) => (
          <div
            className="sidebar-section"
            key={section.section}
          >

            <div className="sidebar-section-title">
              {section.section}
            </div>

            <div className="sidebar-section-items">

              {section.items.map((item) => (

                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >

                  <span className="sidebar-icon">
                    <i className={`bi ${item.icon}`}></i>
                  </span>

                  <span className="sidebar-label">
                    {item.name}
                  </span>

                </NavLink>

              ))}

            </div>

          </div>
        ))}

      </nav>

      {/* User Information */}
      <div className="sidebar-user">

        <div className="sidebar-user-avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <div className="sidebar-user-info">
          <div className="sidebar-user-name">
            {user?.name || 'User'}
          </div>

          <div className="sidebar-user-role">
            {user?.role || 'User'}
          </div>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;