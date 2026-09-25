import { NavLink } from "react-router-dom";

function Sidebar({ user }) {
  // =========================
  // ADMIN MENU
  // =========================
  const adminMenu = [
    {
      section: "WORKSPACE",
      items: [
        {
          name: "Overview",
          icon: "bi-grid-1x2",
          path: "/dashboard",
        },
        {
          name: "Clients",
          icon: "bi-person-vcard",
          path: "/clients",
        },
        {
          name: "Lawyers",
          icon: "bi-briefcase",
          path: "/lawyers",
        },
        {
          name: "Cases",
          icon: "bi-folder2-open",
          path: "/cases",
        },
        {
          name: "Appointments",
          icon: "bi-calendar3",
          path: "/appointments",
        },
        {
          name: "Documents",
          icon: "bi-file-earmark-text",
          path: "/documents",
        },
      ],
    },

    {
      section: "OPERATIONS",
      items: [
        {
          name: "Billing",
          icon: "bi-receipt",
          path: "/billing",
        },
        {
          name: "Client Payments",
          icon: "bi-cash-stack",
          path: "/client-payments",
        },
        {
          name: "Receipts",
          icon: "bi-receipt-cutoff",
          path: "/receipts",
        },
        {
          name: "Employees",
          icon: "bi-person-badge",
          path: "/employees",
        },
        {
          name: "Employee Payments",
          icon: "bi-cash-stack",
          path: "/employee-payments",
        },
        {
          name: "HR Management",
          icon: "bi-person-workspace",
          path: "/hr",
        },
        {
          name: "Communication",
          icon: "bi-chat-dots",
          path: "/communication",
        },
        {
          name: "Notifications",
          icon: "bi-bell",
          path: "/notifications",
        },
      ],
    },

    {
      section: "ADMINISTRATION",
      items: [
        {
          name: "Users",
          icon: "bi-people",
          path: "/users",
        },
        {
          name: "Career Portal",
          icon: "bi-mortarboard",
          path: "/career",
        },
        {
          name: "Vendors",
          icon: "bi-building",
          path: "/vendors",
        },
        {
          name: "Petty Cash",
          icon: "bi-wallet2",
          path: "/petty-cash",
        },
        {
          name: "Payroll",
          icon: "bi-credit-card",
          path: "/payroll",
        },
        {
          name: "Reports",
          icon: "bi-bar-chart",
          path: "/reports",
        },
      ],
    },
  ];

  // =========================
  // LAWYER MENU
  // =========================
  const lawyerMenu = [
    {
      section: "LEGAL WORKSPACE",
      items: [
        {
          name: "Overview",
          icon: "bi-grid-1x2",
          path: "/dashboard",
        },
        {
          name: "My Clients",
          icon: "bi-person-vcard",
          path: "/clients",
        },
        {
          name: "My Cases",
          icon: "bi-folder2-open",
          path: "/cases",
        },
        {
          name: "Appointments",
          icon: "bi-calendar3",
          path: "/appointments",
        },
        {
          name: "Documents",
          icon: "bi-file-earmark-text",
          path: "/documents",
        },
        {
          name: "Communication",
          icon: "bi-chat-dots",
          path: "/communication",
        },
      ],
    },
  ];

  // =========================
  // HR MENU
  // =========================
  const hrMenu = [
    {
      section: "HR WORKSPACE",
      items: [
        {
          name: "Overview",
          icon: "bi-grid-1x2",
          path: "/dashboard",
        },
        {
          name: "HR Management",
          icon: "bi-person-workspace",
          path: "/hr",
        },
        {
          name: "Employees",
          icon: "bi-person-badge",
          path: "/employees",
        },
        {
          name: "Documents",
          icon: "bi-file-earmark-text",
          path: "/documents",
        },
        {
          name: "Attendance",
          icon: "bi-calendar-check",
          path: "/attendance",
        },
        {
          name: "Leave",
          icon: "bi-calendar-minus",
          path: "/leave",
        },
        {
          name: "Leave Balance",
          icon: "bi-calendar2-check",
          path: "/leave-balance",
        },
        {
          name: "Performance",
          icon: "bi-clipboard-data",
          path: "/performance",
        },
        {
          name: "Career Portal",
          icon: "bi-mortarboard",
          path: "/career",
        },
        {
          name: "Communication",
          icon: "bi-chat-dots",
          path: "/communication",
        },
      ],
    },
  ];

  // =========================
  // ACCOUNTANT MENU
  // =========================
  const accountantMenu = [
    {
      section: "FINANCE WORKSPACE",
      items: [
        {
          name: "Overview",
          icon: "bi-grid-1x2",
          path: "/dashboard",
        },
        {
          name: "Billing",
          icon: "bi-receipt",
          path: "/billing",
        },
        {
          name: "Client Payments",
          icon: "bi-cash-stack",
          path: "/client-payments",
        },
        {
          name: "Receipts",
          icon: "bi-receipt-cutoff",
          path: "/receipts",
        },
        {
          name: "Clients",
          icon: "bi-person-vcard",
          path: "/clients",
        },
        {
          name: "Vendors",
          icon: "bi-building",
          path: "/vendors",
        },
        {
          name: "Petty Cash",
          icon: "bi-wallet2",
          path: "/petty-cash",
        },
        {
          name: "Payroll",
          icon: "bi-credit-card",
          path: "/payroll",
        },
        {
          name: "Employee Payments",
          icon: "bi-cash-stack",
          path: "/employee-payments",
        },
        {
          name: "Reports",
          icon: "bi-bar-chart",
          path: "/reports",
        },
        {
          name: "Communication",
          icon: "bi-chat-dots",
          path: "/communication",
        },
      ],
    },
  ];

  // =========================
  // EMPLOYEE MENU
  // =========================
  const employeeMenu = [
    {
      section: "MY WORKSPACE",
      items: [
        {
          name: "Overview",
          icon: "bi-grid-1x2",
          path: "/dashboard",
        },
        {
          name: "My Profile",
          icon: "bi-person",
          path: "/profile",
        },
        {
          name: "Attendance",
          icon: "bi-calendar-check",
          path: "/attendance",
        },
        {
          name: "Leave",
          icon: "bi-calendar-minus",
          path: "/leave",
        },
        {
          name: "Leave Balance",
          icon: "bi-calendar2-check",
          path: "/leave-balance",
        },
        {
          name: "My Documents",
          icon: "bi-file-earmark-text",
          path: "/documents",
        },
        {
          name: "Performance",
          icon: "bi-clipboard-data",
          path: "/performance",
        },
        {
          name: "Payroll",
          icon: "bi-credit-card",
          path: "/payroll",
        },
        {
          name: "My Payments",
          icon: "bi-cash-stack",
          path: "/employee-payments",
        },
        {
          name: "Communication",
          icon: "bi-chat-dots",
          path: "/communication",
        },
      ],
    },
  ];

  // =========================
  // CLIENT MENU
  // =========================
  const clientMenu = [
    {
      section: "MY LEGAL MATTERS",
      items: [
        {
          name: "Overview",
          icon: "bi-grid-1x2",
          path: "/dashboard",
        },
        {
          name: "My Profile",
          icon: "bi-person",
          path: "/profile",
        },
        {
          name: "My Cases",
          icon: "bi-folder2-open",
          path: "/cases",
        },
        {
          name: "Appointments",
          icon: "bi-calendar3",
          path: "/appointments",
        },
        {
          name: "Documents",
          icon: "bi-file-earmark-text",
          path: "/documents",
        },
        {
          name: "Payments",
          icon: "bi-credit-card",
          path: "/client-payments",
        },
        {
          name: "Communication",
          icon: "bi-chat-dots",
          path: "/communication",
        },
      ],
    },
  ];

  // =========================
  // SELECT MENU BY ROLE
  // =========================
  let menuSections = [];

  if (user?.role === "admin") {
    menuSections = adminMenu;
  } else if (user?.role === "lawyer") {
    menuSections = lawyerMenu;
  } else if (user?.role === "hr") {
    menuSections = hrMenu;
  } else if (user?.role === "accountant") {
    menuSections = accountantMenu;
  } else if (user?.role === "employee") {
    menuSections = employeeMenu;
  } else if (user?.role === "client") {
    menuSections = clientMenu;
  }

  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="sidebar-header">

        <div className="brand-mark">
          PL
        </div>

        <div className="brand-content">

          <h5>
            Peter Lawrence
          </h5>

          <small>
            Legal ERP & CRM
          </small>

        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="sidebar-navigation">

        {menuSections.map(
          (section) => (

            <div
              className="sidebar-section"
              key={section.section}
            >

              <div className="sidebar-section-title">
                {section.section}
              </div>

              <div className="sidebar-section-items">

                {section.items.map(
                  (item) => (

                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `sidebar-link ${
                          isActive
                            ? "active"
                            : ""
                        }`
                      }
                    >

                      <span className="sidebar-icon">

                        <i
                          className={`bi ${item.icon}`}
                        ></i>

                      </span>

                      <span className="sidebar-label">
                        {item.name}
                      </span>

                    </NavLink>

                  )
                )}

              </div>

            </div>

          )
        )}

      </nav>


      {/* USER INFORMATION */}
      <div className="sidebar-user">

        <div className="sidebar-user-avatar">

          {user?.name
            ?.charAt(0)
            ?.toUpperCase() || "U"}

        </div>

        <div className="sidebar-user-info">

          <div className="sidebar-user-name">
            {user?.name || "User"}
          </div>

          <div className="sidebar-user-role">
            {user?.role || "User"}
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;