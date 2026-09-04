import { NavLink } from 'react-router-dom';

function Sidebar({ user }) {

  // Admin Menu
  const adminMenu = [
    {
      name: 'Dashboard',
      icon: 'bi-speedometer2',
      path: '/dashboard'
    },
    {
      name: 'Users',
      icon: 'bi-people',
      path: '/users'
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
      icon: 'bi-calendar-check',
      path: '/appointments'
    },
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
  ];

  // Lawyer Menu
  const lawyerMenu = [
    {
      name: 'Dashboard',
      icon: 'bi-speedometer2',
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
      icon: 'bi-calendar-check',
      path: '/appointments'
    },
    {
      name: 'Documents',
      icon: 'bi-file-earmark-text',
      path: '/documents'
    }
  ];

  // Employee Menu
  const employeeMenu = [
    {
      name: 'Dashboard',
      icon: 'bi-speedometer2',
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
  ];

  // Client Menu
  const clientMenu = [
    {
      name: 'Dashboard',
      icon: 'bi-speedometer2',
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
      icon: 'bi-calendar-check',
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
  ];

  // Select menu according to logged-in user's role
  let menuItems = [];

  if (user?.role === 'admin') {
    menuItems = adminMenu;
  } else if (user?.role === 'lawyer') {
    menuItems = lawyerMenu;
  } else if (user?.role === 'employee') {
    menuItems = employeeMenu;
  } else if (user?.role === 'client') {
    menuItems = clientMenu;
  }

  return (
    <aside className="sidebar bg-dark text-white">

      {/* Sidebar Header */}
      <div className="sidebar-header p-3">

        <h5 className="mb-1">
          Peter Lawrence
        </h5>

        <small className="text-secondary">
          Legal ERP & CRM
        </small>

      </div>

      <hr className="border-secondary" />

      {/* Navigation */}
      <nav className="px-2">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >

            <i
              className={`bi ${item.icon} me-3`}
            ></i>

            <span>
              {item.name}
            </span>

          </NavLink>

        ))}

      </nav>

    </aside>
  );
}

export default Sidebar;